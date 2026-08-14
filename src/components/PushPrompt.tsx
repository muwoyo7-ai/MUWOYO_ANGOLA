import React, { useEffect, useState } from "react";
import { initWebPush } from "@/lib/web-push";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function PushPrompt() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user) return; // only show when logged in
    const dismissed = window.localStorage.getItem("muwoyo_push_prompt_dismissed");
    if (dismissed) return;
    if (Notification && Notification.permission === "default") {
      setVisible(true);
    }
  }, [user]);

  const accept = async () => {
    try {
      const result = await initWebPush();
      if (result.ok) {
        toast({ title: "Notificações push ativadas com sucesso", description: "Agora receberás notificações neste dispositivo.", className: "bg-green-50 border-green-200" });
      } else {
        toast({ title: "Notificações não ativadas", description: result.reason, variant: "destructive" });
      }
      setVisible(false);
      window.localStorage.setItem("muwoyo_push_prompt_dismissed", "1");
    } catch (err) {
      console.error(err);
      toast({ title: "Erro", description: "Falha ao ativar notificações.", variant: "destructive" });
      setVisible(false);
      window.localStorage.setItem("muwoyo_push_prompt_dismissed", "1");
    }
  };

  const decline = () => {
    setVisible(false);
    window.localStorage.setItem("muwoyo_push_prompt_dismissed", "1");
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold">Ativar notificações</h3>
        <p className="mt-2 text-sm text-muted-foreground">Deseja receber notificações deste site?</p>
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn" onClick={decline}>Recusar</button>
          <button className="btn btn-primary" onClick={accept}>Aceitar</button>
        </div>
      </div>
    </div>
  );
}
