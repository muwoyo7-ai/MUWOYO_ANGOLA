import React from "react";
import { MessageSquare, ShoppingCart, Settings, Cloud } from "lucide-react";

const AIAgentDescription: React.FC = () => {
  return (
    <section className="relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Section header */}
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              AGENTE DE IA
            </h2>
            <p className="text-xl text-gray-600">
              Assistente digital completo. Tudo o que o teu negócio precisa para
              vender, atender e crescer sem esforço manual.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-md mx-auto md:max-w-none md:mx-0">
            {/* COMUNICAÇÃO INTELIGENTE */}
            <div className="bg-white p-8 md:p-6 rounded-lg shadow-lg space-y-6 md:space-y-4 flex flex-col">
              <div className="flex items-center mb-2">
                <MessageSquare className="h-6 w-6 text-primary mr-3" />
                <h3 className="text-2xl md:text-xl lg:text-lg font-bold text-gray-900">
                  COMUNICAÇÃO INTELIGENTE
                </h3>
              </div>
              <ul className="list-disc list-inside text-gray-600 space-y-3 md:space-y-2 flex-grow text-base md:text-sm">
                <li>Responde automaticamente 24 horas por dia, sem pausas</li>
                <li>Entende texto, áudios e imagens enviados pelos clientes</li>
                <li>Interpreta perguntas com erros ou linguagem informal</li>
                <li>Responde de forma natural, como um humano</li>
                <li>Lembra o histórico da conversa e responde com contexto</li>
              </ul>
            </div>

            {/* VENDAS E CONVERSÃO */}
            <div className="bg-white p-8 md:p-6 rounded-lg shadow-lg space-y-6 md:space-y-4 flex flex-col">
              <div className="flex items-center mb-2">
                <ShoppingCart className="h-6 w-6 text-primary mr-3" />
                <h3 className="text-2xl md:text-xl lg:text-lg font-bold text-gray-900">
                  VENDAS E CONVERSÃO
                </h3>
              </div>
              <ul className="list-disc list-inside text-gray-600 space-y-3 md:space-y-2 flex-grow text-base md:text-sm">
                <li>
                  Aprende tudo sobre o teu negócio produtos, preços e regras
                </li>
                <li>
                  Envia fotos, descrições e preços dos produtos automaticamente
                </li>
                <li>Sugere produtos e conduz o cliente até à compra</li>
                <li>Converte conversas em vendas de forma automática</li>
              </ul>
            </div>

            {/* GESTÃO OPERACIONAL */}
            <div className="bg-white p-8 md:p-6 rounded-lg shadow-lg space-y-6 md:space-y-4 flex flex-col">
              <div className="flex items-center mb-2">
                <Settings className="h-6 w-6 text-primary mr-3" />
                <h3 className="text-2xl md:text-xl lg:text-lg font-bold text-gray-900">
                  GESTÃO OPERACIONAL
                </h3>
              </div>
              <ul className="list-disc list-inside text-gray-600 space-y-3 md:space-y-2 flex-grow text-base md:text-sm">
                <li>Regista pedidos feitos durante a conversa no teu painel</li>
                <li>Faz agendamentos, reservas e atendimentos no teu painel</li>
                <li>
                  Permite definir regras personalizadas para o comportamento da
                  IA
                </li>
                <li>Organiza o atendimento e reduz trabalho manual</li>
              </ul>
            </div>

            {/* INFRAESTRUTURA E ESCALA */}
            <div className="bg-white p-8 md:p-6 rounded-lg shadow-lg space-y-6 md:space-y-4 flex flex-col">
              <div className="flex items-center mb-2">
                <Cloud className="h-6 w-6 text-primary mr-3" />
                <h3 className="text-2xl md:text-xl lg:text-lg font-bold text-gray-900">
                  INFRAESTRUTURA E ESCALA
                </h3>
              </div>
              <ul className="list-disc list-inside text-gray-600 space-y-3 md:space-y-2 flex-grow text-base md:text-sm">
                <li>Funciona diretamente no WhatsApp, sem apps adicionais</li>
                <li>
                  Respostas instantâneas sem precisares de internet ou bateria
                </li>
                <li>Atende mais de 100 clientes ao mesmo tempo, sem erros</li>
                <li>
                  Funciona como vendedor e assistente digital do teu negócio
                </li>
              </ul>
            </div>
          </div>

          <p className="text-xl md:text-lg text-gray-600 text-center mt-12">
            Tu focas na entrega a IA cuida do resto. Vendedor digital,
            assistente e gestor operacional em simultâneo.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AIAgentDescription;
