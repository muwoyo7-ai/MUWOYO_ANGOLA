ALTER TABLE public.instances
  ADD COLUMN IF NOT EXISTS automation_paused boolean NOT NULL DEFAULT false;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS discount_policy text,
  ADD COLUMN IF NOT EXISTS stock integer,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS theme_color text NOT NULL DEFAULT 'emerald',
  ADD COLUMN IF NOT EXISTS checkout_whatsapp text,
  ADD COLUMN IF NOT EXISTS public_description text;

UPDATE public.stores
SET slug = lower(regexp_replace(coalesce(business_name, 'loja') || '-' || substring(id::text, 1, 8), '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS stores_slug_key ON public.stores(slug);
CREATE INDEX IF NOT EXISTS idx_instances_user_id ON public.instances(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_daily_direct ON public.messages(user_id, created_at) WHERE direction = 'inbound' AND phone_number NOT LIKE '%-%';

CREATE TABLE IF NOT EXISTS public.whatsapp_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  instance_name text,
  name text,
  phone_number text NOT NULL,
  profile_pic_url text,
  should_respond boolean NOT NULL DEFAULT true,
  last_message_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, phone_number)
);

ALTER TABLE public.whatsapp_contacts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users manage own whatsapp contacts"
  ON public.whatsapp_contacts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TRIGGER update_whatsapp_contacts_updated_at
BEFORE UPDATE ON public.whatsapp_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.blocked_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  instance_name text,
  phone_number text NOT NULL,
  contact_name text,
  is_active boolean NOT NULL DEFAULT true,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, phone_number)
);

ALTER TABLE public.blocked_contacts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users manage own blocked contacts"
  ON public.blocked_contacts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TRIGGER update_blocked_contacts_updated_at
BEFORE UPDATE ON public.blocked_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  price numeric DEFAULT 0,
  stock integer,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users manage own product variants"
  ON public.product_variants
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public can view active product variants"
  ON public.product_variants
  FOR SELECT
  TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_variants.product_id
      AND p.is_active = true
  ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TRIGGER update_product_variants_updated_at
BEFORE UPDATE ON public.product_variants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DO $$ BEGIN
  CREATE POLICY "Public can view active stores"
  ON public.stores
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public can view active products"
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

INSERT INTO storage.buckets (id, name, public)
VALUES ('store-assets', 'store-assets', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  CREATE POLICY "Store assets are publicly readable"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'store-assets');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users upload own store assets"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'store-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users update own store assets"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'store-assets' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'store-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users delete own store assets"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'store-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;