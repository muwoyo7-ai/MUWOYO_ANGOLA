create extension if not exists pgcrypto;

create table if not exists public.push_dispatch_queue (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid not null references public.notifications(id) on delete cascade,
  processed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_push_dispatch_notification on public.push_dispatch_queue(notification_id);

-- After insert on notifications, add an item to the dispatch queue and notify listeners
create or replace function public.enqueue_push_dispatch()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.push_dispatch_queue(notification_id) values (NEW.id);
  perform pg_notify('push_dispatch', NEW.id::text);
  return NEW;
end;
$$;

drop trigger if exists trg_enqueue_push_dispatch on public.notifications;
create trigger trg_enqueue_push_dispatch
after insert on public.notifications
for each row
execute function public.enqueue_push_dispatch();
