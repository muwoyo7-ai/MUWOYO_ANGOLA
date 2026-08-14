import { motion } from "framer-motion";
import { Users, MessageCircle, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CommunitySection() {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Users,
      title: "Rede de Empreendedores",
      description:
        "Conecte-se com outros negociantes que usam Muwoyo e compartilhe estratégias de sucesso.",
    },
    {
      icon: MessageCircle,
      title: "Suporte Direto",
      description:
        "Comunidade ativa pronta para ajudar com dúvidas e dicas sobre como maximizar a IA.",
    },
    {
      icon: Lightbulb,
      title: "Dicas e Estratégias",
      description:
        "Aprenda com casos de sucesso e descubra novas formas de usar a plataforma.",
    },
  ];

  return (
    <section id="comunidade" className="py-20 lg:py-28 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16 lg:mb-24">
            {/* Image */}
            <div className="flex justify-center lg:justify-start order-2 lg:order-1">
              <motion.img
                src="https://i.ibb.co/pv6tgXJL/04e7493f-b2da-4ffe-9309-685b271d1f76.png"
                alt="Comunidade Muwoyo"
                className="w-full h-auto rounded-2xl shadow-2xl max-w-md"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              />
            </div>

            {/* Content */}
            <div className="space-y-6 order-1 lg:order-2">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-primary uppercase tracking-wider">
                  Junte-se à comunidade
                </p>
                <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
                  Comunidade de
                  <br />
                  <span className="text-primary">Empreendedores Muwoyo</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Faça parte de uma comunidade vibrante de negociantes que usam
                  Muwoyo para transformar seus negócios. Compartilhe experiências,
                  aprenda com outros, e cresça junto.
                </p>
              </div>

              <button
                onClick={() => navigate("/login")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto"
              >
                Conhecer a Comunidade
              </button>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={idx}
                  className="rounded-2xl border border-border bg-card p-8 space-y-4 hover:shadow-lg transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
