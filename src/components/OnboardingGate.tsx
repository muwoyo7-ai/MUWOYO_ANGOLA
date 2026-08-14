import { FormEvent, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { LegalAcceptance } from "@/components/LegalAcceptance";
import logo from "@/assets/muwoyo-logo.png";

type Field = {
  key: keyof Form;
  label: string;
  placeholder: string;
  type?: "text" | "textarea";
  help?: string;
};
type Form = {
  business_name: string;
  ai_name: string;
  business_description: string;
  ai_rules: string;
};

const STEPS: Field[] = [
  {
    key: "business_name",
    label: "Qual é o nome da sua empresa?",
    placeholder: "Ex: Boutique Cabinda",
    help: "É o nome que a IA vai usar nas conversas.",
  },
  {
    key: "ai_name",
    label: "Que nome vai dar à sua atendente virtual?",
    placeholder: "Ex: Joana",
    help: "É como os clientes vão chamar a sua IA.",
  },
  {
    key: "business_description",
    label: "Conte sobre o seu negócio",
    placeholder: "Horários, serviços, formas de pagamento, localização…",
    type: "textarea",
    help: "Quanto mais detalhe, melhor a IA responde.",
  },
  {
    key: "ai_rules",
    label: "Que regras a IA deve seguir?",
    placeholder:
      "Tom amigável, nunca prometer prazos, encaminhar para humano se pedir reembolso…",
    type: "textarea",
    help: "Defina limites e estilo de atendimento.",
  },
];

export default function OnboardingGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const { role, loading: roleLoading } = useRole();
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(true);
  const [step, setStep] = useState(-1);
  const [showLegalAcceptance, setShowLegalAcceptance] = useState(false);
  const [form, setForm] = useState<Form>({
    business_name: "",
    ai_name: "Muwoyo",
    business_description: "",
    ai_rules: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select(
        "onboarding_completed,business_name,ai_name,business_description,ai_rules",
      )
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }: any) => {
        setDone(!!data?.onboarding_completed);
        setForm({
          business_name: data?.business_name || "",
          ai_name: data?.ai_name || "Muwoyo",
          business_description: data?.business_description || "",
          ai_rules: data?.ai_rules || "",
        });
        setLoading(false);
      });
  }, [user]);

  if (roleLoading || loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  if (role === "admin") return <Navigate to="/admin" replace />;
  if (role === "sub_admin") return <Navigate to="/gestor" replace />;
  if (done) return <>{children}</>;

  // Show legal acceptance after form completion
  if (showLegalAcceptance) {
    return (
      <LegalAcceptance
        userId={user!.id}
        onComplete={async () => {
          if (!user) return;

          // Mark onboarding as completed and send welcome notifications
          await supabase
            .from("profiles")
            .update({
              onboarding_completed: true,
            })
            .eq("user_id", user.id);

          await supabase.from("notifications").insert([
            {
              user_id: user.id,
              title: "Bem-vinda à Muwoyo",
              message:
                "A sua conta está pronta. Conecte o WhatsApp para começar.",
              type: "welcome",
            },
            {
              user_id: user.id,
              title: "500 mensagens grátis",
              message:
                "Você ganhou 500 mensagens. Quando acabarem, recarregue para continuar.",
              type: "credits",
            },
          ]);

          setDone(true);
        }}
        onReject={() => {
          // Account is already suspended by LegalAcceptance component
          window.location.href = "/";
        }}
      />
    );
  }

  const next = async (e: FormEvent) => {
    e.preventDefault();
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    if (!user) return;
    setSaving(true);
    await supabase
      .from("profiles")
      .update({
        ...form,
        free_messages_granted: true,
        message_limit: 500,
      })
      .eq("user_id", user.id);
    setSaving(false);
    setShowLegalAcceptance(true);
  };

  // Welcome screen
  if (step === -1) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="mx-auto w-full max-w-lg text-center space-y-6">
          <img
            src={logo}
            alt="Muwoyo"
            className="mx-auto h-24 w-24 object-contain"
          />
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">
              Seja muito bem-vinda à Muwoyo
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg leading-relaxed">
              Precisamos que nos forneça algumas informações sobre o seu negócio
              para poder conectar o seu WhatsApp e a nossa IA começar a
              responder instantaneamente com as informações da sua empresa.
            </p>
          </div>
          <Button
            size="lg"
            className="h-12 w-full sm:w-auto sm:px-12"
            onClick={() => setStep(0)}
          >
            Começar agora <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground">
            Leva menos de 2 minutos.
          </p>
        </div>
      </div>
    );
  }

  const current = STEPS[step];
  const value = form[current.key] || "";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <form onSubmit={next} className="mx-auto w-full max-w-lg space-y-6">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Muwoyo" className="h-9 w-9 object-contain" />
          <div className="flex-1">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`}
                />
              ))}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Passo {step + 1} de {STEPS.length}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold sm:text-3xl">{current.label}</h2>
          {current.help && (
            <p className="text-sm text-muted-foreground">{current.help}</p>
          )}
          {current.type === "textarea" ? (
            <Textarea
              required
              autoFocus
              className="min-h-32 text-base"
              placeholder={current.placeholder}
              value={value}
              onChange={(e) =>
                setForm({ ...form, [current.key]: e.target.value })
              }
            />
          ) : (
            <Input
              required
              autoFocus
              className="h-12 text-base"
              placeholder={current.placeholder}
              value={value}
              onChange={(e) =>
                setForm({ ...form, [current.key]: e.target.value })
              }
            />
          )}
        </div>

        <div className="flex gap-3">
          {step > 0 && (
            <Button
              type="button"
              variant="outline"
              className="h-12 flex-1"
              onClick={() => setStep(step - 1)}
            >
              Voltar
            </Button>
          )}
          <Button type="submit" className="h-12 flex-1" disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : step === STEPS.length - 1 ? (
              "Concluir"
            ) : (
              "Avançar"
            )}
            {!saving && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
