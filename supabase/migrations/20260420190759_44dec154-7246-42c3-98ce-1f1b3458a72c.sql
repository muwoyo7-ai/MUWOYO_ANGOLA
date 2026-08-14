-- Add phone_number column if missing (we already have 'phone', but spec asks for phone_number)
ALTER TABLE public.instances ADD COLUMN IF NOT EXISTS phone_number text;

-- Ensure unique user_id (one instance per user)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'instances_user_id_unique'
  ) THEN
    BEGIN
      ALTER TABLE public.instances ADD CONSTRAINT instances_user_id_unique UNIQUE (user_id);
    EXCEPTION WHEN duplicate_table THEN NULL;
    END;
  END IF;
END $$;

-- Ensure unique instance_name
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'instances_instance_name_unique'
  ) THEN
    BEGIN
      ALTER TABLE public.instances ADD CONSTRAINT instances_instance_name_unique UNIQUE (instance_name);
    EXCEPTION WHEN duplicate_table THEN NULL;
    END;
  END IF;
END $$;

-- Default connection_state
ALTER TABLE public.instances ALTER COLUMN connection_state SET DEFAULT 'disconnected';

-- Trigger to auto-create instance row when a new user signs up
CREATE OR REPLACE FUNCTION public.create_instance_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.instances (user_id, instance_name, connection_state, status)
  VALUES (
    NEW.id,
    'user-' || replace(NEW.id::text, '-', ''),
    'disconnected',
    'placeholder'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_instance ON auth.users;
CREATE TRIGGER on_auth_user_created_instance
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.create_instance_on_signup();