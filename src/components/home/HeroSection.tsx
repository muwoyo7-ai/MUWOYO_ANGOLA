"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, Clock, MessageCircle } from "lucide-react";

interface Message {
  text: string;
  from: "user" | "bot";
  img?: string;
  file?: string;
}

// Sequência de mensagens com imagens reais de roupas
const messagesSequence: Message[] = [
  {
    text: "Olá! Vi as camisas da Adama. Ainda têm a Polo branca?",
    from: "user",
  },
  {
    text: "Olá 👋 Temos sim! Temos vários modelos de polos e t-shirts premium. Qual tamanho você procura?",
    from: "bot",
  },
  { text: "Tamanho M. Pode enviar fotos?", from: "user" },
  { text: "Claro! Veja alguns modelos:", from: "bot" },
  {
    text: "Polo Premium Branca",
    from: "bot",
    img: "https://www.craftclothing.ph/cdn/shop/files/plain-poloshirt-white_8be48e11-c59a-401c-b536-9aa27941bb57_600x.png?v=1740992362",
  },
  {
    text: "T-shirt Casual Azul",
    from: "bot",
    img: "https://m.media-amazon.com/images/I/51NEYi89rHL._AC_UL1200_.jpg",
  },
  {
    text: "Camisa Social Cinza",
    from: "bot",
    img: "https://media.istockphoto.com/id/856917576/photo/formal-shirt-with-button-down-collar-isolated-on-white.jpg",
  },
  {
    text: "Jaqueta Streetwear Preta",
    from: "bot",
    img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
  },
  {
    text: "Gostei das duas primeiras. Tem algum desconto se eu levar mais de 2 peças?",
    from: "user",
  },
  {
    text: "Sim! Se levar 3 ou mais produtos, você ganha 10% de desconto no total 🤑",
    from: "bot",
  },
  {
    text: "Perfeito, vou levar Polo Branca + T-shirt Azul + Camisa Cinza",
    from: "user",
  },
  {
    text: "Ótima escolha! 😎 Atendemos em Cabinda, Angola. Antes de finalizar, introduza a sua hora de funcionamento.",
    from: "bot",
  },
  { text: "Vivo em Cabinda.", from: "user" },
  {
    text: "Perfeito! O frete sai a 2.000 Kz. Total com desconto: 46.200 Kz.",
    from: "bot",
  },
  {
    text: "Pagamento via IBAN:\nTitular: Adama Store\nIBAN: AO06 0000 1234 5678 9012 3456\nValor: 46.200 Kz",
    from: "bot",
  },
  {
    text: "Pagamento feito! Segue o comprovativo.",
    from: "user",
    file: "comprovativo.pdf",
  },
  {
    text: "Recebido ✅ Seu pedido chega em 24h. Obrigado pela preferência! 🎉",
    from: "bot",
  },
  {
    text: "Se quiser, posso mostrar mais modelos de roupas e promoções de hoje.",
    from: "bot",
  },
];

