create extension if not exists pgcrypto;

create table if not exists public.human_transfer_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_name text,
  customer_phone text not null,
  customer_email text,
  customer_notes text,
  transfer_status text not null default 'off' check (transfer_status in ('on','off')),
  transfer_reason text,
  transferred_at timestamptz,
  reopened_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create index if not exists idx_human_transfer_user_status on public.human_transfer_requests(user_id, transfer_status, updated_at desc);
create index if not exists idx_human_transfer_phone on public.human_transfer_requests(customer_phone);

alter table public.human_transfer_requests enable row level security;

create policy "human_transfer_self_read"
on public.human_transfer_requests
for select
using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "human_transfer_self_insert"
on public.human_transfer_requests
for insert
with check (auth.uid() = user_id);

create policy "human_transfer_admin_write"
on public.human_transfer_requests
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create or replace function public.touch_human_transfer_requests()
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

drop trigger if exists trg_touch_human_transfer_requests on public.human_transfer_requests;
create trigger trg_touch_human_transfer_requests
before update on public.human_transfer_requests
for each row
execute function public.touch_human_transfer_requests();
