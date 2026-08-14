import { useEffect, useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  RefreshCw,
  Search,
  MessageCircle,
  DownloadCloud,
  Ban,
  RotateCcw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Contact = {
  id: string;
  name: string | null;
  phone_number: string;
  should_respond: boolean;
  last_message_at?: string | null;
};
type Blocked = {
  id: string;
  phone_number: string;
  reason: string | null;
  is_active: boolean;
};

export default function MyWhatsApp() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<Contact[]>([]);
  const [blocked, setBlocked] = useState<Blocked[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: c }, { data: b }] = await Promise.all([
      supabase
        .from("whatsapp_contacts")
        .select("id, name, phone_number, should_respond, last_message_at")
        .eq("user_id", user.id)
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .limit(500),
      supabase
        .from("blocked_contacts")
        .select("id, phone_number, reason, is_active")
        .eq("user_id", user.id)
        .eq("is_active", true),
    ]);
    setRows((c as Contact[]) || []);
    setBlocked((b as Blocked[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const toggleRespond = async (c: Contact) => {
    setRows((r) =>
      r.map((x) =>
        x.id === c.id ? { ...x, should_respond: !c.should_respond } : x,
      ),
    );
    await supabase
      .from("whatsapp_contacts")
      .update({ should_respond: !c.should_respond })
      .eq("id", c.id);
  };

  const blockContact = async (c: Contact) => {
    if (!user) return;
    await supabase
      .from("blocked_contacts")
      .insert({
        user_id: user.id,
        phone_number: c.phone_number,
        is_active: true,
      });
    toast({ title: "Contacto bloqueado" });
    load();
  };

  const unblock = async (b: Blocked) => {
    await supabase
      .from("blocked_contacts")
      .update({ is_active: false })
      .eq("id", b.id);
    toast({ title: "Desbloqueado" });
    load();
  };

  const importFromWhatsApp = async () => {
    setImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("evolution-api", {
        body: { action: "importContacts" },
      });
      setImporting(false);
      if (error) {
        console.warn("Function importContacts not available:", error.message);
        return toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
      }
      toast({ title: `${data?.imported || 0} contactos sincronizados` });
      load();
    } catch (error) {
      setImporting(false);
      console.warn("Function call failed:", error);
      toast({
        title: "Erro",
        description: "Erro ao conectar com o servidor",
        variant: "destructive",
      });
    }
  };

  const filtered = useMemo(
    () =>
      rows.filter((r) =>
        `${r.name || ""} ${r.phone_number}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [rows, search],
  );
  const filteredBlocked = useMemo(
    () => blocked.filter((b) => b.phone_number.includes(search)),
    [blocked, search],
  );

  return (
    <DashboardShell
      title="Meu WhatsApp"
      description="Contactos e bloqueios da sua conta WhatsApp."
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar contacto ou número"
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          onClick={importFromWhatsApp}
          disabled={importing}
          className="gap-2"
        >
          <DownloadCloud
            className={`h-4 w-4 ${importing ? "animate-bounce" : ""}`}
          />{" "}
          {importing ? "A importar..." : "Importar do WhatsApp"}
        </Button>
        <Button
          variant="outline"
          onClick={load}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />{" "}
          Atualizar
        </Button>
      </div>

      <Tabs defaultValue="contacts">
        <TabsList className="grid w-full grid-cols-2 sm:w-auto">
          <TabsTrigger value="contacts">
            Meus contactos ({filtered.length})
          </TabsTrigger>
          <TabsTrigger value="blocked">
            Bloqueados ({filteredBlocked.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="grid gap-3">
          {filtered.map((c) => {
            const initials = (c.name || c.phone_number)
              .slice(0, 2)
              .toUpperCase();
            const last = c.last_message_at
              ? new Date(c.last_message_at).toLocaleString("pt-AO", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : null;
            return (
              <Card key={c.id} className="overflow-hidden">
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.name || c.phone_number)}&backgroundColor=16a34a&textColor=ffffff`}
                        alt={c.name || c.phone_number}
                      />
                      <AvatarFallback className="bg-primary/15 font-semibold text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="truncate font-semibold">
                        {c.name || "Contacto WhatsApp"}
                      </div>
                      <div className="truncate text-sm text-muted-foreground">
                        +{c.phone_number}
                      </div>
                      {last && (
                        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                          <MessageCircle className="h-3 w-3" />
                          {last}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      variant={c.should_respond ? "destructive" : "default"}
                      onClick={() => toggleRespond(c)}
                    >
                      {c.should_respond ? "Não responder" : "Responder"}
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => blockContact(c)}
                      title="Bloquear"
                    >
                      <Ban className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filtered.length === 0 && (
            <Card>
              <CardContent className="p-6 text-muted-foreground">
                Nenhum contacto. Use "Importar do WhatsApp" para puxar da sua
                conta conectada.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="blocked" className="grid gap-3">
          {filteredBlocked.length === 0 && (
            <Card>
              <CardContent className="p-6 text-muted-foreground">
                Nenhum contacto bloqueado.
              </CardContent>
            </Card>
          )}
          {filteredBlocked.map((b) => (
            <Card key={b.id}>
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div>
                  <div className="font-semibold">+{b.phone_number}</div>
                  {b.reason && (
                    <div className="text-xs text-muted-foreground">
                      {b.reason}
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => unblock(b)}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" /> Desbloquear
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
