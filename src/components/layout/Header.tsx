import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCallback } from "react";
import logo from "../../assets/muwoyo-logo.png";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  console.log("Estado do usuário:", user ? "Logado" : "Não logado");

  const handleLoginClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      console.log("Botão Entrar clicado!");
      console.log("Navegando para login...");
      try {
        setTimeout(() => {
          navigate("/login");
          console.log("Navegação para login completada!");
        }, 100);
      } catch (error) {
        console.error("Erro ao navegar para login:", error);
      }
    },
    [navigate],
  );

  const handleLogout = useCallback(async () => {
    await signOut();
    navigate("/");
  }, [signOut, navigate]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/#messages", label: "Planos", scrollTo: "messages" },
    { href: "/#depoimentos", label: "Depoimentos", scrollTo: "depoimentos" },
  ];

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return false;
    return location.pathname === href;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-2xl border-b border-border/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20 lg:h-24">
          {/* Logo + Name */}
          <Link to="/" className="flex items-center gap-3 py-2 shrink-0">
            <img
              src={logo}
              alt="Muwoyo"
              className="h-8 w-auto object-contain"
            />
            <span className="font-display font-bold text-xl sm:text-2xl lg:text-3xl text-foreground">
              Muwoyo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={(e) => {
                  if (link.scrollTo) {
                    e.preventDefault();
                    const element = document.getElementById(link.scrollTo);
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth" });
                    }
                  }
                }}
                className={`text-sm font-medium transition-all duration-300 hover:text-primary relative group ${
                  isActive(link.href) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <button
                className="font-medium h-9 text-xs sm:text-sm px-3 sm:px-4 bg-red-500 text-white hover:bg-red-600 rounded-md transition-colors duration-200 inline-flex items-center justify-center"
                onClick={handleLogout}
              >
                Sair
              </button>
            ) : (
              <button
                className="font-medium h-9 text-xs sm:text-sm px-3 sm:px-4 bg-transparent hover:bg-gray-100 rounded-md transition-colors duration-200 inline-flex items-center justify-center"
                onClick={handleLoginClick}
              >
                Entrar
              </button>
            )}
            <Button
              variant="hero"
              className="px-3 sm:px-5 h-9 text-xs sm:text-sm font-semibold transition-all duration-300 btn-shimmer btn-wave"
              onClick={() => {
                navigate("/login");
              }}
            >
              Criar Conta
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
