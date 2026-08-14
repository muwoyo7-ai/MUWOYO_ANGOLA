"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TypewriterProps {
  text: string;
  speed?: number;
  className?: string;
}

function TypewriterText({ text, speed = 50, className }: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let i = 0;
    let currentText = "";

    // Fase de escrever
    const typingInterval = setInterval(() => {
      if (i <= text.length) {
        currentText = text.substring(0, i);
        setDisplayText(currentText);
        i++;
      } else {
        clearInterval(typingInterval);

        // Espera 2 segundos e começa a apagar
        setTimeout(() => {
          setIsDeleting(true);
          const deletingInterval = setInterval(() => {
            if (i >= 0) {
              currentText = text.substring(0, i);
              setDisplayText(currentText);
              i--;
            } else {
              clearInterval(deletingInterval);
              setIsDeleting(false);
              setIsTyping(false);
            }
          }, speed / 2); // Apaga mais rápido
        }, 2000);
      }
    }, speed);

    return () => {
      clearInterval(typingInterval);
    };
  }, [text, speed]);

  return (
    <span className={cn("inline-block", className)}>
      {displayText}
      {!isDeleting && (
        <span className="inline-block w-1 h-6 bg-emerald-500 ml-1 animate-pulse" />
      )}
    </span>
  );
}

export default function TypewriterSection() {
  const phrases = [
    "Gerencie vendas, estoque e clientes com o melhor CRM para WhatsApp",
    "Transforme o WhatsApp na sua máquina de vendas com automação 24/7",
    "Automatize vendas no WhatsApp com IA inteligente e converta mais",
    "Tenha uma loja online profissional integrada ao WhatsApp sem complicações",
    "Feche vendas enquanto dorme com nosso bot de atendimento inteligente",
  ];

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [key, setKey] = useState(0); // Key para forçar re-render

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
      setKey((prev) => prev + 1); // Força re-render do componente
    }, 8000); // 8 segundos por frase (incluindo animação)

    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-6 leading-tight">
          <TypewriterText
            key={key}
            text={phrases[currentPhraseIndex]}
            speed={80}
            className="text-black"
          />
        </h2>
        <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto font-medium">
          A Muwoyo revoluciona a forma como você vende no WhatsApp com
          tecnologia de ponta e automação inteligente. Descubra como nosso bot
          de atendimento inteligente pode transformar seu negócio com automação
          de vendas no WhatsApp.
        </p>
      </div>
    </section>
  );
}
