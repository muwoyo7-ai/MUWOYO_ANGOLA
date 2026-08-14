import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import BusinessHoursConfig from "@/components/BusinessHoursConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { buildProfilePayload } from "@/lib/profile-persistence";
import { Switch } from "@/components/ui/switch";
import {
  clearBusinessInfoDraft,
  getBusinessInfoDraftKey,
  readBusinessInfoDraft,
  writeBusinessInfoDraft,
} from "@/lib/business-info-draft";

export default function BusinessInfo() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({
    business_name: "",
    ai_name: "",
    transfer_phone: "",
    business_hours: undefined,
    ai_personality: "",
    business_description: "",
    ai_rules: "",
    appointment_duration_minutes: 30,
    accepts_appointments: true,
  });
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !user?.id) return;

    const draftKey = getBusinessInfoDraftKey(user.id);
    if (!draftKey) return;

    const cached = readBusinessInfoDraft(user.id);
    if (!cached) return;

    setForm((current) => ({
      ...current,
      business_name: cached.business_name || current.business_name,
      ai_name: cached.ai_name || current.ai_name,
      transfer_phone: cached.transfer_phone || current.transfer_phone,
      business_hours: cached.business_hours ?? current.business_hours,
      ai_personality: cached.ai_personality || current.ai_personality,
      business_description: cached.business_description || current.business_description,
      ai_rules: cached.ai_rules || current.ai_rules,
      appointment_duration_minutes:
        cached.appointment_duration_minutes !== undefined
          ? Number(cached.appointment_duration_minutes)
          : current.appointment_duration_minutes,
      accepts_appointments:
        cached.accepts_appointments !== undefined
          ? cached.accepts_appointments
          : current.accepts_appointments,
    }));
  }, [user?.id]);

  useEffect(() => {
    if (typeof window === "undefined" || !profileLoaded || !user?.id) return;

    const draft = {
      business_name: form.business_name,
      ai_name: form.ai_name,
      transfer_phone: form.transfer_phone,
      business_hours: form.business_hours,
      ai_personality: form.ai_personality,
      business_description: form.business_description,
      ai_rules: form.ai_rules,
      appointment_duration_minutes: form.appointment_duration_minutes,
      accepts_appointments: form.accepts_appointments,
    };

    writeBusinessInfoDraft(user.id, draft);
  }, [profileLoaded, user?.id, form.business_name, form.ai_name, form.transfer_phone, form.business_hours, form.ai_personality, form.business_description, form.ai_rules, form.appointment_duration_minutes, form.accepts_appointments]);

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          business_name,
          ai_name,
          transfer_phone,
          business_hours,
          ai_personality,
          business_description,
          ai_rules,
          appointment_duration_minutes,
          accepts_appointments
        `)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.warn("Erro ao carregar perfil:", error);
        setProfileLoaded(true);
        return;
      }

      const cached = readBusinessInfoDraft(user.id);

      setForm((current) => ({
        ...current,
        business_name: cached?.business_name || data?.business_name || "",
        ai_name: cached?.ai_name || data?.ai_name || "",
        transfer_phone: cached?.transfer_phone || data?.transfer_phone || "",
        business_hours: cached?.business_hours ?? data?.business_hours ?? undefined,
        ai_personality: cached?.ai_personality || data?.ai_personality || "",
        business_description: cached?.business_description || data?.business_description || "",
        ai_rules: cached?.ai_rules || data?.ai_rules || "",
        appointment_duration_minutes:
          cached?.appointment_duration_minutes !== undefined
            ? Number(cached.appointment_duration_minutes)
            : Number(data?.appointment_duration_minutes ?? 30),
        accepts_appointments:
          cached?.accepts_appointments !== undefined
            ? cached.accepts_appointments
            : data?.accepts_appointments ?? true,
      }));

      setProfileLoaded(true);
    };

    void loadProfile();
  }, [user]);

  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!user) return { error: { message: "Sem utilizador" } };
    setSaving(true);
    const payload = buildProfilePayload({
      userId: user.id,
      form,
      businessHours: form.business_hours,
    });
    const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "user_id" });
    setSaving(false);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return { error };
    }
    clearBusinessInfoDraft(user.id);
    toast({ title: "Guardado", description: "Informações atualizadas com sucesso." });
    return {};
  };

  return (
    <DashboardShell title="Informações do negócio" description="Configure o perfil e as regras que a IA deve seguir.">
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Dados da empresa e agente IA</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome da empresa</Label>
                <Input
                  value={form.business_name}
                  onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                  placeholder="Ex: Muwoyo Store"
                />
              </div>
              <div className="space-y-2">
                <Label>Nome do agente de IA</Label>
                <Input
                  value={form.ai_name}
                  onChange={(e) => setForm({ ...form, ai_name: e.target.value })}
                  placeholder="Ex: Assistente Muwoyo"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Número para transferir para atendimento humano</Label>
              <Input
                value={form.transfer_phone}
                onChange={(e) => setForm({ ...form, transfer_phone: e.target.value })}
                placeholder="Ex: +244 9xx xxx xxx"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Duração do intervalo de cada agendamento (minutos)</Label>
                <Input
                  type="number"
                  min={10}
                  max={240}
                  value={form.appointment_duration_minutes}
                  onChange={(e) => setForm({ ...form, appointment_duration_minutes: Number(e.target.value || 30) })}
                  placeholder="30"
                />
              </div>
              <div className="space-y-2 pt-6">
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <Label className="text-sm font-medium">Aceita agendamentos</Label>
                    <p className="text-xs text-muted-foreground">Ative ou desative o recebimento de agendamentos</p>
                  </div>
                  <Switch
                    checked={form.accepts_appointments}
                    onCheckedChange={(checked) => setForm({ ...form, accepts_appointments: !!checked })}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Personalidade da inteligência artificial</Label>
              <Textarea
                className="min-h-28"
                value={form.ai_personality}
                onChange={(e) => setForm({ ...form, ai_personality: e.target.value })}
                placeholder="Defina o tom, estilo, comportamento e identidade da IA para conversar com os clientes..."
              />
            </div>
            <div className="space-y-2">
              <Label>Informações completas da empresa</Label>
              <Textarea
                className="min-h-36"
                value={form.business_description}
                onChange={(e) => setForm({ ...form, business_description: e.target.value })}
                placeholder="Horários, serviços, localização, formas de pagamento, entrega, garantias..."
              />
            </div>
            <div className="space-y-2">
              <Label>Regras que a IA deve seguir</Label>
              <Textarea
                className="min-h-36"
                value={form.ai_rules}
                onChange={(e) => setForm({ ...form, ai_rules: e.target.value })}
                placeholder="Tom de voz, limites, quando encaminhar para humano, o que nunca deve responder..."
              />
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="mt-6">
        <BusinessHoursConfig
          value={form.business_hours}
          onChange={(hours) => setForm((cur) => ({ ...cur, business_hours: hours }))}
        />
      </div>
      <div className="mt-6 flex justify-end">
        <Button
          type="button"
          onClick={save}
          disabled={saving}
          className="w-fit"
        >
          {saving ? "A guardar..." : "Guardar"}
        </Button>
      </div>
    </DashboardShell>
  );
}