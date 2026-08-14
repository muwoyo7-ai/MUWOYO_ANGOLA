import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  QrCode,
  KeyRound,
  Loader2,
  Copy,
  Check,
  ArrowLeft,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/muwoyo-logo.png";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: () => void;
}
type Step = "choose" | "phone-pairing" | "qr" | "pairing";
const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const generateInstanceName = () =>
  `Muwoyo_${Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")}`;

export default function WhatsAppConnectDialog({
  open,
  onOpenChange,
  onConnected,
}: Props) {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("choose");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [qrText, setQrText] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [instanceName, setInstanceName] = useState<string>("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  const reset = () => {
    setStep("choose");
    setPhone("");
    setQrBase64(null);
    setQrText(null);
    setPairingCode(null);
    setLoading(false);
    setInstanceName("");
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => {
    if (!open) reset();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [open]);

  const getOrCreateInstanceName = async () => {
    if (!user) return generateInstanceName();
    const { data } = await supabase
      .from("instances")
      .select("instance_name")
      .eq("user_id", user.id)
      .maybeSingle();
    const existing = data?.instance_name;
    if (existing) return existing;
    return generateInstanceName();
  };

  const startPolling = (name: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke(
          "evolution-api",
          { body: { action: "getStatus", instanceName: name } },
        );
        if (!error && data?.state === "open") {
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
          try {
            await supabase.functions.invoke("evolution-api", {
              body: { action: "fetchInfo", instanceName: name },
            });
            toast({
              title: "Conectado!",
              description: "WhatsApp conectado com sucesso.",
            });
            onConnected();
            onOpenChange(false);
          } catch (fetchError) {
            console.warn("Function fetchInfo not available:", fetchError);
          }
        }
      } catch (error) {
        console.warn("Function getStatus not available:", error);
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }
    }, 4000);
  };

  const handleQR = async () => {
    setLoading(true);
    const name = await getOrCreateInstanceName();
    setInstanceName(name);
    try {
      const { data, error } = await supabase.functions.invoke("evolution-api", {
        body: { action: "createAndConnect", instanceName: name },
      });
      setLoading(false);
      if (error || !data) {
        console.warn(
          "Function createAndConnect not available:",
          error?.message || "Falha ao gerar QR",
        );
        return toast({
          title: "Erro",
          description: error?.message || "Falha ao gerar QR",
          variant: "destructive",
        });
      }
      if (data.connected || data.state === "open") {
        toast({
          title: "Conectado!",
          description: "WhatsApp conectado com sucesso.",
        });
        onConnected();
        onOpenChange(false);
        return;
      }
      if (!data.qrBase64 && !data.qrCodeText)
        return toast({
          title: "Erro",
          description: "QR Code indisponível no momento",
          variant: "destructive",
        });
      setQrBase64(data.qrBase64 || null);
      setQrText(data.qrCodeText || null);
      setStep("qr");
      startPolling(name);
    } catch (error) {
      setLoading(false);
      console.warn("Function call failed:", error);
      toast({
        title: "Erro",
        description: "Erro ao conectar com o servidor",
        variant: "destructive",
      });
    }
  };

  const handlePairingSubmit = async () => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 8)
      return toast({
        title: "Número inválido",
        description: "Digite o número com código do país",
        variant: "destructive",
      });
    setLoading(true);
    const name = await getOrCreateInstanceName();
    setInstanceName(name);
    try {
      const { data, error } = await supabase.functions.invoke("evolution-api", {
        body: {
          action: "getPairingCode",
          phone: cleanPhone,
          instanceName: name,
        },
      });
      setLoading(false);
      if (error || !data?.pairingCode) {
        if (data?.connected || data?.state === "open") {
          toast({
            title: "Conectado!",
            description: "WhatsApp conectado com sucesso.",
          });
          onConnected();
          onOpenChange(false);
          return;
        }
        console.warn(
          "Function getPairingCode not available:",
          error?.message || "Falha ao gerar código",
        );
        return toast({
          title: "Erro",
          description: error?.message || "Falha ao gerar código",
          variant: "destructive",
        });
      }
      setPairingCode(data.pairingCode);
      setStep("pairing");
      startPolling(name);
    } catch (error) {
      setLoading(false);
      console.warn("Function call failed:", error);
      toast({
        title: "Erro",
        description: "Erro ao conectar com o servidor",
        variant: "destructive",
      });
    }
  };

  const copyCode = async () => {
    if (!pairingCode) return;
    await navigator.clipboard.writeText(pairingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Conectar WhatsApp</DialogTitle>
          <DialogDescription>
            {step === "choose" && "Escolha como deseja conectar"}
            {step === "phone-pairing" && "Insira o número que deseja conectar"}
            {step === "qr" &&
              "Abra o WhatsApp → Aparelhos conectados → Conectar"}
            {step === "pairing" && "Insira o código no seu WhatsApp"}
          </DialogDescription>
        </DialogHeader>
        {instanceName && step !== "choose" && (
          <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            Instância única:{" "}
            <span className="font-mono text-foreground">{instanceName}</span>
          </p>
        )}
        {step === "choose" && (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleQR}
              disabled={loading}
              className="flex flex-col items-center justify-center gap-2 rounded-md border border-border bg-card p-6 transition-colors hover:bg-accent disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : (
                <QrCode className="h-8 w-8 text-primary" />
              )}
              <span className="font-medium">QR Code</span>
              <span className="text-xs text-muted-foreground">
                Escaneie com a câmara
              </span>
            </button>
            <button
              onClick={() => setStep("phone-pairing")}
              disabled={loading}
              className="flex flex-col items-center justify-center gap-2 rounded-md border border-border bg-card p-6 transition-colors hover:bg-accent disabled:opacity-50"
            >
              <KeyRound className="h-8 w-8 text-primary" />
              <span className="font-medium">Código</span>
              <span className="text-xs text-muted-foreground">
                Cole no WhatsApp
              </span>
            </button>
          </div>
        )}
        {step === "phone-pairing" && (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="ph">Número de telefone (com DDI)</Label>
              <Input
                id="ph"
                placeholder="244912345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep("choose")}
                className="flex-1"
              >
                <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
              </Button>
              <Button
                onClick={handlePairingSubmit}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Gerar código"
                )}
              </Button>
            </div>
          </div>
        )}
        {step === "qr" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="relative rounded-md border border-border bg-white p-4">
              {qrBase64 ? (
                <img
                  src={
                    qrBase64.startsWith("data:")
                      ? qrBase64
                      : `data:image/png;base64,${qrBase64}`
                  }
                  alt="QR Code"
                  width={240}
                  height={240}
                />
              ) : qrText ? (
                <QRCodeSVG value={qrText} size={240} level="H" />
              ) : (
                <div className="flex h-[240px] w-[240px] items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="rounded-md bg-white p-1.5 shadow-md">
                  <img
                    src={logo}
                    alt="Muwoyo"
                    className="h-9 w-9 object-contain"
                  />
                </div>
              </div>
            </div>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> A aguardar
              leitura...
            </p>
          </div>
        )}
        {step === "pairing" && pairingCode && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="rounded-md bg-muted px-6 py-4">
              <span className="font-mono text-3xl font-bold tracking-[0.3em]">
                {pairingCode}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={copyCode}>
              {copied ? (
                <Check className="mr-2 h-4 w-4 text-primary" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              {copied ? "Copiado!" : "Copiar código"}
            </Button>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> A aguardar
              pareamento...
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
