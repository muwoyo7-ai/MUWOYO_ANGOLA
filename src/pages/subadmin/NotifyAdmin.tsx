import { FormEvent, useState } from "react";
import SubAdminShell from "@/components/SubAdminShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function NotifyAdmin() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [notice, setNotice] = useState({
    title: "",
    message: "",
  });

  const sendNotice = async (e: FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.functions.invoke("admin-users", {
      body: {
        action: "sendNotification",
        title: `Mensagem de ${user?.email}: ${notice.title}`,
        message: notice.message,
        targetRole: "admin",
      },
    });

    if (error) {
      toast({
        title: "Erro ao enviar notificação",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Notificação enviada com sucesso!" });
      setNotice({ title: "", message: "" });
    }
  };

  return (
    <SubAdminShell title="Mensagem ao Admin">
      <Card>
        <CardHeader>
          <CardTitle>Enviar Mensagem para o Administrador</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={sendNotice} className="space-y-4">
            <Input
              required
              placeholder="Assunto"
              value={notice.title}
              onChange={(e) => setNotice({ ...notice, title: e.target.value })}
            />
            <Textarea
              required
              placeholder="Sua mensagem..."
              value={notice.message}
              onChange={(e) =>
                setNotice({ ...notice, message: e.target.value })
              }
              rows={6}
            />
            <Button type="submit" className="w-full">
              Enviar Mensagem
            </Button>
          </form>
        </CardContent>
      </Card>
    </SubAdminShell>
  );
}
