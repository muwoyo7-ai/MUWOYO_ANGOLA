import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "A IA consegue entender diferentes sotaques e dialetos?",
    answer:
      "Sim! Nossa IA é treinada para compreender diversos sotaques e dialetos do português, incluindo variações de Angola, Portugal e Moçambique. Ela aprende com cada interação para melhorar ainda mais o atendimento.",
  },
  {
    question: "Posso integrar a Muwoyo com meus sistemas atuais?",
    answer:
      "Sim! A Muwoyo oferece integrações com Google Sheets, Google Analytics, Google Calendar e muitas outras ferramentas através de API. Também é possível fazer integrações personalizadas conforme suas necessidades.",
  },
  {
    question: "Como é feito o treinamento da IA para meu negócio?",
    answer:
      "O treinamento é simples! Você fornece informações sobre seus produtos, serviços, preços e tom de voz desejado. Nossa IA analisa esse conteúdo e cria respostas personalizadas. Quanto mais informações você fornecer, melhor será o atendimento.",
  },
  {
    question: "O que acontece se eu atingir o limite de mensagens?",
    answer:
      "Você receberá notificações quando estiver próximo do limite. Após atingir o limite, a IA continuará respondendo, mas você será notificado para fazer upgrade. Nenhuma conversa será perdida e seus clientes sempre serão atendidos.",
  },
  {
    question: "Como funciona a loja online incluída?",
    answer:
      "A loja online é um bônus exclusivo para assinantes Muwoyo. Ela vem personalizada com sua marca (logo e cores), permite cadastro ilimitado de produtos, aceita pagamentos via transferência bancária e é totalmente integrada ao WhatsApp para automação de vendas.",
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer:
      "Sim! Você pode cancelar sua assinatura a qualquer momento diretamente no painel de controle. O cancelamento entra em vigor no final do período de faturamento atual, então você não perde nenhum dia pago. Não há multas ou taxas de cancelamento.",
  },
  {
    question: "O suporte é em português?",
    answer:
      "Sim! Todo nosso suporte é em português nativo, com atendimento via WhatsApp, email e chat. Nossa equipe está disponível para ajudar com configuração, dúvidas técnicas e estratégias para maximizar seus resultados com a Muwoyo.",
  },
];

const FAQSection = () => {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/3 to-background" />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">
            Perguntas Frequentes
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6">
            Tire suas <span className="gradient-text">dúvidas</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Tudo o que você precisa saber sobre a Muwoyo e como ela pode
            transformar seu negócio.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border/50 rounded-lg px-6 bg-card/50"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Ainda tem dúvidas? Entre em contato com nosso suporte
          </p>
          <a
            href="https://wa.me/244928663898"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            Falar com Suporte
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
