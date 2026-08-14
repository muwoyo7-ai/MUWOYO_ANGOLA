import { FormEvent, useEffect, useState } from "react";
import {
  Ban,
  Coins,
  MessageSquarePlus,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import AdminShell from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { RoleFixer } from "@/components/RoleFixer";
import { useRole } from "@/hooks/useRole";

type Row = {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  status: string | null;
  is_suspended: boolean | null;
  message_limit: number | null;
  messages_received: number | null;
  created_at: string | null;
  business_name: string | null;
};
const sb = supabase as any;
export default function SubAdminDashboard() {
  const { user } = useAuth();
  const { role, loading: roleLoading } = useRole();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [notice, setNotice] = useState({ title: "", message: "" });
  const [msg, setMsg] = useState({ userId: "", amount: "" });
  const [editLimit, setEditLimit] = useState<{ userId: string; limit: string }>({ userId: "", limit: "" });
  const load = async () => {
    if (!user) return;
    const { data } = await sb
      .from("profiles")
      .select(
        "user_id,full_name,phone,status,is_suspended,message_limit,messages_received,created_at,business_name",
      )
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });
    setRows(data || []);
  };
  useEffect(() => {
    load();
    if (!user) return;
    const ch = supabase
      .channel(`sub-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        load,
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user]);
  const call = async (body: any) => {
    try {
      // Log para debug do token
      const session = await supabase.auth.getSession();
      console.log(
        "Token para admin-users:",
        session.data.session?.access_token?.substring(0, 20) + "...",
      );

      const { error, data } = await supabase.functions.invoke("admin-users", {
        body,
      });
      if (error || data?.error) {
        console.error("Erro na função admin-users:", error, data);
        toast({
          title: "Erro",
          description:
            error?.message ||
            data?.error ||
            "Erro desconhecido na função admin",
          variant: "destructive",
        });
        return false;
      }
      toast({ title: "Concluído" });
      load();
      return true;
    } catch (error) {
      console.error("Erro ao chamar função admin-users:", error);
      toast({
        title: "Erro crítico",
        description:
          error instanceof Error
            ? error.message
            : "Erro ao conectar com o servidor",
        variant: "destructive",
      });
      return false;
    }
  };
  const create = async (e: FormEvent) => {
    e.preventDefault();
    if (await call({ action: "createUser", ...form })) {
      setForm({ name: "", email: "", phone: "", password: "" });
      setOpen(false);
    }
  };
  const filtered = rows.filter((r) =>
    `${r.full_name || ""} ${r.phone || ""} ${r.business_name || ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const active = rows.filter(
    (r) => !r.is_suspended && r.status !== "suspended",
  ).length;
  const suspended = rows.length - active;
  const empty = rows.filter(
    (r) => Number(r.message_limit || 0) - Number(r.messages_received || 0) <= 0,
  ).length;

  // Verificar se o usuário tem role adequada
  if (roleLoading) {
    return (
      <AdminShell mode="sub" title="Muwoyo Gestor">
        <div className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">Carregando...</div>
        </div>
      </AdminShell>
    );
  }

  if (!role || role === "client") {
    return (
      <AdminShell mode="sub" title="Muwoyo Gestor">
        <div className="container mx-auto p-6">
          <RoleFixer
            userId={user?.id || ""}
            currentRole={role}
            onRoleUpdated={() => window.location.reload()}
          />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      mode="sub"
      title="Muwoyo Gestor"
      search={search}
      onSearch={setSearch}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Meus usuários" value={rows.length} icon={<Users />} />
        <Stat label="Ativos" value={active} icon={<Users />} />
        <Stat label="Suspendidos" value={suspended} icon={<Ban />} />
        <Stat
          label="Comissões"
          value={`${(rows.length * 2500).toLocaleString("pt-AO")} Kz`}
          icon={<Coins />}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Cadastrar usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar usuário</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo usuário para criar uma conta no
                sistema.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={create} className="space-y-3">
              <Input
                required
                placeholder="Nome completo"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                required
                type="email"
                placeholder="Email real do usuário"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Input
                required
                placeholder="Telefone (com DDI)"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })
                }
              />
              <Input
                required
                type="password"
                placeholder="Senha (mín. 6)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <Button className="w-full">Cadastrar</Button>
            </form>
          </DialogContent>
        </Dialog>
        <Card className="flex-1">
          <CardContent className="p-4 text-sm text-muted-foreground">
            Usuários sem mensagens: <b className="text-foreground">{empty}</b>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Usuários cadastrados por mim</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-3">Nome</th>
                <th>Telefone</th>
                <th>Data</th>
                <th>Mensagens</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.user_id} className="border-b last:border-0">
                  <td className="py-3 font-medium">
                    {u.full_name || u.business_name}
                  </td>
                  <td>+{u.phone}</td>
                  <td>
                    {u.created_at
                      ? new Date(u.created_at).toLocaleDateString("pt-AO")
                      : "-"}
                  </td>
                  <td>
                    {Number(u.message_limit || 0) -
                      Number(u.messages_received || 0)}{" "}
                    / {u.message_limit || 0}
                  </td>
                  <td>
                    {u.is_suspended || u.status === "suspended"
                      ? "Suspenso"
                      : "Ativo"}
                  </td>
                  <td className="space-x-2 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setMsg({ userId: u.user_id, amount: "" })}
                    >
                      Recarregar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditLimit({ userId: u.user_id, limit: String(u.message_limit || 0) })}
                    >
                      Limite
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        call({
                          action: "suspendUser",
                          userId: u.user_id,
                          suspended: !(
                            u.is_suspended || u.status === "suspended"
                          ),
                        })
                      }
                    >
                      <Ban className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        call({ action: "deleteUser", userId: u.user_id })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Enviar mensagem ao Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              call({
                action: "sendNotification",
                targetRole: "admin",
                ...notice,
              });
              setNotice({ title: "", message: "" });
            }}
          >
            <Input
              required
              placeholder="Título"
              value={notice.title}
              onChange={(e) => setNotice({ ...notice, title: e.target.value })}
            />
            <Textarea
              required
              placeholder="Mensagem"
              value={notice.message}
              onChange={(e) =>
                setNotice({ ...notice, message: e.target.value })
              }
            />
            <Button className="w-fit">Enviar ao admin</Button>
          </form>
        </CardContent>
      </Card>
      <Dialog
        open={!!msg.userId}
        onOpenChange={() => setMsg({ userId: "", amount: "" })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recarregar mensagens</DialogTitle>
            <DialogDescription>
              Adicione mais mensagens ao limite do usuário selecionado.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="number"
            placeholder="Quantidade"
            value={msg.amount}
            onChange={(e) => setMsg({ ...msg, amount: e.target.value })}
          />
          <Button
            onClick={() =>
              call({
                action: "addMessages",
                userId: msg.userId,
                amount: Number(msg.amount),
              })
            }
          >
            Adicionar
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!editLimit.userId}
        onOpenChange={() => setEditLimit({ userId: "", limit: "" })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar limite de mensagens</DialogTitle>
          </DialogHeader>
          <Input
            type="number"
            placeholder="Limite total"
            value={editLimit.limit}
            onChange={(e) => setEditLimit({ ...editLimit, limit: e.target.value })}
          />
          <Button
            onClick={() =>
              call({
                action: "setMessageLimit",
                userId: editLimit.userId,
                limit: Number(editLimit.limit),
              })
            }
          >
            Guardar
          </Button>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
function Stat({ label, value, icon }: any) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
        <div className="rounded-md bg-primary/10 p-3 text-primary">{icon}</div>
      </CardContent>
    </Card>
  );
}
