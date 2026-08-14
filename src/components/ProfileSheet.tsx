import { useEffect, useRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut, Pencil, Check, X, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

type Field = "full_name" | "phone" | "email" | "password" | null;

export default function ProfileSheet({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Field>(null);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || !user) return;
    setEmail(user.email || "");
    (supabase as any)
      .from("profiles")
      .select("full_name,phone,avatar_url")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }: any) => {
        setFullName(data?.full_name || "");
        setPhone(data?.phone || "");
        setAvatarUrl(data?.avatar_url || null);
      });
  }, [open, user]);

  const saveField = async (field: Field) => {
    if (!user || !field) return;
    setSaving(true);
    let err: string | null = null;
    if (field === "email") {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) err = error.message;
    } else if (field === "password") {
      if (!oldPassword || !newPassword) {
        setSaving(false);
        return toast({
          title: "Preencha senha antiga e nova",
          variant: "destructive",
        });
      }
      const { error: vErr } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: oldPassword,
      });
      if (vErr) err = "Senha actual incorrecta";
      else {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (error) err = error.message;
      }
    } else {
      const patch: any =
        field === "full_name"
          ? { full_name: fullName }
          : { phone: phone.replace(/\D/g, "") };
      const { error } = await supabase
        .from("profiles")
        .update(patch)
        .eq("user_id", user.id);
      if (error) err = error.message;
    }
    setSaving(false);
    if (err)
      return toast({ title: "Erro", description: err, variant: "destructive" });
    toast({ title: "Actualizado" });
    setEditing(null);
    setOldPassword("");
    setNewPassword("");
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    if (error)
      return toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase
      .from("profiles")
      .update({ avatar_url: pub.publicUrl } as any)
      .eq("user_id", user.id);
    setAvatarUrl(pub.publicUrl);
    toast({ title: "Avatar actualizado" });
  };

  const initials = (user?.email || "U").slice(0, 1).toUpperCase();

  const Body = (
    <>
      <div className="flex items-center gap-3 border-b p-4">
        <button
          onClick={() => fileRef.current?.click()}
          className="relative h-14 w-14 overflow-hidden rounded-full bg-primary/15 text-lg font-bold text-primary"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              {initials}
            </div>
          )}
          <div className="absolute inset-0 flex items-end justify-center bg-black/0 pb-1 opacity-0 transition-all hover:bg-black/30 hover:opacity-100">
            <Camera className="h-4 w-4 text-white" />
          </div>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) =>
            e.target.files?.[0] && uploadAvatar(e.target.files[0])
          }
        />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">
            {fullName || user?.email?.split("@")[0]}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {user?.email}
          </div>
        </div>
      </div>
      <div className="space-y-1 p-3">
        <Row
          label="Nome"
          value={fullName}
          editing={editing === "full_name"}
          onEdit={() => setEditing("full_name")}
          onCancel={() => setEditing(null)}
          onSave={() => saveField("full_name")}
          saving={saving}
        >
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-9"
          />
        </Row>
        <Row
          label="Telefone"
          value={phone}
          editing={editing === "phone"}
          onEdit={() => setEditing("phone")}
          onCancel={() => setEditing(null)}
          onSave={() => saveField("phone")}
          saving={saving}
        >
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-9"
          />
        </Row>
        <Row
          label="Email"
          value={email}
          editing={editing === "email"}
          onEdit={() => setEditing("email")}
          onCancel={() => setEditing(null)}
          onSave={() => saveField("email")}
          saving={saving}
        >
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-9"
          />
        </Row>
        <Row
          label="Senha"
          value="••••••••"
          editing={editing === "password"}
          onEdit={() => setEditing("password")}
          onCancel={() => setEditing(null)}
          onSave={() => saveField("password")}
          saving={saving}
        >
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Senha actual"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="h-9"
            />
            <Input
              type="password"
              placeholder="Nova senha"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-9"
            />
          </div>
        </Row>
      </div>
      <Separator />
      <div className="p-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={async () => {
            await signOut();
            navigate("/login");
          }}
        >
          <LogOut className="h-4 w-4" /> Terminar sessão
        </Button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="max-w-[calc(100vw-2rem)] gap-0 p-0 sm:max-w-md">
          {Body}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent side="right" align="end" className="w-[320px] p-0">
        {Body}
      </PopoverContent>
    </Popover>
  );
}

function Row({
  label,
  value,
  editing,
  onEdit,
  onCancel,
  onSave,
  saving,
  children,
}: any) {
  return (
    <div className="rounded-md p-2 hover:bg-accent/50">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        {!editing ? (
          <button
            onClick={onEdit}
            className="text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        ) : (
          <div className="flex gap-1">
            <button
              onClick={onCancel}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <button onClick={onSave} disabled={saving} className="text-primary">
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        )}
      </div>
      {editing ? (
        <div className="mt-1.5">{children}</div>
      ) : (
        <div className="truncate text-sm">
          {value || <span className="text-muted-foreground"> </span>}
        </div>
      )}
    </div>
  );
}
