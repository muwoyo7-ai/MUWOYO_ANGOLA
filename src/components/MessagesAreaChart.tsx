import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp } from "lucide-react";

interface DayPoint { date: string; label: string; inbound: number; outbound: number; }
type Range = "7" | "30" | "90" | "365";
const rangeLabels: Record<Range, string> = { "7": "7 dias", "30": "30 dias", "90": "90 dias", "365": "Jan-Dez" };

export default function MessagesAreaChart({ userId }: { userId: string | undefined }) {
  const [range, setRange] = useState<Range>("7");
  const [data, setData] = useState<DayPoint[]>([]);
  const daysBack = useMemo(() => (range === "365" ? 365 : Number(range)), [range]);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const days: DayPoint[] = [];
      const now = new Date();
      for (let i = daysBack - 1; i >= 0; i--) {
        const d = new Date(now); d.setDate(now.getDate() - i); d.setHours(0, 0, 0, 0);
        days.push({
          date: d.toISOString().slice(0, 10),
          label: d.toLocaleDateString("pt-PT", daysBack > 90 ? { month: "short" } : { day: "2-digit", month: "short" }),
          inbound: 0, outbound: 0,
        });
      }
      const { data: rows } = await supabase
        .from("messages")
        .select("created_at, direction")
        .eq("user_id", userId)
        .gte("created_at", new Date(days[0].date).toISOString());
      (rows || []).forEach((r: any) => {
        const d = new Date(r.created_at).toISOString().slice(0, 10);
        const idx = days.findIndex((x) => x.date === d);
        if (idx >= 0) {
          if (r.direction === "inbound") days[idx].inbound += 1;
          else days[idx].outbound += 1;
        }
      });
      if (range === "365") {
        const months = Array.from({ length: 12 }, (_, m) => ({
          date: `${new Date().getFullYear()}-${String(m + 1).padStart(2, "0")}`,
          label: new Date(new Date().getFullYear(), m, 1).toLocaleDateString("pt-PT", { month: "short" }),
          inbound: 0, outbound: 0,
        }));
        days.forEach((d) => { const m = Number(d.date.slice(5, 7)) - 1; if (months[m]) { months[m].inbound += d.inbound; months[m].outbound += d.outbound; } });
        setData(months);
      } else setData(days);
    };
    load();
    const ch = supabase.channel(`messages-chart-${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `user_id=eq.${userId}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [userId, daysBack, range]);

  const totalIn = data.reduce((s, d) => s + d.inbound, 0);
  const totalOut = data.reduce((s, d) => s + d.outbound, 0);

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold">Mensagens</CardTitle>
          <p className="text-xs text-muted-foreground">Recebidas: {totalIn} • IA respondeu: {totalOut}</p>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <Select value={range} onValueChange={(v) => setRange(v as Range)}>
            <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(rangeLabels).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="inboundFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.42} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.03} />
              </linearGradient>
              <linearGradient id="outboundFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(220 90% 56%)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="hsl(220 90% 56%)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="inbound" name="Recebidas" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#inboundFill)" />
            <Area type="monotone" dataKey="outbound" name="IA respondeu" stroke="hsl(220 90% 56%)" strokeWidth={2} fill="url(#outboundFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
