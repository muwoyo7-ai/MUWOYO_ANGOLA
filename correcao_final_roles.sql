-- SQL FINAL e SEGURO - Trata usuários normais e subadmins corretamente

-- 1. PRIMEIRO: Verificar trigger atual (garantir que está correto)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Inserir profile (sempre necessário)
  insert into public.profiles (user_id, email, phone, full_name, created_by)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    nullif(new.raw_user_meta_data->>'created_by','')::uuid
  )
  on conflict (user_id) do nothing;

  -- SÓ adicionar role 'client' se NÃO for subadmin
  if new.raw_user_meta_data->>'is_subadmin' is null then
    insert into public.user_roles (user_id, role)
    values (new.id, 'client')
    on conflict do nothing;
  end if;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- 2. CORRIGIR usuários que já foram criados mas não receberam role
-- Esta query só afeta usuários que NÃO TÊM nenhuma role (evita duplicar roles)

-- 2.1 Adicionar role 'client' para usuários normais sem role
INSERT INTO user_roles (user_id, role)
SELECT DISTINCT p.user_id, 'client'::app_role
FROM profiles p
WHERE p.user_id NOT IN (SELECT DISTINCT user_id FROM user_roles) -- sem nenhuma role
    AND (p.created_by IS NULL -- usuários normais (criados por eles mesmos)
         OR p.created_by NOT IN (SELECT user_id FROM user_roles WHERE role = 'admin')) -- ou criados por não-admins
    AND p.user_id NOT IN (
        SELECT user_id FROM auth.users 
        WHERE raw_user_meta_data->>'is_subadmin' = 'true'
    );

-- 2.2 Adicionar role 'sub_admin' para subadmins sem role
INSERT INTO user_roles (user_id, role)
SELECT DISTINCT p.user_id, 'sub_admin'::app_role
FROM profiles p
WHERE p.user_id NOT IN (SELECT DISTINCT user_id FROM user_roles) -- sem nenhuma role
    AND p.created_by IS NOT NULL 
    AND p.created_by IN (SELECT user_id FROM user_roles WHERE role = 'admin') -- criados por admin
    AND p.user_id IN (
        SELECT user_id FROM auth.users 
        WHERE raw_user_meta_data->>'is_subadmin' = 'true'
    );

-- 3. VERIFICAR resultado final
SELECT 
    p.user_id,
    p.full_name,
    p.email,
    p.created_at,
    array_agg(ur.role::text) as roles_atuais,
    CASE 
        WHEN p.created_by IS NULL THEN 'Usuário Normal (auto-registro)'
        WHEN p.created_by IN (SELECT user_id FROM user_roles WHERE role = 'admin') THEN 'Criado por Admin'
        ELSE 'Outro'
    END as tipo_criacao
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
GROUP BY p.user_id, p.full_name, p.email, p.created_at, p.created_by
ORDER BY p.created_at DESC;