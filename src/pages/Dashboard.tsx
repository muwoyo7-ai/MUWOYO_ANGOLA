import { ReactNode, useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Wifi,
  Users,
  Bot,
  Phone,
  Power,
  Pause,
  Play,
  RefreshCw,
  Clock,
} from "lucide-react";
import WhatsAppConnectDialog from "@/components/WhatsAppConnectDialog";
import MessagesAreaChart from "@/components/MessagesAreaChart";
import { useToast } from "@/hooks/use-toast";
import DashboardShell from "@/components/DashboardShell";

interface InstanceRow {
  instance_name: string;
  connection_state: string | null;
  phone: string | null;
  phone_number: string | null;
  automation_paused?: boolean | null;
  automation_paused_until?: string | null;
  status?: string | null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [instance, setInstance] = useState<InstanceRow | null>(null);
  const [messagesToday, setMessagesToday] = useState(0);
  const [messageLimit, setMessageLimit] = useState(0);
  const [messagesReceived, setMessagesReceived] = useState(0);
  const [disconnecting, setDisconnecting] = useState(false);
  const [savingPause, setSavingPause] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const pausedUntilDate = instance?.automation_paused_until
    ? new Date(instance.automation_paused_until)
    : null;
  const pausedUntilActive =
    pausedUntilDate && pausedUntilDate.getTime() > Date.now();
  const isConnected =
    instance?.status === "connected" ||
    instance?.connection_state === "connected" ||
    instance?.connection_state === "open";
  const isPaused = instance?.automation_paused === true || pausedUntilActive;

