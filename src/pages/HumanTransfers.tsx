import { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, MessageCircle, Phone } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

type TransferRow = {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  customer_notes: string | null;
  transfer_status: "on" | "off";
  transfer_reason: string | null;
  transferred_at: string | null;
  reopened_at: string | null;
  created_at: string | null;
};

export default function HumanTransfers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<TransferRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("human_transfer_requests")
      .select(
        "id,customer_name,customer_phone,customer_email,customer_notes,transfer_status,transfer_reason,transferred_at,reopened_at,created_at",
      )
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    setLoading(false);

    if (error) {
      console.warn("Failed to load human transfers", error);
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    setRows((data as TransferRow[]) || []);
  };

  const statusSummary = useMemo(() => {
    const on = rows.filter((r) => r.transfer_status === "on").length;
    const off = rows.length - on;
    return { on, off };
  }, [rows]);

  useEffect(() => {
    void load();
  }, [user]);

  const openWhatsApp = (phone: string | null) => {
    if (!phone) return;
    const sanitized = phone.replace(/\D/g, "").replace(/^244/, "");
    window.open(`https://wa.me/244${sanitized}`, "_blank", "noopener,noreferrer");
  };

  return (
    <DashboardShell title="Transferido para humano" description="Acompanhe clientes em transferência e abra o WhatsApp rapidamente.">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Ativos</div>
            <div className="mt-2 text-2xl font-bold text-emerald-600">{statusSummary.on}</div>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Em espera</div>
            <div className="mt-2 text-2xl font-bold text-amber-600">{statusSummary.off}</div>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="mt-2 text-2xl font-bold text-foreground">{rows.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Lista de transferidos</CardTitle>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">A carregar transferências…</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-muted-foreground">Nenhum cliente transferido para humano até agora.</div>
          ) : (
            <div className="space-y-3">
              {rows.map((row) => (
                <div key={row.id} className="rounded-xl border p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-foreground">{row.customer_name || "Cliente"}</div>
                        <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${row.transfer_status === "on" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                          {row.transfer_status === "on" ? "ON" : "OFF"}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {row.customer_phone || "Sem telefone"}
                      </div>
                      {row.customer_notes && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          {row.customer_notes}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => openWhatsApp(row.customer_phone)}>
                        <Phone className="mr-2 h-4 w-4" />
                        WhatsApp
                      </Button>
                      <div className="rounded-md bg-accent/50 px-3 py-2 text-xs text-muted-foreground">
                        {row.transfer_reason || "Sem motivo"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
