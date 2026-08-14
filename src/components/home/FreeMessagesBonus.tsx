import { motion } from "framer-motion";
import { Gift, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FreeMessagesBonus() {
  const navigate = useNavigate();

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-emerald-50 to-emerald-100/50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-emerald-300 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 bg-white rounded-full px-4 py-2 w-fit shadow-sm">
              <Gift className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-600">
                Bónus de Boas-vindas
              </span>
            </div>

            <div className="space-y-3">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
                200 Mensagens
                <br />
                <span className="text-emerald-600">Completamente Grátis</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Ao ativar a sua conta na Muwoyo, recebe automaticamente{" "}
                <strong>200 mensagens gratuitas</strong> para começar a usar a
                IA e atender seus clientes no WhatsApp.
              </p>
            </div>

            <div className="space-y-3">
              <p className="font-semibold text-gray-800">O que inclui:</p>
              <ul className="space-y-2">
                {[
                  "200 mensagens para usar com a IA Muwoyo",
                  "Acesso completo a todas as funcionalidades",
                  "Dashboard em tempo real",
                  "Sem necessidade de cartão de crédito",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => navigate("/login")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              Ativar Conta Agora
            </button>

            <p className="text-sm text-gray-600">
              Sem taxa de configuração. Sem compromisso. Cancele a qualquer
              momento.
            </p>
          </div>

          {/* Image */}
          <div className="flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full max-w-md"
            >
              <img
                src="https://i.ibb.co/MkMfCNXR/bfe372c1-3944-48c2-9569-bc32595a8128.png"
                alt="200 Mensagens Gratuitas"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
