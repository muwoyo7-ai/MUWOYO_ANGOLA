import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Importar imagens
import onlineStore from "@/assets/online-store.jpg";
import whatsappChat from "@/assets/whatsapp-chat.jpg";
import sales247 from "@/assets/sales-24-7.jpg";
import integrationsWoman from "@/assets/integrations-woman.jpg";
import heroWhatsAppStore from "@/assets/hero-whatsapp-store.jpg";

const FeaturesZigzag = () => {
  const navigate = useNavigate();

  const handleCreateStore = () => {
    navigate("/login");
  };

  const features = [
    {
      title: "Loja Online Profissional",
      highlight: "Completa e pronta para vender.",
      description:
        'Ao criares a tua conta na Muwoyo e assinares qualquer plano, recebes imediatamente um Bónus Extra: <span class="text-emerald-600">Uma Loja Online Profissional e 100% Pronta</span>.<br/><strong>Como funciona o teu Bónus?</strong><br/>Não precisas de contratar designers ou programadores. Nós entregamos a tua loja personalizada com a tua logo e as tuas cores.<br/>Tu apenas: Cadastras os teus produtos.<br/>A Loja faz: Tudo o resto. Partilhas o teu link no Instagram ou WhatsApp e os teus clientes compram diretamente lá.<br/><strong>Dinheiro Direto na Tua Conta</strong><br/>O cliente paga dentro da tua loja usando as tuas coordenadas bancárias. Não pagas taxas sobre as vendas nem precisas de intermediários. O dinheiro cai direto na tua conta bancária.',
      image: onlineStore,
      alt: "Loja online profissional",
    },
    {
      title: "IA treinada no seu negócio.",
      highlight: "Vende como o seu melhor funcionário.",
      description:
        "A inteligência Artificial que aprende sobre o seu negócio e vende por si. Tenha um funcionário digital treinado com os seus produtos, preços e tom de voz, pronto para fechar vendas e tirar dúvidas no WhatsApp 24h por dia, sem interrupções e que nunca dorme.",
      image: whatsappChat,
      alt: "IA treinada no seu negócio",
    },
    {
      title: "Vendas 24 horas por dia.",
      highlight: "O seu negócio nunca dorme.",
      description:
        "Venda 24h por dia sem depender de dados móveis ou bateria. A Inteligencia Artificial da Muwoyo mantém o seu whatsApp sempre online com atendimento 24/7 ,mesmo que você esteja a dormir ou sem internet. Se o cliente te enviar mensagem às 3h da manhã, ele será respondido e a venda será feita. O seu negócio nunca dorme, para que você possa descansar.",
      image: "https://i.ibb.co/gMKHJthB/4d8fa698-ae5d-49e6-a3e0-eec9613af22a.png",
      alt: "Vendas 24 horas por dia",
    },
    {
      title: "Painel Muwoyo",
      highlight: "Dashboard de performance. Decisões baseadas em dados.",
      description: `
        <div class="space-y-6">
          <div>
            <p class="text-gray-600 leading-relaxed">Todas as métricas do teu negócio centralizadas num único painel, em tempo real. Acompanhas conversões, receita e comportamento dos clientes sem abrir múltiplas ferramentas.</p>
          </div>
          
          <div class="border-l-4 border-emerald-500 pl-4">
            <p class="text-gray-700 font-medium mb-2">A IA cuida de tudo automaticamente:</p>
            <ul class="space-y-2 text-gray-600">
              <li class="flex items-start"><span class="text-emerald-600 mr-3">✓</span><span>Regista cada cliente, preenche pedidos com nome, localização, contacto e produtos solicitados</span></li>
              <li class="flex items-start"><span class="text-emerald-600 mr-3">✓</span><span>Agenda reuniões, atendimentos e reservas automaticamente</span></li>
              <li class="flex items-start"><span class="text-emerald-600 mr-3">✓</span><span>Gera relatórios diários, semanais e mensais com base nos dados reais do negócio</span></li>
            </ul>
          </div>

          <div class="bg-emerald-50 rounded-xl p-5 border border-emerald-200">
            <p class="text-gray-900 leading-relaxed"><span class="text-emerald-700 font-semibold">Dados reais, decisões mais rápidas e zero operação desnecessária.</span> Tu acompanhas o negócio. A Muwoyo trata do atendimento, dos registos e da agenda.</p>
          </div>
        </div>
      `,
      image: "https://i.ibb.co/20YbdFNH/8258ccc3-50ce-4dd7-8554-3e52d4af9926.png",
      alt: "Painel Muwoyo",
    },
  ];

  return (
    <section id="funcionalidades" className="py-20">
      <div className="container mx-auto px-6 space-y-24">
        {features.map((feature, i) => {
          const isReversed = i % 2 !== 0;

          if (i === 0) {
            return (
              <div
                key={i}
                className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center"
              >
                <div className="lg:col-span-3 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-3xl lg:text-4xl font-bold text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-xl text-emerald-600 font-semibold">
                      {feature.highlight}
                    </p>
                  </div>
                  <div
                    className="text-gray-600 leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{ __html: feature.description }}
                  />
                  <button
                    onClick={handleCreateStore}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Criar Minha Loja Gratuita Agora
                  </button>
                </div>
                <div className="lg:col-span-2">
                  <div className="relative">
                    <img
                      src={feature.image}
                      alt={feature.alt}
                      className="w-full h-auto rounded-2xl shadow-2xl"
                    />
                  </div>
                </div>
              </div>
            );
          }

          return (
            <motion.div
              key={i}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${isReversed ? "lg:flex-row-reverse" : ""}`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <>
                <div className={`space-y-6 ${isReversed ? "lg:order-2" : ""}`}>
                  <div className="space-y-4">
                    <h3 className="text-3xl lg:text-4xl font-bold text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-xl text-emerald-600 font-semibold">
                      {feature.highlight}
                    </p>
                  </div>
                  <div
                    className="text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: feature.description }}
                  />
                </div>
                <div
                  className={`${isReversed ? "lg:order-1" : ""} flex justify-center`}
                >
                  <img
                    src={feature.image}
                    alt={feature.alt}
                    className="w-full h-auto rounded-2xl shadow-2xl max-w-2xl"
                  />
                </div>
              </>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturesZigzag;