  const loadAll = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const [{ data: inst }, { data: prof }, { count }] = await Promise.all([
      supabase
        .from("instances")
        .select(
          "instance_name, connection_state, phone, phone_number, automation_paused, automation_paused_until, status",
        )
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("messages_received, message_limit")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("direction", "inbound")
        .gte("created_at", start.toISOString()),
    ]);
    setInstance((inst as any) ?? null);
    if (prof) {
      setMessagesReceived(prof.messages_received ?? 0);
      setMessageLimit(prof.message_limit ?? 0);
    }
    setMessagesToday(count ?? 0);
    setRefreshing(false);
  }, [user]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      const { error } = await supabase.functions.invoke("evolution-api", {
        body: { action: "disconnect" },
      });
      setDisconnecting(false);
      if (error) {
        console.warn("Function evolution-api not available:", error.message);
        return toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
      }
      toast({ title: "Desconectado" });
      loadAll();
    } catch (error) {
      setDisconnecting(false);
      console.warn("Function call failed:", error);
      toast({
        title: "Erro",
        description: "Erro ao conectar com o servidor",
        variant: "destructive",
      });
    }
  };

  const setPause = async (paused: boolean, untilMinutes?: number) => {
    if (!user) return;
    setSavingPause(true);
    const patch: any = { automation_paused: paused };
    patch.automation_paused_until = untilMinutes
      ? new Date(Date.now() + untilMinutes * 60000).toISOString()
      : null;
    const { error } = await supabase
      .from("instances")
      .update(patch)
      .eq("user_id", user.id);
    setSavingPause(false);
    if (error)
      return toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    toast({
      title: paused
        ? untilMinutes
          ? `Pausada por ${untilMinutes} min`
          : "Pausada"
        : "Reativada",
    });
    setPauseOpen(false);
    loadAll();
  };

  const remaining = Math.max(messageLimit - messagesReceived, 0);
  const phoneNum = instance?.phone_number || instance?.phone;
  const automationStatus = !isConnected
    ? "Offline"
    : isPaused
      ? "Pausada"
      : remaining > 0
        ? "Online"
        : "Sem saldo";

  return (
    <DashboardShell
      title="Painel de Automação"
      description="Gerencie suas automações e acompanhe conversas."
    >
      {/* AUTOMATION CARD - soft emerald */}
      {!isConnected ? (
        <Card className="overflow-hidden border border-primary/20 bg-[hsl(var(--primary-soft))] text-[hsl(var(--primary-soft-foreground))] shadow-sm">
          <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider opacity-80">
                  Desconectado
                </div>
                <div className="text-xl font-bold">Conecte o seu WhatsApp</div>
                <p className="text-sm opacity-80">
                  Comece a automatizar agora.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setDialogOpen(true)}
              size="sm"
              className="w-full sm:w-auto"
            >
              Conectar WhatsApp
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border border-primary/20 bg-[hsl(var(--primary-soft))] text-[hsl(var(--primary-soft-foreground))] shadow-sm">
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-80">
                <Wifi className="h-3.5 w-3.5" />
                {isPaused ? "Pausada" : "Conectado"}
              </div>
              <div className="flex items-center gap-2 text-xl font-bold">
                {instance?.instance_name}
              </div>
              {phoneNum && (
                <div className="flex items-center gap-1.5 text-sm opacity-80">
                  <Phone className="h-3.5 w-3.5" />+{phoneNum}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  isPaused ? setPause(false) : setPauseOpen(true)
                }
                disabled={savingPause}
                className="gap-2 bg-card"
              >
                {isPaused ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Pause className="h-4 w-4" />
                )}{" "}
                {isPaused ? "Reativar" : "Pausar"}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="gap-2"
              >
                <Power className="h-4 w-4" />{" "}
                {disconnecting ? "..." : "Desconectar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pause options dialog */}
      {pauseOpen && (
        <Card className="border-dashed">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4" /> Pausar automação
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[15, 30, 60, 240].map((m) => (
                <Button
                  key={m}
                  variant="outline"
                  size="sm"
                  onClick={() => setPause(true, m)}
                  disabled={savingPause}
                >
                  {m < 60 ? `${m}m` : `${m / 60}h`}
                </Button>
              ))}
              <Button
                variant="default"
                size="sm"
                className="col-span-2 sm:col-span-2"
                onClick={() => setPause(true)}
                disabled={savingPause}
              >
                Pausar de vez
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="col-span-2 sm:col-span-2"
                onClick={() => setPauseOpen(false)}
              >
                Cancelar
              </Button>
            </div>
            {pausedUntilActive && (
              <div className="text-xs text-muted-foreground">
                Reativa automaticamente em{" "}
                {pausedUntilDate?.toLocaleString("pt-AO")}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* STATS - 2 cols mobile, 4 cols desktop, polished */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard
          label="Mensagens hoje"
          value={messagesToday}
          bottom="Diretas recebidas"
          icon={<MessageCircle className="h-4 w-4" />}
          accent
        />
        <StatCard
          label="Restantes"
          value={remaining}
          bottom={`de ${messageLimit}`}
          icon={<MessageCircle className="h-4 w-4" />}
        />
        <StatCard
          label="Total enviadas"
          value={messagesReceived}
          bottom="Histórico geral"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Automação"
          value={
            <span
              className={
                automationStatus === "Online"
                  ? "text-primary"
                  : "text-muted-foreground"
              }
            >
              {automationStatus}
            </span>
          }
          bottom="Status atual"
          icon={<Bot className="h-4 w-4" />}
        />
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={loadAll}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
          />{" "}
          Atualizar
        </Button>
      </div>

      <MessagesAreaChart userId={user?.id} />
      <WhatsAppConnectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConnected={() => loadAll()}
      />
    </DashboardShell>
  );
}

function StatCard({
  label,
  value,
  bottom,
  icon,
  accent,
}: {
  label: string;
  value: ReactNode;
  bottom: string;
  icon: ReactNode;
  accent?: boolean;
}) {
  return (
    <Card
      className={`overflow-hidden border-border/60 shadow-sm transition-all hover:shadow-md ${accent ? "border-primary/30" : ""}`}
    >
      <CardContent className="space-y-1.5 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-md ${accent ? "bg-primary/15 text-primary" : "bg-accent text-foreground/70"}`}
          >
            {icon}
          </div>
        </div>
        <div className="text-2xl font-bold sm:text-3xl">{value}</div>
        <div className="text-[11px] text-muted-foreground">{bottom}</div>
      </CardContent>
    </Card>
  );
}
