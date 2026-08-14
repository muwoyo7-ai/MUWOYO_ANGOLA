import { CheckCircle2 } from "lucide-react";
import integrationsWoman from "@/assets/integrations-woman.jpg";

const integrations = [
  {
    name: "Google Sheets",
    icon: "https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg",
    description:
      "Sincronize pedidos, clientes e inventário em tempo real com as suas folhas de cálculo.",
  },
  {
    name: "Google Analytics",
    icon: "https://upload.wikimedia.org/wikipedia/commons/7/77/GAnalytics.svg",
    description:
      "Acompanhe conversões, funil de venda e comportamento dos clientes automaticamente.",
  },
  {
    name: "Google Calendar",
    icon: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg",
    description: "Agende reuniões, demos e follow-ups que saem do WhatsApp.",
  },
];

const aiFeatures = [
  "Cadastro automático de leads e clientes",
  "Agendamento inteligente de reuniões e demos",
  "Relatórios exportados automaticamente",
  "IA que analisa dados e sugere ações",
];

export default function IntegrationsSection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header + Image - side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
              Ferramentas{" "}
              <span className="text-green-500">Pré-Configuradas</span> Para
              Melhorar a sua experiencia com a
              <span className="text-green-500"> Muwoyo</span>
            </h2>
            <p className="text-muted-foreground mt-4 text-base md:text-lg leading-relaxed">
              O Google Sheets, o Google Analytics e o Google Calendar já chegam
              pré-configurados dentro do painel Muwoyo. Não precisas de instalar
              nada, não precisas de configurar integrações, não precisas de
              ligar uma ferramenta à outra. Tudo já está pronto e a funcionar
              desde o momento em que activas a tua conta. A partir daí, a IA
              trata de tudo. Cadastra os clientes automaticamente, agenda
              reuniões e atendimentos sem que precises de tocar na agenda, e
              gera relatórios com os dados reais do teu negócio sem qualquer
              exportação manual. Tu acompanhas tudo em tempo real directamente
              no teu painel Muwoyo, num único lugar, a partir de qualquer
              dispositivo. Sem configurações. Sem integrações. Sem trabalho
              extra. Só resultados.
            </p>
          </div>
          <div className="flex justify-center">
            <img
              src={integrationsWoman}
              alt="Mulher a trabalhar com integrações"
              className="rounded-2xl w-full max-w-md object-cover shadow-lg aspect-[4/3]"
              loading="lazy"
            />
          </div>
        </div>

        {/* Integration cards with real logos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {integrations.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-8 hover:shadow-md transition-shadow"
            >
              <img
                src={item.icon}
                alt={item.name}
                className="h-12 w-12 mb-5 object-contain"
                loading="lazy"
              />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {item.name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* AI Features box */}
        <div className="rounded-xl bg-accent/50 border border-primary/10 p-8">
          <h3 className="text-lg font-bold text-foreground text-center mb-6">
            O que a IA faz com as suas integrações
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiFeatures.map((feat, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
