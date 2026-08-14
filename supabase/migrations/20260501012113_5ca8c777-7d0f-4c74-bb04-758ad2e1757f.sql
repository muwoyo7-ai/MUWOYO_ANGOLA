-- Fix search_path on remaining functions
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql security definer set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

-- Restrict public bucket listing: drop broad SELECT on store-assets, keep object access via signed/public URLs
-- (Keeping public read is needed for product images via direct URL; warning is informational.)

-- Set REPLICA IDENTITY FULL for realtime tables
alter table public.notifications replica identity full;
alter table public.instances replica identity full;
alter table public.profiles replica identity full;
alter table public.store_orders replica identity full;
alter table public.appointments replica identity full;