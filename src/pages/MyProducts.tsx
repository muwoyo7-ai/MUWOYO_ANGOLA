import { FormEvent, useEffect, useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, AlertCircle, X } from "lucide-react";

type Category = { id: string; name: string };
type Product = {
  id: string; name: string; description: string | null; price: number; discount_price: number | null;
  stock: number; image_url: string | null; is_sold_out: boolean; category_ids: string[] | null; rating_avg: number; rating_count: number;
};

const emptyForm = { name: "", description: "", price: "", discount_price: "", stock: "", image_url: "", category_ids: [] as string[], is_sold_out: false };

export default function MyProducts() {
  const { user } = useAuth(); const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [newCat, setNewCat] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data: s } = await supabase.from("stores").select("id").eq("user_id", user.id).maybeSingle();
    if (!s) {
      const slug = `loja-${user.id.slice(0, 8)}`;
      const created = await supabase.from("stores").insert({ user_id: user.id, name: "Minha Loja", slug, is_active: true }).select("id").single();
      setStoreId(created.data?.id || null);
    } else setStoreId(s.id);
    const { data: c } = await supabase.from("categories").select("id,name").eq("user_id", user.id).order("name");
    setCategories((c as any) || []);
    const { data: p } = await supabase.from("products").select("id,name,description,price,discount_price,stock,image_url,is_sold_out,category_ids,rating_avg,rating_count").eq("user_id", user.id).order("created_at", { ascending: false });
    setProducts((p as any) || []);
  };
  useEffect(() => { load(); }, [user]);

  const uploadImage = async (file: File) => {
    if (!user) return null;
    const path = `${user.id}/products/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("store-assets").upload(path, file, { upsert: true });
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return null; }
    return supabase.storage.from("store-assets").getPublicUrl(path).data.publicUrl;
  };

  const addCategory = async () => {
    if (!user || !newCat.trim()) return;
    const { data, error } = await supabase.from("categories").insert({ user_id: user.id, name: newCat.trim() }).select().single();
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    setCategories((c) => [...c, data as any]);
    setForm((f) => ({ ...f, category_ids: [...f.category_ids, (data as any).id] }));
    setNewCat("");
  };

  const startEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description || "", price: String(p.price ?? ""),
      discount_price: p.discount_price ? String(p.discount_price) : "",
      stock: String(p.stock ?? 0), image_url: p.image_url || "",
      category_ids: p.category_ids || [], is_sold_out: p.is_sold_out,
    });
    setOpen(true);
  };
  const startCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true); };

  const save = async (e: FormEvent) => {
    e.preventDefault(); if (!user || !storeId) return;
    setBusy(true);
    const payload = {
      user_id: user.id, store_id: storeId, name: form.name, description: form.description,
      price: Number(form.price || 0), discount_price: form.discount_price ? Number(form.discount_price) : null,
      stock: Number(form.stock || 0), image_url: form.image_url || null,
      category_ids: form.category_ids, is_sold_out: form.is_sold_out, is_active: true,
    };
    const { error } = editing
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    setBusy(false);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    toast({ title: editing ? "Produto atualizado" : "Produto adicionado" });
    setOpen(false); load();
  };

  const del = async (id: string) => {
    if (!confirm("Eliminar este produto?")) return;
    await supabase.from("products").delete().eq("id", id);
    load();
  };

  const toggleSoldOut = async (p: Product) => {
    await supabase.from("products").update({ is_sold_out: !p.is_sold_out }).eq("id", p.id);
    load();
  };

  const catName = (id: string) => categories.find((c) => c.id === id)?.name || "";
  const requireCategory = useMemo(() => form.category_ids.length === 0, [form.category_ids]);

  return (
    <DashboardShell title="Meus Produtos" description="Cadastre, edite e gerencie todos os produtos da sua loja.">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">{products.length} produto(s) cadastrado(s)</div>
        <Button onClick={startCreate}><Plus className="mr-2 h-4 w-4" /> Novo produto</Button>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <Card key={p.id} className={`overflow-hidden relative ${p.is_sold_out ? "opacity-80" : ""}`}>
            <div className="aspect-square bg-muted relative">
              {p.image_url && <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />}
              {p.is_sold_out && <div className="absolute inset-0 flex items-center justify-center bg-destructive/80 text-destructive-foreground font-bold uppercase tracking-wider">Esgotado</div>}
            </div>
            <CardContent className="space-y-2 p-3">
              <div className="line-clamp-1 text-sm font-semibold">{p.name}</div>
              <div className="flex items-baseline gap-2">
                {p.discount_price ? (
                  <>
                    <span className="text-sm font-bold text-primary">{Number(p.discount_price).toLocaleString("pt-AO")} Kz</span>
                    <span className="text-xs text-muted-foreground line-through">{Number(p.price).toLocaleString("pt-AO")}</span>
                  </>
                ) : <span className="text-sm font-bold text-primary">{Number(p.price).toLocaleString("pt-AO")} Kz</span>}
              </div>
              <div className="flex flex-wrap gap-1">
                {(p.category_ids || []).slice(0, 2).map((cid) => <Badge key={cid} variant="secondary" className="text-[10px]">{catName(cid)}</Badge>)}
              </div>
              <div className="flex gap-1 pt-1">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => startEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button size="sm" variant={p.is_sold_out ? "default" : "outline"} className="flex-1" onClick={() => toggleSoldOut(p)} title={p.is_sold_out ? "Disponível" : "Esgotado"}>
                  <AlertCircle className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => del(p.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {products.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          Sem produtos ainda. Clique em "Novo produto" para começar.
        </CardContent></Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Editar produto" : "Novo produto"}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-3">
            <div className="space-y-1.5"><Label>Nome</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Descrição</Label><Textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5"><Label>Preço</Label><Input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Desconto</Label><Input type="number" value={form.discount_price} onChange={(e) => setForm({ ...form, discount_price: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
            </div>

            <div className="space-y-2 rounded-md border p-3">
              <Label>Categorias <span className="text-destructive">*</span></Label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((c) => {
                  const active = form.category_ids.includes(c.id);
                  return (
                    <button type="button" key={c.id}
                      onClick={() => setForm((f) => ({ ...f, category_ids: active ? f.category_ids.filter((x) => x !== c.id) : [...f.category_ids, c.id] }))}
                      className={`rounded-full border px-3 py-1 text-xs ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}>
                      {c.name}
                    </button>
                  );
                })}
                {categories.length === 0 && <span className="text-xs text-muted-foreground">Nenhuma categoria. Crie a primeira abaixo.</span>}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Nova categoria…" value={newCat} onChange={(e) => setNewCat(e.target.value)} className="h-9" />
                <Button type="button" size="sm" variant="outline" onClick={addCategory}>Adicionar</Button>
              </div>
              {requireCategory && <p className="text-xs text-destructive">Selecione ou crie pelo menos uma categoria.</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Imagem</Label>
              <Input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setForm({ ...form, image_url: (await uploadImage(f)) || "" }); }} />
              {form.image_url && (
                <div className="relative inline-block">
                  <img src={form.image_url} alt="" className="h-28 rounded object-cover" />
                  <button type="button" onClick={() => setForm({ ...form, image_url: "" })} className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground"><X className="h-3 w-3" /></button>
                </div>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_sold_out} onChange={(e) => setForm({ ...form, is_sold_out: e.target.checked })} />
              Marcar como esgotado
            </label>

            <Button className="w-full" disabled={busy || requireCategory}>{busy ? "A guardar…" : editing ? "Guardar alterações" : "Cadastrar produto"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
