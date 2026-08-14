import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Mail, Phone } from "lucide-react";
import { PrivacyPolicy } from "@/pages/PrivacyPolicy";
import { TermsOfUse } from "@/pages/TermsOfUse";
import { supabase } from "@/integrations/supabase/client";

interface LegalAcceptanceProps {
  userId: string;
  onComplete: () => void;
  onReject: () => void;
}

export function LegalAcceptance({
  userId,
  onComplete,
  onReject,
}: LegalAcceptanceProps) {
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = async () => {
    if (!privacyAccepted || !termsAccepted) return;

    setIsLoading(true);
    try {
      await supabase
        .from("profiles")
        .update({
          privacy_policy_accepted: true,
          terms_accepted: true,
          legal_accepted_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      onComplete();
    } catch (error) {
      console.error("Erro ao aceitar termos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      await supabase
        .from("profiles")
        .update({
          is_suspended: true,
          status: "suspended",
          suspension_reason:
            "Recusou aceitar Política de Privacidade e Termos de Uso",
        })
        .eq("user_id", userId);

      setShowRejectionModal(true);
      onReject();
    } catch (error) {
      console.error("Erro ao rejeitar termos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactEmail = () => {
    window.location.href = "mailto:suporte@muwoyo.com";
  };

  const handleContactWhatsApp = () => {
    window.open("https://wa.me/244928663898", "_blank");
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">
            Aceitação Obrigatória de Documentos Legais
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Para continuar usando a plataforma Muwoyo, você deve aceitar ambos
            os documentos abaixo.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <PrivacyPolicy
                onAccept={() => setPrivacyAccepted(true)}
                onReject={handleReject}
              />
            </div>
            <div>
              <TermsOfUse
                onAccept={() => setTermsAccepted(true)}
                onReject={handleReject}
              />
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleAccept}
              disabled={!privacyAccepted || !termsAccepted || isLoading}
              size="lg"
              className="px-8"
            >
              {isLoading ? "Processando..." : "Aceitar e Continuar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showRejectionModal} onOpenChange={setShowRejectionModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-2">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <DialogTitle className="text-lg">Conta Suspensa</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Como você não concordou com os termos legais, sua conta foi
              suspensa. Para reativar sua conta, entre em contato conosco
              através dos canais abaixo:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <Button
              onClick={handleContactEmail}
              variant="outline"
              className="w-full justify-start"
            >
              <Mail className="mr-2 h-4 w-4" />
              suporte@muwoyo.com
            </Button>

            <Button
              onClick={handleContactWhatsApp}
              variant="outline"
              className="w-full justify-start"
            >
              <Phone className="mr-2 h-4 w-4" />
              WhatsApp: +244 928 663 898
            </Button>
          </div>

          <DialogFooter>
            <Button
              onClick={() => (window.location.href = "/")}
              variant="secondary"
              className="w-full"
            >
              Voltar à Página Inicial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
