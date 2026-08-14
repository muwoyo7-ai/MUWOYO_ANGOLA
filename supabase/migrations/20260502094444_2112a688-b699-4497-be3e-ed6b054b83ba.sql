DO $$
DECLARE
  uid uuid;
BEGIN
  SELECT id INTO uid FROM auth.users WHERE email = 'tydodo30@gmail.com';
  IF uid IS NULL THEN
    uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
      'tydodo30@gmail.com', crypt('254160814949ZAP', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Muwoyo Admin"}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', 'tydodo30@gmail.com'), 'email', uid::text, now(), now(), now());
  END IF;

  INSERT INTO public.profiles (user_id, email, full_name, onboarding_completed)
  VALUES (uid, 'tydodo30@gmail.com', 'Muwoyo Admin', true)
  ON CONFLICT (user_id) DO NOTHING;

  DELETE FROM public.user_roles WHERE user_id = uid;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin');
END $$;