export default function HeroSection() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let i = 0;

    const showNext = () => {
      const msg = messagesSequence[i];
      if (!msg) return;

      if (msg.from === "bot") {
        setTyping(true);
        setTimeout(() => {
          setTyping(false);
          setMessages((prev) => [...prev, msg]);
          i++;
          if (i >= messagesSequence.length) {
            setTimeout(() => {
              setMessages([]);
              i = 0;
              showNext();
            }, 3000);
            return;
          }
          setTimeout(showNext, 1500);
        }, 1800);
      } else {
        setTimeout(() => {
          setMessages((prev) => [...prev, msg]);
          i++;
          if (i >= messagesSequence.length) {
            setTimeout(() => {
              setMessages([]);
              i = 0;
              showNext();
            }, 3000);
            return;
          }
          setTimeout(showNext, 1200);
        }, 1000);
      }
    };

    showNext();
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, typing]);

  return (
    <section className="relative min-h-screen flex items-center bg-white overflow-hidden pt-32 sm:pt-36 lg:pt-20">
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-emerald-400/10 blur-[120px] rounded-full"></div>

      <div className="container mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-8 items-start">
        {/* TEXTO */}
        <div className="space-y-6 sm:space-y-8 animate-fade-up lg:mt-24">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-950 leading-[1.1] tracking-tight">
            Automatize o atendimento no WhatsApp da sua empresa com a{" "}
            <span className="text-emerald-500">Muwoyo</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
            Transforme seu WhatsApp em uma central de vendas inteligente, capaz
            de responder instantaneamente, qualificar leads, agendar
            atendimentos, recuperar clientes e converter oportunidades em vendas
            24 horas por dia. Reduza o tempo de resposta, aumente a
            produtividade da equipa e ofereça uma experiência profissional que
            gera mais confiança e resultados.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {[
              { text: "Respostas em < 3 segundos", icon: Zap },
              { text: "Integração de Catálogo", icon: Shield },
              { text: "Atendimento 24/7", icon: Clock },
              { text: "IA de Sentimentos", icon: MessageCircle },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-3">
                <f.icon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-sm font-medium text-slate-600">
                  {f.text}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 justify-center sm:justify-start">
            <Button
              size="sm" // Reduzindo o tamanho
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6 sm:px-6 font-bold shadow-lg text-base sm:text-base py-4 sm:py-auto h-auto sm:h-10 min-h-[40px] sm:min-h-[36px]"
              asChild
            >
              <Link to="/login" className="flex items-center justify-center">
                Começar gratuitamente{" "}
                <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </Button>
            <Button
              size="sm" // Reduzindo o tamanho
              variant="outline"
              className="border-emerald-500 text-emerald-500 hover:bg-emerald-50 rounded-full px-4 sm:px-6 font-bold text-sm sm:text-base py-3 sm:py-auto h-auto sm:h-10 min-h-[36px] sm:min-h-[36px]"
              onClick={() => {
                const message = encodeURIComponent(
                  "Olá! Gostaria de saber como a Muwoyo funciona.",
                );
                window.open(
                  `https://wa.me/244928663898?text=${message}`,
                  "_blank",
                );
              }}
            >
              Ver como funciona
            </Button>
          </div>
        </div>

        {/* TELEFONE */}
        <div className="relative flex justify-center lg:justify-end animate-fade-in lg:-mr-8">
          <div className="relative w-full max-w-[520px]">
            <img
              src="/muwoyo-chat.png"
              alt="Dashboard do CRM Muwoyo mostrando interface de chat com IA para automação de vendas no WhatsApp"
              className="w-full h-auto block drop-shadow-2xl"
            />

            {/* CHAT */}
            <div
              ref={containerRef}
              className="absolute top-[22%] left-[15%] w-[70%] h-[52%] flex flex-col gap-[6px] overflow-hidden px-2 pt-2"
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`max-w-[72%] px-3 py-2 text-[10.5px] leading-snug shadow-sm animate-messagePop
                    ${
                      msg.from === "user"
                        ? "bg-[#d9fdd3] self-end rounded-lg mr-1"
                        : "bg-white self-start rounded-lg ml-1"
                    }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>
                  {msg.img && (
                    <img
                      src={msg.img}
                      alt="Produto mostrado no chat de vendas automatizado do WhatsApp"
                      className="mt-2 rounded-md h-28 w-full object-cover"
                    />
                  )}
                  {msg.file && (
                    <div className="mt-2 p-2 bg-slate-100 rounded-md text-[9px] font-medium">
                      📄 {msg.file}
                    </div>
                  )}
                  <div className="text-[7px] text-right text-slate-400 mt-[2px]">
                    12:45
                  </div>
                </div>
              ))}

              {typing && (
                <div className="flex gap-1 px-3 py-2 bg-white rounded-lg w-14 ml-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-300"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
