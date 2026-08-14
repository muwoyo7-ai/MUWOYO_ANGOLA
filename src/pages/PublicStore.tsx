import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, Plus, Minus, Trash2, Star, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type StoreRow = {
  id: string;
  user_id: string;
  name: string;
  logo_url: string | null;
  checkout_whatsapp: string | null;
  description: string | null;
  theme_color: string | null;
  header_color: string | null;
};
type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  image_url: string | null;
  stock: number | null;
  is_sold_out: boolean;
  category_ids: string[] | null;
  rating_avg: number;
  rating_count: number;
};
type Category = { id: string; name: string };
type Slide = {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  bg_color: string | null;
};
type Review = {
  id: string;
  reviewer_name: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
};
type CartItem = Product & { qty: number };

function Stars({
  value,
  size = 14,
  onChange,
}: {
  value: number;
  size?: number;
  onChange?: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(i)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            style={{ width: size, height: size }}
            className={
              i <= value
                ? "fill-amber-400 text-amber-400"
                : "fill-none text-muted-foreground"
            }
          />
        </button>
      ))}
    </div>
  );
}

export default function PublicStore() {
  const { slug } = useParams();
  const { toast } = useToast();
  const [store, setStore] = useState<StoreRow | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeCat, setActiveCat] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [openP, setOpenP] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 5,
    comment: "",
  });
  const [slideIdx, setSlideIdx] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: s } = await supabase
        .from("stores")
        .select(
          "id,user_id,name,logo_url,checkout_whatsapp,description,theme_color,header_color",
        )
        .eq("slug", slug || "")
        .eq("is_active", true)
        .maybeSingle();
      setStore(s as any);
      if (s) {
        const sid = (s as any).id;
        const uid = (s as any).user_id;
        const [p, c, sl] = await Promise.all([
          supabase
            .from("products")
            .select(
              "id,name,description,price,discount_price,image_url,stock,is_sold_out,category_ids,rating_avg,rating_count",
            )
            .eq("store_id", sid)
            .eq("is_active", true),
          supabase
            .from("categories")
            .select("id,name")
            .eq("user_id", uid)
            .order("name"),
          supabase
            .from("store_carousel_slides")
            .select("id,title,subtitle,image_url,bg_color")
            .eq("store_id", sid)
            .order("position"),
        ]);
        setProducts((p.data as any) || []);
        setCategories((c.data as any) || []);
        setSlides((sl.data as any) || []);
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  // auto carousel
  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(
      () => setSlideIdx((i) => (i + 1) % slides.length),
      4500,
    );
    return () => clearInterval(id);
  }, [slides.length]);

  const filtered = useMemo(
    () =>
      activeCat === "all"
        ? products
        : products.filter((p) => (p.category_ids || []).includes(activeCat)),
    [activeCat, products],
  );
  const total = useMemo(
    () =>
      cart.reduce(
        (s, i) => s + Number(i.discount_price ?? i.price ?? 0) * i.qty,
        0,
      ),
    [cart],
  );

  const add = (p: Product) => {
    if (p.is_sold_out)
      return toast({ title: "Produto esgotado", variant: "destructive" });
    setCart((c) =>
      c.some((i) => i.id === p.id)
        ? c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i))
        : [...c, { ...p, qty: 1 }],
    );
    toast({ title: "Adicionado ao carrinho", description: p.name });
  };
  const dec = (id: string) =>
    setCart((c) =>
      c.flatMap((i) =>
        i.id === id ? (i.qty > 1 ? [{ ...i, qty: i.qty - 1 }] : []) : [i],
      ),
    );
  const remove = (id: string) => setCart((c) => c.filter((i) => i.id !== id));

  const checkout = () => {
    if (!store || cart.length === 0) return;
    const lines = cart
      .map(
        (i) =>
          `• ${i.name} x${i.qty} - ${(Number(i.discount_price ?? i.price) * i.qty).toLocaleString("pt-AO")} Kz`,
      )
      .join("\n");
    const text = `Olá ${store.name}! Quero fazer uma encomenda:\n${lines}\n\n*Total:* ${total.toLocaleString("pt-AO")} Kz`;
    window.open(
      `https://wa.me/${store.checkout_whatsapp || ""}?text=${encodeURIComponent(text)}`,
      "_blank",
    );
  };

  const openProduct = async (p: Product) => {
    setOpenP(p);
    const { data } = await supabase
      .from("product_reviews")
      .select("*")
      .eq("product_id", p.id)
      .order("created_at", { ascending: false })
      .limit(50);
    setReviews((data as any) || []);
  };

  const submitReview = async () => {
    if (!openP || !reviewForm.comment.trim()) return;
    const { error } = await supabase.from("product_reviews").insert({
      product_id: openP.id,
      reviewer_name: reviewForm.name || "Anónimo",
      rating: reviewForm.rating,
      comment: reviewForm.comment,
    });
    if (error)
      return toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    toast({ title: "Obrigado pela avaliação!" });
    setReviewForm({ name: "", rating: 5, comment: "" });
    openProduct(openP);
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        A carregar…
      </div>
    );
  if (!store)
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Loja indisponível.
      </div>
    );

  const themed = store.theme_color || "#16a34a";
  const headerBg = store.header_color || themed;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* HEADER */}
      <header
        className="sticky top-0 z-30 shadow-sm"
        style={{ backgroundColor: headerBg }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 text-white">
          <div className="flex items-center gap-3 min-w-0">
            {store.logo_url && (
              <img
                src={store.logo_url}
                alt={store.name}
                className="h-10 w-auto max-w-[80px] object-contain"
              />
            )}
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold sm:text-xl">
                {store.name}
              </h1>
              {store.description && (
                <p className="hidden truncate text-xs opacity-90 sm:block">
                  {store.description}
                </p>
              )}
            </div>
          </div>
          <Sheet open={cartOpen} onOpenChange={setCartOpen}>
            <SheetTrigger asChild>
              <Button variant="secondary" className="gap-2 relative">
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Carrinho</span>
                {cart.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                    {cart.reduce((s, i) => s + i.qty, 0)}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="flex w-full flex-col sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Seu carrinho</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto py-4">
                {cart.length === 0 ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    O carrinho está vazio.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((i) => (
                      <div
                        key={i.id}
                        className="flex gap-3 rounded-lg border p-3"
                      >
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded bg-muted">
                          {i.image_url && (
                            <img
                              src={i.image_url}
                              alt={i.name}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="line-clamp-1 text-sm font-semibold">
                            {i.name}
                          </div>
                          <div
                            className="text-sm font-bold"
                            style={{ color: themed }}
                          >
                            {(
                              Number(i.discount_price ?? i.price) * i.qty
                            ).toLocaleString("pt-AO")}{" "}
                            Kz
                          </div>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() => dec(i.id)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-sm font-semibold">
                              {i.qty}
                            </span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() => add(i)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="ml-auto h-7 w-7"
                              onClick={() => remove(i.id)}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {cart.length > 0 && (
                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span
                      className="text-xl font-bold"
                      style={{ color: themed }}
                    >
                      {total.toLocaleString("pt-AO")} Kz
                    </span>
                  </div>
                  <Button
                    className="w-full text-white"
                    style={{ backgroundColor: themed }}
                    onClick={checkout}
                  >
                    <Send className="mr-2 h-4 w-4" /> Finalizar no WhatsApp
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-6 space-y-5">
        {/* CAROUSEL */}
        {slides.length > 0 && (
          <div className="relative overflow-hidden rounded-xl">
            <div
              className="flex transition-transform duration-700"
              style={{ transform: `translateX(-${slideIdx * 100}%)` }}
            >
              {slides.map((s) => (
                <div
                  key={s.id}
                  className="w-full shrink-0"
                  style={{ backgroundColor: s.bg_color || themed }}
                >
                  <div className="flex items-center gap-4 p-5 text-white sm:p-8 min-h-[140px] sm:min-h-[180px]">
                    {s.image_url && (
                      <img
                        src={s.image_url}
                        alt=""
                        className="h-20 w-20 shrink-0 rounded-lg object-cover sm:h-28 sm:w-28"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="text-lg font-bold sm:text-2xl line-clamp-2">
                        {s.title}
                      </div>
                      {s.subtitle && (
                        <div className="mt-1 text-sm opacity-90 sm:text-base line-clamp-2">
                          {s.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {slides.length > 1 && (
              <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlideIdx(i)}
                    className={`h-1.5 rounded-full transition-all ${i === slideIdx ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* CATEGORIES */}
        {categories.length > 0 && (
          <div className="-mx-3 overflow-x-auto px-3 sm:mx-0 sm:px-0">
            <div className="flex gap-2 pb-1">
              <button
                onClick={() => setActiveCat("all")}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium ${activeCat === "all" ? "text-white" : "bg-background"}`}
                style={
                  activeCat === "all"
                    ? { backgroundColor: themed, borderColor: themed }
                    : {}
                }
              >
                Todos
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCat(c.id)}
                  className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium ${activeCat === c.id ? "text-white" : "bg-background"}`}
                  style={
                    activeCat === c.id
                      ? { backgroundColor: themed, borderColor: themed }
                      : {}
                  }
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {filtered.map((p) => {
            const hasDiscount =
              p.discount_price && Number(p.discount_price) < Number(p.price);
            return (
              <Card
                key={p.id}
                className="overflow-hidden cursor-pointer transition hover:shadow-md group"
                onClick={() => openProduct(p)}
              >
                <div className="aspect-square relative bg-muted overflow-hidden">
                  {p.image_url && (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  )}
                  {hasDiscount && (
                    <span className="absolute left-2 top-2 rounded bg-destructive px-2 py-0.5 text-[10px] font-bold text-destructive-foreground">
                      PROMO
                    </span>
                  )}
                  {p.is_sold_out && (
                    <div className="absolute inset-0 flex items-center justify-center bg-destructive/85 text-sm font-bold uppercase tracking-wider text-destructive-foreground">
                      Esgotado
                    </div>
                  )}
                </div>
                <CardContent className="space-y-1.5 p-3">
                  <div className="line-clamp-2 text-sm font-semibold leading-tight min-h-[2.5em]">
                    {p.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Stars value={Math.round(p.rating_avg || 0)} size={12} />
                    <span className="text-[10px] text-muted-foreground">
                      ({p.rating_count})
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    {hasDiscount ? (
                      <>
                        <span
                          className="text-sm font-bold"
                          style={{ color: themed }}
                        >
                          {Number(p.discount_price).toLocaleString("pt-AO")} Kz
                        </span>
                        <span className="text-[11px] text-muted-foreground line-through">
                          {Number(p.price).toLocaleString("pt-AO")}
                        </span>
                      </>
                    ) : (
                      <span
                        className="text-sm font-bold"
                        style={{ color: themed }}
                      >
                        {Number(p.price).toLocaleString("pt-AO")} Kz
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="w-full text-white"
                    style={{ backgroundColor: themed }}
                    disabled={p.is_sold_out}
                    onClick={(e) => {
                      e.stopPropagation();
                      add(p);
                    }}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" /> Adicionar
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            Sem produtos nesta categoria.
          </div>
        )}
      </main>

      {/* CART FAB mobile */}
      {cart.length > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-5 right-5 z-20 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white shadow-lg sm:hidden"
          style={{ backgroundColor: themed }}
        >
          <ShoppingCart className="h-4 w-4" /> {total.toLocaleString("pt-AO")}{" "}
          Kz
        </button>
      )}

      {/* PRODUCT DETAIL */}
      <Dialog open={!!openP} onOpenChange={() => setOpenP(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {openP && (
            <>
              <DialogHeader>
                <DialogTitle className="line-clamp-2">{openP.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {openP.image_url && (
                  <img
                    src={openP.image_url}
                    alt={openP.name}
                    className="aspect-square w-full rounded object-cover"
                  />
                )}
                <div className="flex items-center gap-2">
                  <Stars value={Math.round(openP.rating_avg || 0)} />
                  <span className="text-sm text-muted-foreground">
                    {openP.rating_avg.toFixed(1)} · {openP.rating_count}{" "}
                    avaliações
                  </span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {openP.description}
                </p>
                <div className="flex items-baseline gap-2">
                  {openP.discount_price ? (
                    <>
                      <span
                        className="text-2xl font-bold"
                        style={{ color: themed }}
                      >
                        {Number(openP.discount_price).toLocaleString("pt-AO")}{" "}
                        Kz
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        {Number(openP.price).toLocaleString("pt-AO")}
                      </span>
                    </>
                  ) : (
                    <span
                      className="text-2xl font-bold"
                      style={{ color: themed }}
                    >
                      {Number(openP.price).toLocaleString("pt-AO")} Kz
                    </span>
                  )}
                </div>
                <Button
                  className="w-full text-white"
                  style={{ backgroundColor: themed }}
                  disabled={openP.is_sold_out}
                  onClick={() => {
                    add(openP);
                    setOpenP(null);
                  }}
                >
                  {openP.is_sold_out ? "Esgotado" : "Adicionar ao carrinho"}
                </Button>

                {/* REVIEWS */}
                <div className="space-y-3 border-t pt-4">
                  <div className="font-semibold">Avaliações</div>
                  <div className="space-y-2 rounded-lg border p-3">
                    <div className="text-sm font-medium">
                      Deixe a sua avaliação
                    </div>
                    <Input
                      placeholder="Seu nome (opcional)"
                      value={reviewForm.name}
                      onChange={(e) =>
                        setReviewForm({ ...reviewForm, name: e.target.value })
                      }
                    />
                    <Stars
                      value={reviewForm.rating}
                      size={20}
                      onChange={(n) =>
                        setReviewForm({ ...reviewForm, rating: n })
                      }
                    />
                    <Textarea
                      placeholder="O que achou do produto?"
                      value={reviewForm.comment}
                      onChange={(e) =>
                        setReviewForm({
                          ...reviewForm,
                          comment: e.target.value,
                        })
                      }
                    />
                    <Button
                      size="sm"
                      onClick={submitReview}
                      disabled={!reviewForm.comment.trim()}
                    >
                      Enviar avaliação
                    </Button>
                  </div>
                  {reviews.length === 0 && (
                    <div className="text-sm text-muted-foreground">
                      Ainda sem avaliações. Seja o primeiro!
                    </div>
                  )}
                  {reviews.map((r) => (
                    <div key={r.id} className="rounded-lg border p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">
                          {r.reviewer_name}
                        </div>
                        <Stars value={r.rating} size={12} />
                      </div>
                      {r.comment && (
                        <p className="text-sm text-muted-foreground">
                          {r.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
