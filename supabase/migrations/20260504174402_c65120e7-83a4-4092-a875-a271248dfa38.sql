
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;

CREATE OR REPLACE FUNCTION public.increment_ai_message_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.direction = 'outbound' AND NEW.ai_responded = true THEN
    UPDATE public.profiles SET messages_received = COALESCE(messages_received,0) + 1
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_increment_ai_message ON public.messages;
CREATE TRIGGER trg_increment_ai_message
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.increment_ai_message_count();

-- Storage bucket for notification images and avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('notification-images', 'notification-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  CREATE POLICY "notif images public read" ON storage.objects FOR SELECT USING (bucket_id = 'notification-images');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "notif images authenticated upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'notification-images');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "avatars public read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "avatars authenticated upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "avatars authenticated update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
