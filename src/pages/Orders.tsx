import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ShoppingBag, MapPin, Phone, User } from "lucide-react";

type Order = {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_location: string | null;
  items: any;
  total: number | null;
  notes: string | null;
  status: string;
  created_at: string;
};

export default function Orders() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Order[]>([]);
  const [open, setOpen] = useState<Order | null>(null);

  const normalizeOrderItems = (value: any): any[] => {
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== "object") {
      if (typeof value === "string" && value.trim()) {
        try {
          const parsed = JSON.parse(value);
          return normalizeOrderItems(parsed);
        } catch {
          return [];
        }
      }
      return [];
    }

    const possibleKeys = ["items", "products", "line_items", "order_items", "cart"];
    for (const key of possibleKeys) {
      const candidate = value[key];
      if (candidate) {
        const normalized = normalizeOrderItems(candidate);
        if (normalized.length > 0) return normalized;
      }
    }

    if (Array.isArray(value.data)) return value.data;
    if (Array.isArray(value.result)) return value.result;

    return [];
  };

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("store_orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    const parsed = (data as any[] | null) || [];
    const normalized = parsed.map((r) => {
      let items = r.items;
      try {
        if (typeof items === "string" && items.trim()) {
          items = JSON.parse(items);
        }
      } catch {
        // keep original if parse fails
      }
      items = normalizeOrderItems(items);
      return { ...r, items };
    });
    setRows(normalized as Order[]);
  };

  useEffect(() => {
    load();
    if (!user) return;
    const ch = supabase
      .channel(`orders-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "store_orders",
          filter: `user_id=eq.${user.id}`,
        },
        load,
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("store_orders").update({ status }).eq("id", id);
    load();
  };

  const statusLabel: Record<string, string> = {
    new: "Novo",
    confirmed: "Confirmado",
    delivered: "Entregue",
    cancelled: "Cancelado",
  };

  return (
    <DashboardShell
      title="Pedidos"
      description="Pedidos preenchidos automaticamente pela IA durante as conversas."
    >
      <div className="grid gap-3">
        {rows.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Nenhum pedido ainda. A IA cria pedidos durante as conversas com
              seus clientes.
            </CardContent>
          </Card>
        )}
        {rows.map((o) => (
          <Card
            key={o.id}
            className="cursor-pointer transition hover:shadow-md"
            onClick={() => setOpen(o)}
          >
            <CardContent className="flex items-start justify-between gap-3 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                  <div className="font-semibold truncate">
                    {o.customer_name || "Cliente sem nome"}
                  </div>
                </div>
                <div className="mt-1 text-sm text-muted-foreground truncate">
                  +{o.customer_phone || "-"}
                </div>
                <div className="mt-2 text-sm">
                  {Array.isArray(o.items) && o.items.length > 0 ? (
                    <>
                      {o.items.slice(0, 2).map((it: any, idx: number) => (
                        <span key={idx} className="block truncate">
                          {it.name || it.product || it.title || JSON.stringify(it)} {it.qty ? `x${it.qty}` : ""}
                        </span>
                      ))}
                      {o.items.length > 2 && (
                        <span className="text-xs text-muted-foreground">e mais {o.items.length - 2} item(s)</span>
                      )}
                    </>
                  ) : (
                    <span className="text-muted-foreground">Sem itens registrados.</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <Badge variant={o.status === "new" ? "default" : "outline"}>
                  {statusLabel[o.status] || o.status}
                </Badge>
                <div className="mt-1 font-bold text-primary">
                  {Number(o.total || 0).toLocaleString("pt-AO")} Kz
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {new Date(o.created_at).toLocaleString("pt-AO")}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!open} onOpenChange={() => setOpen(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhe do pedido</DialogTitle>
          </DialogHeader>
          {open && (
            <div className="space-y-4">
              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {open.customer_name || "-"}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />+
                  {open.customer_phone || "-"}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {open.customer_location || "Sem localização"}
                </div>
              </div>
              <div>
                <div className="mb-2 font-semibold">Itens</div>
                <div className="space-y-2 rounded-md border p-3 text-sm">
                  {Array.isArray(open.items) && open.items.length > 0 ? (
                    open.items.map((it: any, i: number) => (
                      <div key={i} className="rounded-sm border p-2">
                        <div className="flex justify-between items-start">
                          <div className="font-medium">{it.name || it.product || it.title || `Item ${i + 1}`}</div>
                          <div className="text-sm text-muted-foreground">{it.qty ? `x${it.qty}` : ""}</div>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground space-y-1">
                          {it.price !== undefined && (
                            <div>Preço: {Number(it.price).toLocaleString("pt-AO")} Kz</div>
                          )}
                          {it.price_kz !== undefined && (
                            <div>Preço: {Number(it.price_kz).toLocaleString("pt-AO")} Kz</div>
                          )}
                          {it.color && <div>Cor: {it.color}</div>}
                          {it.variant && <div>Variante: {it.variant}</div>}
                          {it.details && <div>Detalhes: {it.details}</div>}
                          {it.options && typeof it.options === "object" && (
                            <div>
                              Opções:
                              <ul className="list-disc list-inside">
                                {Object.entries(it.options).map(([k, v]) => (
                                  <li key={k} className="text-xs">{k}: {String(v)}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {/* fallback: render any other fields */}
                          {Object.keys(it).filter(k => !["name","product","title","qty","price","price_kz","color","variant","details","options"].includes(k)).length > 0 && (
                            <div className="text-xs">
                              Outros: {Object.entries(it).filter(([k]) => !["name","product","title","qty","price","price_kz","color","variant","details","options"].includes(k)).map(([k,v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`).join(' • ')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground">Sem itens registrados.</div>
                  )}
                </div>
              </div>
              {open.notes && (
                <div className="rounded-md bg-muted p-3 text-sm">
                  <b>Notas:</b> {open.notes}
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <div className="text-2xl font-bold text-primary">
                  {Number(open.total || 0).toLocaleString("pt-AO")} Kz
                </div>
                <Select
                  value={open.status}
                  onValueChange={(v) => updateStatus(open.id, v)}
                >
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Novo</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="delivered">Entregue</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {open.customer_phone && (
                <Button
                  className="w-full"
                  onClick={() =>
                    window.open(
                      `https://wa.me/${open.customer_phone}`,
                      "_blank",
                    )
                  }
                >
                  Falar no WhatsApp
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
