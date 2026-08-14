import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Linkedin,
  Youtube,
} from "lucide-react";
import logo from "../../assets/logo-muwoyo-oficial.png";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src={logo}
                alt="Muwoyo"
                className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-display font-bold text-xl text-background">
                Muwoyo
              </span>
            </Link>
            <p className="text-background/70 text-sm leading-relaxed max-w-xs">
              Automatize seu atendimento e vendas via WhatsApp com inteligência
              artificial. Empresa angolana criada em Cabinda, Angola pela OKAVANGO CODE.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-11 h-11 rounded-xl bg-background/10 flex items-center justify-center hover:bg-primary transition-all duration-300 hover:scale-110"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-11 h-11 rounded-xl bg-background/10 flex items-center justify-center hover:bg-primary transition-all duration-300 hover:scale-110"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-11 h-11 rounded-xl bg-background/10 flex items-center justify-center hover:bg-primary transition-all duration-300 hover:scale-110"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Produtos */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg mb-4">Produtos</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-background/70 hover:text-primary transition-colors"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="/#planos"
                  className="text-background/70 hover:text-primary transition-colors"
                >
                  Planos
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-background/70 hover:text-primary transition-colors"
                >
                  Criar Conta
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-background/70 hover:text-primary transition-colors"
                >
                  Entrar
                </Link>
              </li>
            </ul>
          </div>

          {/* Empresa */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg mb-4">Empresa</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/termos-uso"
                  className="text-background/70 hover:text-primary transition-colors"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  to="/politica-privacidade"
                  className="text-background/70 hover:text-primary transition-colors"
                >
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg mb-4">Contato</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                <a
                  href="mailto:suporte@muwoyo.com"
                  className="text-background/70 hover:text-primary transition-colors"
                >
                  suporte@muwoyo.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                <a
                href="https://wa.me/244928663898"
                className="text-background/70 hover:text-primary transition-colors"
              >
                WhatsApp: +244 928 663 898
              </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-0.5" />
                <span className="text-background/70">Cabinda, Angola</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 mt-16 pt-8 text-center">
          <p className="text-background/60 text-sm">
            © 2024 Muwoyo. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
