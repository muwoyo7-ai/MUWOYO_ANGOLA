-- Solução permanente para evitar roles duplicadas

-- 1. PRIMEIRO: Limpar todas as duplicações existentes
-- Para cada usuário, manter apenas a role mais importante (admin > sub_admin > client)
DELETE FROM user_roles 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM user_roles 
  ORDER BY user_id, 
           CASE role 
             WHEN 'admin' THEN 1 
             WHEN 'sub_admin' THEN 2 
             WHEN 'client' THEN 3 
           END
);

-- 2. Criar constraint única para garantir que cada usuário tenha apenas uma role
ALTER TABLE user_roles 
DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key,
ADD CONSTRAINT user_roles_user_id_unique UNIQUE (user_id);

-- 3. Criar novo trigger que NÃO crie role automaticamente para subadmins
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Criar profile
  INSERT INTO public.profiles (user_id, email, phone, full_name, created_by)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NULLIF(NEW.raw_user_meta_data->>'created_by','')::uuid
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Criar role SOMENTE se não for criado por um subadmin
  -- Se for criado por subadmin, a role será criada posteriormente pela função admin-users
  IF NEW.raw_user_meta_data->>'created_by' IS NULL OR NEW.raw_user_meta_data->>'created_by' = '' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'client')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END $$;

-- 4. Verificar se ficou tudo certo
SELECT user_id, role, created_at
FROM user_roles 
ORDER BY user_id;