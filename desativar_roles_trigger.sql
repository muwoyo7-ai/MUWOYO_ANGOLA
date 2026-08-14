-- SOLUÇÃO FINAL: Desativar inserção de roles no trigger
-- Deixar a função admin-users controlar TUDO

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Apenas inserir profile, NADA de roles
  insert into public.profiles (user_id, email, phone, full_name, created_by)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    nullif(new.raw_user_meta_data->>'created_by','')::uuid
  )
  on conflict (user_id) do nothing;

  -- NÃO inserir nenhuma role aqui!
  -- A função admin-users vai inserir a role correta

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- Verificar se está funcionando
SELECT 
    p.user_id,
    p.full_name,
    p.email,
    p.created_at,
    array_agg(ur.role::text) as roles_atuais,
    au.raw_user_meta_data->>'is_subadmin' as is_subadmin
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
LEFT JOIN auth.users au ON p.user_id = au.id
GROUP BY p.user_id, p.full_name, p.email, p.created_at, au.raw_user_meta_data
ORDER BY p.created_at DESC;