import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import DashboardShell from "@/components/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Plus, QrCode, Trash2, Download, ExternalLink } from "lucide-react";

type StoreRow = { id: string; name: string; slug: string; logo_url: string | null; theme_color: string | null; header_color: string | null; checkout_whatsapp: string | null; description: string | null };
type Slide = { id: string; title: string | null; subtitle: string | null; image_url: string | null; bg_color: string | null; link_url: string | null; position: number };

const COLORS = [
  "#16a34a", "#0ea5e9", "#dc2626", "#f97316", "#eab308",
  "#7c3aed", "#ec4899", "#0f172a", "#475569", "#059669",
  "#2563eb", "#be123c",
];

export default function StoreManagement() {
  const { user } = useAuth(); const { toast } = useToast();
  const [store, setStore] = useState<StoreRow | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [form, setForm] = useState({ name: "", logo_url: "", theme_color: "#16a34a", header_color: "#16a34a", checkout_whatsapp: "", description: "" });
  const [qrOpen, setQrOpen] = useState(false);
  const [slideOpen, setSlideOpen] = useState(false);
  const [slideForm, setSlideForm] = useState({ title: "", subtitle: "", image_url: "", bg_color: "#16a34a", link_url: "" });

  const storeUrl = useMemo(() => (store?.slug ? `${window.location.origin}/loja/${store.slug}` : ""), [store?.slug]);

  const load = async () => {
    if (!user) return;
    let { data: s } = await supabase.from("stores").select("id,name,slug,logo_url,theme_color,header_color,checkout_whatsapp,description").eq("user_id", user.id).maybeSingle();
    if (!s) {
      const slug = `loja-${user.id.slice(0, 8)}`;
      const created = await supabase.from("stores").insert({ user_id: user.id, name: "Minha Loja", slug, is_active: true }).select().single();
      s = created.data as any;
    }
    setStore(s as any);
    if (s) setForm({ name: s.name || "", logo_url: s.logo_url || "", theme_color: s.theme_color || "#16a34a", header_color: (s as any).header_color || "#16a34a", checkout_whatsapp: s.checkout_whatsapp || "", description: s.description || "" });
    if (s) {
      const { data } = await supabase.from("store_carousel_slides").select("*").eq("store_id", (s as any).id).order("position");
      setSlides((data as any) || []);
    }
  };
  useEffect(() => { load(); }, [user]);

  const uploadImage = async (file: File, folder = "store") => {
    if (!user) return null;
    const path = `${user.id}/${folder}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("store-assets").upload(path, file, { upsert: true });
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return null; }
    return supabase.storage.from("store-assets").getPublicUrl(path).data.publicUrl;
  };

  const saveStore = async (e: FormEvent) => {
    e.preventDefault(); if (!user || !store) return;
    const { error } = await supabase.from("stores").update(form).eq("id", store.id);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    toast({ title: "Loja atualizada" }); load();
  };

  const addSlide = async (e: FormEvent) => {
    e.preventDefault(); if (!user || !store) return;
    const { error } = await supabase.from("store_carousel_slides").insert({
      store_id: store.id, user_id: user.id, ...slideForm, position: slides.length,
    });
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    setSlideForm({ title: "", subtitle: "", image_url: "", bg_color: "#16a34a", link_url: "" });
    setSlideOpen(false); load();
  };

  const removeSlide = async (id: string) => {
    if (!confirm("Eliminar este slide?")) return;
    await supabase.from("store_carousel_slides").delete().eq("id", id);
    load();
  };

  const downloadQR = () => {
    const canvas = document.querySelector("#store-qr canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a"); a.href = url; a.download = `${store?.slug || "loja"}-qr.png`; a.click();
  };

  return (
    <DashboardShell title="Minha Loja" description="Configure a aparência, carrossel e link público da sua loja.">
      <Card><CardHeader><CardTitle>Configuração da loja</CardTitle></CardHeader><CardContent>
        <form onSubmit={saveStore} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Nome da loja</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="space-y-2"><Label>WhatsApp para checkout</Label><Input value={form.checkout_whatsapp} onChange={(e) => setForm({ ...form, checkout_whatsapp: e.target.value.replace(/\D/g, "") })} placeholder="244928663898" /></div>
          <div className="space-y-2"><Label>Logo da loja</Label><Input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setForm({ ...form, logo_url: (await uploadImage(f, "logos")) || "" }); }} />{form.logo_url && <img src={form.logo_url} alt="" className="mt-2 h-12 object-contain" />}</div>
          <div className="space-y-2 md:col-span-2"><Label>Descrição</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="space-y-2 md:col-span-2">
            <Label>Cor do header (onde fica a logo)</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setForm({ ...form, header_color: c })}
                  className={`h-9 w-9 rounded-full ${form.header_color === c ? "ring-2 ring-foreground ring-offset-2" : ""}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Cor principal (botões e preços)</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setForm({ ...form, theme_color: c })}
                  className={`h-9 w-9 rounded-full ${form.theme_color === c ? "ring-2 ring-foreground ring-offset-2" : ""}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <Button className="w-fit md:col-span-2">Guardar loja</Button>
        </form>
      </CardContent></Card>

      <Card><CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="font-semibold">Link público da loja</div>
          <div className="truncate text-sm text-muted-foreground">{storeUrl}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild><Link to={`/loja/${store?.slug || ""}`} target="_blank"><ExternalLink className="mr-2 h-4 w-4" />Ver loja</Link></Button>
          <Button variant="outline" onClick={() => setQrOpen(true)}><QrCode className="mr-2 h-4 w-4" />Ver QR Code</Button>
        </div>
      </CardContent></Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div><CardTitle>Carrossel da loja</CardTitle><p className="text-xs text-muted-foreground">Promoções e destaques que aparecem no topo da loja.</p></div>
          <Button size="sm" onClick={() => setSlideOpen(true)}><Plus className="mr-2 h-4 w-4" />Novo slide</Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {slides.map((s) => (
              <div key={s.id} className="relative overflow-hidden rounded-lg border" style={{ backgroundColor: s.bg_color || "#16a34a" }}>
                <div className="flex h-32 items-center gap-3 p-4 text-white">
                  {s.image_url && <img src={s.image_url} alt="" className="h-20 w-20 rounded object-cover" />}
                  <div className="min-w-0">
                    <div className="line-clamp-1 font-bold">{s.title}</div>
                    <div className="line-clamp-2 text-xs opacity-90">{s.subtitle}</div>
                  </div>
                </div>
                <button onClick={() => removeSlide(s.id)} className="absolute right-2 top-2 rounded-full bg-black/40 p-1.5 text-white"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
            {slides.length === 0 && <div className="col-span-full py-8 text-center text-sm text-muted-foreground">Sem slides. Crie o primeiro para destacar uma promoção.</div>}
          </div>
        </CardContent>
      </Card>

      {/* QR dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>QR Code da loja</DialogTitle></DialogHeader>
          <div id="store-qr" className="flex flex-col items-center gap-4 py-2">
            <div className="rounded-lg bg-white p-4"><QRCodeCanvas value={storeUrl || "https://muwoyo.com"} size={220} /></div>
            <p className="text-center text-xs text-muted-foreground break-all">{storeUrl}</p>
            <Button onClick={downloadQR} className="w-full"><Download className="mr-2 h-4 w-4" />Baixar QR Code</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Slide dialog */}
      <Dialog open={slideOpen} onOpenChange={setSlideOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Novo slide</DialogTitle></DialogHeader>
          <form onSubmit={addSlide} className="space-y-3">
            <div className="space-y-1.5"><Label>Título</Label><Input required value={slideForm.title} onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })} placeholder="Ex: Promoção da semana" /></div>
            <div className="space-y-1.5"><Label>Subtítulo</Label><Input value={slideForm.subtitle} onChange={(e) => setSlideForm({ ...slideForm, subtitle: e.target.value })} placeholder="Ex: 30% off em todos os produtos" /></div>
            <div className="space-y-1.5"><Label>Imagem (opcional)</Label><Input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setSlideForm({ ...slideForm, image_url: (await uploadImage(f, "slides")) || "" }); }} />{slideForm.image_url && <img src={slideForm.image_url} alt="" className="mt-2 h-20 rounded object-cover" />}</div>
            <div className="space-y-1.5">
              <Label>Cor de fundo</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setSlideForm({ ...slideForm, bg_color: c })}
                    className={`h-8 w-8 rounded-full ${slideForm.bg_color === c ? "ring-2 ring-foreground ring-offset-2" : ""}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <Button className="w-full">Adicionar slide</Button>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
