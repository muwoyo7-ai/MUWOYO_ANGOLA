import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const includes = [
  "Atendente IA dedicado no WhatsApp",
  "Loja online personalizada com a sua logo",
  "Cadastro ilimitado de produtos",
  "Link e QR Code únicos da loja",
  "Checkout automático via WhatsApp",
  "Dashboard com mensagens, pedidos e visitas",
  "Bloqueio de contactos e controlo manual",
  "Conexão WhatsApp via QR Code ou pareamento",
  "Suporte dedicado em português",
];

export const SetupSection = () => {
  return (
    <section id="setup" className="py-24 lg:py-32 bg-surface-subtle">
      <div className="container-prose">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            Preço
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Pagamento único.
            <br />
            Sem mensalidade.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Uma taxa única de setup ativa a sua conta com tudo incluído. Sem
            cobranças mensais escondidas.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-1 gap-8 justify-items-center">
          {/* Card do Setup Muwoyo */}
          <div className="relative rounded-2xl border border-border bg-card shadow-premium overflow-hidden lg:grid lg:grid-cols-2 w-full max-w-sm mx-auto lg:max-w-none lg:mx-0">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-primary-glow to-primary" />
            <div className="p-6 lg:p-10">
              <div className="inline-flex items-center rounded-full bg-accent text-primary-deep px-3 py-1 text-xs font-semibold mb-5">
                Plano único
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-2">
                Setup Muwoyo
              </h3>
              <p className="text-muted-foreground mb-4 lg:mb-6 text-sm lg:text-base">
                Tudo o que precisa para automatizar o seu atendimento e vender
                online.
              </p>
              <ul className="space-y-2 lg:space-y-3">
                {includes.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2.5 text-sm lg:text-sm text-foreground"
                  >
                    <Check
                      className="h-4 w-4 text-primary shrink-0 mt-0.5"
                      strokeWidth={2.5}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-muted p-6 lg:p-10 flex flex-col justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pagamento único</p>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl lg:text-5xl font-bold text-foreground tabular-nums">
                    22.500
                  </span>
                  <span className="text-lg font-semibold text-muted-foreground">
                    Kz
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Taxa de ativação única
                </p>
              </div>
              <div className="mt-6">
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-foreground hover:bg-foreground/90 text-background rounded-xl h-12 font-semibold"
                >
                  <Link to="/login">Criar a minha conta</Link>
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Setup em até 24h. Sem fidelização.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SetupSection;
