create extension if not exists pgcrypto;

create table if not exists public.web_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text,
  auth text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_web_push_subscriptions_user on public.web_push_subscriptions(user_id);
create index if not exists idx_web_push_subscriptions_endpoint on public.web_push_subscriptions(endpoint);

alter table public.web_push_subscriptions enable row level security;

create policy "web_push_subscriptions_select_self_or_admin"
on public.web_push_subscriptions
for select
using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "web_push_subscriptions_insert_self_or_admin"
on public.web_push_subscriptions
for insert
with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "web_push_subscriptions_update_self_or_admin"
on public.web_push_subscriptions
for update
using (auth.uid() = user_id or public.is_admin(auth.uid()))
with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "web_push_subscriptions_delete_self_or_admin"
on public.web_push_subscriptions
for delete
using (auth.uid() = user_id or public.is_admin(auth.uid()));

create or replace function public.touch_web_push_subscriptions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_web_push_subscriptions on public.web_push_subscriptions;
create trigger trg_touch_web_push_subscriptions
before update on public.web_push_subscriptions
for each row
execute function public.touch_web_push_subscriptions();

create or replace view public.v_web_push_subscriptions_by_user as
select
  id,
  user_id,
  endpoint,
  p256dh,
  auth,
  created_at,
  updated_at
from public.web_push_subscriptions;
