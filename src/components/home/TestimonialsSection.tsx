import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Kwame Nzinga",
    role: "Dono de Loja de Roupas",
    country: "🇦🇴 Angola",
    content:
      "A Muwoyo transformou o meu negócio! Antes perdia muitos clientes porque não conseguia responder a tempo. Agora a IA responde 24h por dia e as vendas aumentaram 45%.",
    rating: 5,
    metric: "+45% vendas",
    img: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=80&h=80&fit=crop&crop=face",
  },
  {
    name: "Beatriz Mendes",
    role: "Proprietária de Restaurante",
    country: "🇧🇷 Brasil",
    content:
      "Comecei a usar com receio, achei que a IA não ia entender meus clientes. Mas depois de ajustar o tom e treinar com as perguntas certas, ficou perfeito! Recomendo muito.",
    rating: 4,
    metric: "Superou expectativas",
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face",
  },
  {
    name: "António Cambinda",
    role: "CEO de Consultoria",
    country: "🇦🇴 Angola",
    content:
      "No início tive dificuldades com a configuração e achei que não ia funcionar para consultoria. Mas o suporte me ajudou e agora a IA qualifica os leads antes de eu entrar na conversa. Incrível!",
    rating: 4,
    metric: "De cético a fã",
    img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face",
  },
  {
    name: "Fernanda Costa",
    role: "Loja Online de Cosméticos",
    country: "🇵🇹 Portugal",
    content:
      "Estava a procura de uma solução que funcionasse com o mercado lusófono. A Muwoyo é perfeita para isso. A IA responde em português perfeito e os meus clientes adoram!",
    rating: 5,
    metric: "+60% eficiência",
    img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face",
  },
  {
    name: "Samuel Tchipaco",
    role: "Dono de Oficina Mecânica",
    country: "🇦🇴 Angola",
    content:
      "Confesso que no primeiro dia achei confuso e quase desisti. Mas depois que conectei o WhatsApp e configurei tudo, vi como é simples. Agora meus clientes marcam serviços sozinhos!",
    rating: 3,
    metric: "Início difícil, final feliz",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
  },
  {
    name: "Maria Joana",
    role: "Empreendedora Digital",
    country: "🇲🇿 Moçambique",
    content:
      "A melhor decisão que tomei para o meu negócio online. A IA fecha vendas enquanto eu durmo. Literalmente. Os meus clientes nem percebem que é automático.",
    rating: 5,
    metric: "Vendas 24/7",
    img: "https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?w=80&h=80&fit=crop&crop=face",
  },
];

const TestimonialsSection = () => {
  return (
    <section
      id="depoimentos"
      className="py-20 sm:py-28 relative overflow-hidden"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/3 to-background" />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">
            💬 Depoimentos
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6">
            O que nossos <span className="gradient-text">clientes dizem</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Histórias reais de negócios que transformaram o atendimento com a
            Muwoyo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <Card
              key={i}
              className="group border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 bg-card"
            >
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                    <AvatarImage src={t.img} alt={t.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {t.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{t.name}</h4>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                    <p className="text-xs text-muted-foreground">{t.country}</p>
                  </div>
                  <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {t.metric}
                  </span>
                </div>

                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star
                      key={si}
                      className={`w-4 h-4 ${si < t.rating ? "fill-primary text-primary" : "text-muted"}`}
                    />
                  ))}
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
