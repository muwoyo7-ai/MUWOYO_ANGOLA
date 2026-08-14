-- Drop the trigger and function that auto-creates instance_name on user signup
DROP TRIGGER IF EXISTS on_auth_user_created_instance ON auth.users;
DROP TRIGGER IF EXISTS create_instance_on_signup_trigger ON auth.users;
DROP TRIGGER IF EXISTS create_instance_for_new_user_trigger ON auth.users;

DROP FUNCTION IF EXISTS public.create_instance_on_signup() CASCADE;
DROP FUNCTION IF EXISTS public.create_instance_for_new_user() CASCADE;

-- Allow user_id to remain unique but instance_name can be set later
-- Make sure instance_name column allows being set freely (no auto-default)
ALTER TABLE public.instances ALTER COLUMN instance_name DROP DEFAULT;