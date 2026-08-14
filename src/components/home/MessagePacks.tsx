import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageSquare, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type TopUpPack = {
  id: string;
  name: string;
  messages: number;
  price_kz: number;
  position?: number;
};

export const MessagePacks = () => {
  const [packs, setPacks] = useState<TopUpPack[]>([]);

  useEffect(() => {
    const loadPacks = async () => {
      const { data, error } = await supabase
        .from("top_up_packages")
        .select("id,name,messages,price_kz,position")
        .eq("is_active", true)
        .order("position", { ascending: true });

      if (!error) {
        setPacks((data as TopUpPack[]) || []);
      }
    };

    void loadPacks();
  }, []);
  return (
    <section id="messages" className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            Pacotes de mensagens
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Recarregue mensagens
            <br />
            quando precisar.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Após a ativação da sua conta, escolha o pacote de mensagens que faz
            sentido para o volume do seu negócio. Sem mensalidade, sem
            fidelização.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {packs.map((p, index) => (
            <div
              key={p.id}
              className={`relative rounded-2xl border bg-card p-6 flex flex-col ${
                index === 1
                  ? "border-primary shadow-elevated ring-1 ring-primary/20"
                  : "border-border shadow-soft"
              }`}
            >
              {index === 1 && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full bg-foreground text-background px-3 py-1 text-[11px] font-semibold tracking-wide">
                  Mais escolhido
                </span>
              )}

              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-accent text-primary mb-4">
                <MessageSquare className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                {p.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {p.messages.toLocaleString("pt-AO")} mensagens
              </p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground tabular-nums">
                  {p.price_kz.toLocaleString("pt-AO")}
                </span>
                <span className="text-sm font-semibold text-muted-foreground">
                  Kz
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                ≈ {(p.price_kz / p.messages).toLocaleString("pt-AO", { maximumFractionDigits: 2 })} Kz por mensagem
              </p>

              <ul className="mt-5 space-y-2 text-xs text-foreground">
                <li className="flex gap-2">
                  <Check
                    className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5"
                    strokeWidth={3}
                  />
                  Mensagens com a IA Muwoyo
                </li>
                <li className="flex gap-2">
                  <Check
                    className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5"
                    strokeWidth={3}
                  />
                  Sem expiração mensal
                </li>
                <li className="flex gap-2">
                  <Check
                    className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5"
                    strokeWidth={3}
                  />
                  Recarga simples no painel
                </li>
              </ul>

              <Button
                asChild
                className={`mt-6 w-full rounded-xl h-11 font-semibold ${
                  index === 1
                    ? "bg-foreground hover:bg-foreground/90 text-background"
                    : "bg-secondary hover:bg-secondary/80 text-foreground"
                }`}
              >
                <Link to="/login">Comprar agora</Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-10">
          Os pacotes são adquiridos após a ativação da conta (taxa única de
          22.500 Kz).
        </p>
      </div>
    </section>
  );
};
