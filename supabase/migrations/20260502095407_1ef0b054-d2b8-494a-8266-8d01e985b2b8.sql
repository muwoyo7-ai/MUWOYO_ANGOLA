-- Categorias de produtos
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories owner all" ON public.categories FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "categories public read" ON public.categories FOR SELECT USING (true);

-- Avaliações públicas
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  reviewer_name text,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews public read" ON public.product_reviews FOR SELECT USING (true);
CREATE POLICY "reviews public insert" ON public.product_reviews FOR INSERT WITH CHECK (true);

-- Carrossel da loja
CREATE TABLE IF NOT EXISTS public.store_carousel_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL,
  user_id uuid NOT NULL,
  title text,
  subtitle text,
  image_url text,
  bg_color text DEFAULT '#16a34a',
  link_url text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.store_carousel_slides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "slides owner all" ON public.store_carousel_slides FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "slides public read" ON public.store_carousel_slides FOR SELECT USING (true);

-- Novos campos em products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category_ids uuid[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_sold_out boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS rating_avg numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_count integer NOT NULL DEFAULT 0;

-- Cor do header da loja
ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS header_color text DEFAULT '#16a34a';

-- Trigger para atualizar média de avaliações
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pid uuid; avg_rating numeric; cnt integer;
BEGIN
  pid := COALESCE(NEW.product_id, OLD.product_id);
  SELECT COALESCE(AVG(rating),0), COUNT(*) INTO avg_rating, cnt FROM public.product_reviews WHERE product_id = pid;
  UPDATE public.products SET rating_avg = avg_rating, rating_count = cnt WHERE id = pid;
  RETURN NULL;
END $$;
DROP TRIGGER IF EXISTS trg_update_product_rating ON public.product_reviews;
CREATE TRIGGER trg_update_product_rating AFTER INSERT OR DELETE ON public.product_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();