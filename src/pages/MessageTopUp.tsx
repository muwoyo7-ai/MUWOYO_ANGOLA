import DashboardShell from "@/components/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Check } from "lucide-react";

const SUPPORT = "244928663898";
type Pack = { id: string; name: string; messages: number; price_kz: number };

export default function MessageTopUp() {
  const { user } = useAuth();
  const [packs, setPacks] = useState<Pack[]>([]);
  const [phone, setPhone] = useState("");

  useEffect(() => {
    supabase
      .from("top_up_packages")
      .select("id,name,messages,price_kz")
      .eq("is_active", true)
      .order("position")
      .then(({ data }) => setPacks((data as any) || []));
    if (user)
      supabase
        .from("profiles")
        .select("phone")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }: any) => setPhone(data?.phone || ""));
  }, [user]);

  const buy = (p: Pack) => {
    const text = `Olá Muwoyo! Quero comprar o pacote *${p.name}* (${p.messages} mensagens) por ${p.price_kz.toLocaleString("pt-AO")} Kz.\nMeu telefone: +${phone || "-"}\nEmail: ${user?.email || "-"}`;
    window.open(
      `https://wa.me/${SUPPORT}?text=${encodeURIComponent(text)}`,
      "_blank",
    );
  };

  return (
    <DashboardShell
      title="Recarregar mensagens"
      description="Escolha um pacote - finalizamos pelo WhatsApp."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {packs.map((p) => (
          <Card
            key={p.id}
            className="border-border/60 shadow-sm transition hover:shadow-lg"
          >
            <CardHeader>
              <CardTitle className="text-lg">{p.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-3xl font-bold text-primary">
                  {p.messages.toLocaleString("pt-AO")}
                </div>
                <div className="text-sm text-muted-foreground">mensagens</div>
              </div>
              <div className="text-2xl font-bold">
                {p.price_kz.toLocaleString("pt-AO")} Kz
              </div>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" /> Sem prazo de
                  validade
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" /> Reativa
                  automação
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" /> Ativação
                  imediata
                </li>
              </ul>
              <Button className="w-full" onClick={() => buy(p)}>
                Comprar agora
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
