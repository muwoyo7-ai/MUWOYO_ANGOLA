import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/muwoyo-logo.png";

/**
 * Wraps protected pages and shows a blocking modal when the user has 0 messages remaining.
 * Cannot be dismissed only resolves when credits are recharged (via admin action or future payment flow).
 */
export default function CreditGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [blocked, setBlocked] = useState(false);
  const [checked, setChecked] = useState(false);

  const check = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("messages_received, message_limit, onboarding_completed")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!data?.onboarding_completed) {
      setChecked(true);
      return;
    }
    const remaining =
      Number(data?.message_limit || 0) - Number(data?.messages_received || 0);
    setBlocked(remaining <= 0 && Number(data?.message_limit || 0) > 0);
    setChecked(true);
  };

  useEffect(() => {
    check();
    if (!user) return;
    const ch = supabase
      .channel(`credit-gate-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `user_id=eq.${user.id}`,
        },
        check,
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user]);

  if (!checked) return <>{children}</>;
  return (
    <>
      {children}
      {blocked && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur p-4">
          <Card className="w-full max-w-md border-destructive/40 shadow-2xl">
            <CardContent className="space-y-4 p-6 text-center">
              <img
                src={logo}
                alt="Muwoyo"
                className="mx-auto h-14 w-14 object-contain"
              />
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <h2 className="text-xl font-bold">Mensagens esgotadas</h2>
              <p className="text-sm text-muted-foreground">
                A sua automação foi pausada porque chegou a 0 mensagens.
                Recarregue agora para continuar a atender os seus clientes
                automaticamente.
              </p>
              <Button
                className="w-full"
                size="lg"
                onClick={() => navigate("/recargas")}
              >
                Recarregar agora
              </Button>
              <p className="text-xs text-muted-foreground">
                Assim que a recarga for confirmada, tudo volta ao normal.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
