-- SQL para corrigir o trigger handle_new_user
-- Este trigger não deve adicionar role 'client' quando o usuário for subadmin

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

  -- Só adicionar role 'client' se NÃO for subadmin
  -- A função createSubadmin vai adicionar a role 'sub_admin' depois
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