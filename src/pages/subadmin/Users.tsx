import { useEffect, useState, useCallback } from "react";
import SubAdminShell from "@/components/SubAdminShell";
import { supabase, Database } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ban, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Row = Database["public"]["Tables"]["profiles"]["Row"] & { role?: string };

export default function Users() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<Row[]>([]);
  const [search, setSearch] = useState("");

  const call = async (body: any) => {
    const { error, data } = await supabase.functions.invoke("admin-users", {
      body,
    });
    if (error || data?.error) {
      toast({
        title: "Erro",
        description: error?.message || data.error,
        variant: "destructive",
      });
      return false;
    }
    toast({ title: "Ação concluída com sucesso!" });
    return true;
  };

  const load = useCallback(async () => {
    if (!user) return;
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false })
      .returns<Row[]>();
    setUsers(profiles || []);
  }, [user]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("subadmin-users-rt")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => load(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search),
  );

  return (
    <SubAdminShell title="Meus Usuários" search={search} onSearch={setSearch}>
      <Card>
        <CardHeader>
          <CardTitle>Usuários Criados por Mim</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
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
                {filteredUsers.map((u) => (
                  <tr key={u.user_id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{u.full_name}</td>
                    <td>+{u.phone}</td>
                    <td>
                      {new Date(u.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td>
                      {Number(u.message_limit || 0) -
                        Number(u.messages_received || 0)}{" "}
                      / {u.message_limit || 0}
                    </td>
                    <td>{u.is_suspended ? "Suspenso" : "Ativo"}</td>
                    <td className="space-x-2 text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          call({
                            action: "suspendUser",
                            userId: u.user_id,
                            suspended: !u.is_suspended,
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
          </div>
        </CardContent>
      </Card>
    </SubAdminShell>
  );
}
