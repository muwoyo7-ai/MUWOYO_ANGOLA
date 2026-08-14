import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/muwoyo-logo.png";

export default function Login() {
  const { user, signIn, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      const checkUserRole = async () => {
        try {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .maybeSingle();

          const userRole = roleData?.role || "client";
          if (userRole === "admin") {
            navigate("/admin", { replace: true });
          } else if (userRole === "sub_admin") {
            navigate("/gestor", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
        } catch (error) {
          console.error("Erro ao verificar role:", error);
          navigate("/dashboard", { replace: true });
        }
      };

      checkUserRole();
    }
  }, [loading, user, navigate]);

  if (!loading && user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error)
      return toast({
        title: "Erro ao entrar",
        description: error,
        variant: "destructive",
      });

    try {
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !currentUser) {
        navigate("/dashboard", { replace: true });
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      const userRole = roleData?.role || "client";
      if (userRole === "admin") {
        navigate("/admin", { replace: true });
      } else if (userRole === "sub_admin") {
        navigate("/gestor", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Erro ao verificar role após login:", error);
      navigate("/dashboard", { replace: true });
    }
  };

  const handleCreateAccount = () => {
    const message = encodeURIComponent("Olá! Quero criar minha conta na Muwoyo.");
    window.open(`https://wa.me/244928663898?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl h-[600px] flex flex-col md:flex-row">
        <div className="w-full md:w-5/12 bg-gray-50 p-10 flex flex-col justify-center">
          <div className="mb-8 flex items-center gap-3">
            <img src={logo} alt="Muwoyo" className="h-12 w-12 object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Muwoyo</h1>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-2">Login</h2>
          <p className="text-gray-500 mb-8">Entre com seus dados</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Usuário"
                className="w-full border-b border-gray-300 py-2 bg-transparent outline-none transition focus:border-whatsapp"
              />
            </div>
            <div>
              <input
                id="password"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                className="w-full border-b border-gray-300 py-2 bg-transparent outline-none transition focus:border-whatsapp"
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="text-sm text-gray-400 hover:text-whatsapp transition"
                onClick={() => setShow(!show)}
              >
                {show ? "Ocultar senha" : "Mostrar senha"}
              </button>
              <button
                type="button"
                className="text-sm text-gray-400 hover:text-whatsapp transition"
                onClick={handleCreateAccount}
              >
                Criar conta
              </button>
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-whatsapp py-3 text-white font-semibold hover:bg-green-800 transition"
              disabled={submitting}
            >
              {submitting ? "Carregando..." : "Login"}
            </button>
          </form>

          <div className="mt-auto space-y-4 pt-10 text-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Não possui conta?</span>
              <button
                type="button"
                className="rounded border border-gray-300 px-4 py-1 text-sm hover:bg-gray-200 transition"
                onClick={handleCreateAccount}
              >
                Criar conta
              </button>
            </div>
            <button
              type="button"
              className="text-left text-sm text-gray-500 hover:text-whatsapp transition"
              onClick={() => navigate("/")}
            >
              Voltar para o site
            </button>
          </div>
        </div>

        <div className="w-full md:w-7/12 bg-[#25D366] p-12 flex flex-col justify-center text-white relative overflow-hidden">
          <h2 className="text-4xl font-bold leading-tight mb-4">Seja bem-vindo a Muwoyo</h2>
          <p className="text-white/80">
            Faça o seu login para começares a automatizar o teu WhatsApp agora mesmo.
          </p>

          <div className="mt-12 flex justify-center opacity-80">
            <svg viewBox="0 0 200 200" className="w-64 h-64 text-white">
              <circle cx="100" cy="100" r="80" fill="currentColor" fillOpacity="0.1" />
              <path
                d="M50 150 Q100 120 150 150"
                stroke="white"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              <rect x="70" y="60" width="60" height="80" rx="10" fill="white" fillOpacity="0.2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
