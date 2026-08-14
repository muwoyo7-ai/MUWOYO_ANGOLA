-- Extensions
create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- ============ ENUMS ============
do $$ begin
  create type public.app_role as enum ('admin','sub_admin','client');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.instance_status as enum ('pending','connecting','connected','disconnected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.message_direction as enum ('inbound','outbound');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.message_kind as enum ('text','audio','image','video','document','sticker','location','contact','other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.queue_status as enum ('pending','processing','sent','failed','delivered');
exception when duplicate_object then null; end $$;

-- ============ updated_at helper ============
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text,
  phone text,
  full_name text,
  business_name text,
  business_description text,
  ai_name text default 'Muwoyo',
  ai_rules text,
  status text not null default 'active',
  is_suspended boolean not null default false,
  onboarding_completed boolean not null default false,
  message_limit integer not null default 0,
  messages_received integer not null default 0,
  free_messages_granted boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create trigger trg_profiles_updated before update on public.profiles for each row execute function public.tg_set_updated_at();

-- ============ USER ROLES ============
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null default 'client',
  created_at timestamptz not null default now(),
  unique(user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_admin(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.user_roles where user_id = _user_id and role = 'admin')
$$;

-- ============ INSTANCES ============
create table public.instances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  instance_name text not null unique,
  phone text,
  phone_number text,
  status instance_status not null default 'pending',
  connection_state text,
  evolution_state text,
  automation_paused boolean not null default false,
  qr_code text,
  last_connected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.instances enable row level security;
create trigger trg_instances_updated before update on public.instances for each row execute function public.tg_set_updated_at();

-- ============ WHATSAPP CONTACTS ============
create table public.whatsapp_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  instance_name text,
  phone_number text not null,
  name text,
  should_respond boolean not null default true,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id, phone_number)
);
alter table public.whatsapp_contacts enable row level security;

-- ============ BLOCKED CONTACTS ============
create table public.blocked_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  phone_number text not null,
  reason text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(user_id, phone_number)
);
alter table public.blocked_contacts enable row level security;

-- ============ MESSAGES ============
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  whatsapp_instance_id text,
  phone_number text not null,
  direction message_direction not null,
  kind message_kind not null default 'text',
  message_text text,
  media_url text,
  external_id text,
  ai_responded boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;
create index idx_messages_user_created on public.messages(user_id, created_at desc);
create index idx_messages_phone on public.messages(user_id, phone_number);

-- ============ STORES ============
create table public.stores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  cover_url text,
  theme_color text default '#16a34a',
  checkout_whatsapp text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.stores enable row level security;
create trigger trg_stores_updated before update on public.stores for each row execute function public.tg_set_updated_at();

-- ============ PRODUCTS ============
create table public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  price numeric(12,2) not null default 0,
  discount_price numeric(12,2),
  stock integer not null default 0,
  category text,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.products enable row level security;
create trigger trg_products_updated before update on public.products for each row execute function public.tg_set_updated_at();
create index idx_products_store on public.products(store_id);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.product_images enable row level security;

-- ============ STORE ORDERS (filled by AI) ============
create table public.store_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_name text,
  customer_phone text,
  customer_location text,
  items jsonb not null default '[]'::jsonb,
  total numeric(12,2) default 0,
  notes text,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.store_orders enable row level security;
create trigger trg_orders_updated before update on public.store_orders for each row execute function public.tg_set_updated_at();

-- ============ APPOINTMENTS (filled by AI) ============
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_name text,
  customer_phone text,
  service text,
  description text,
  scheduled_at timestamptz,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.appointments enable row level security;
create trigger trg_appointments_updated before update on public.appointments for each row execute function public.tg_set_updated_at();

-- ============ NOTIFICATIONS ============
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info',
  link text,
  image_url text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;
create index idx_notifications_user on public.notifications(user_id, created_at desc);

-- ============ MESSAGE QUEUE ============
create table public.message_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  instance_name text not null,
  remote_jid text not null,
  payload jsonb not null,
  status queue_status not null default 'pending',
  attempts integer not null default 0,
  last_error text,
  external_message_id text,
  scheduled_for timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.message_queue enable row level security;
create trigger trg_queue_updated before update on public.message_queue for each row execute function public.tg_set_updated_at();
create index idx_queue_status_sched on public.message_queue(status, scheduled_for);

-- ============ AI DOCUMENTS (RAG) ============
create table public.ai_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  content text not null,
  source text,
  embedding vector(1536),
  created_at timestamptz not null default now()
);
alter table public.ai_documents enable row level security;
create index idx_ai_docs_user on public.ai_documents(user_id);
create index idx_ai_docs_embedding on public.ai_documents using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create or replace function public.match_ai_documents(_user_id uuid, _query vector(1536), _limit int default 5)
returns table(id uuid, title text, content text, similarity float)
language sql stable security definer set search_path = public as $$
  select id, title, content, 1 - (embedding <=> _query) as similarity
  from public.ai_documents
  where user_id = _user_id and embedding is not null
  order by embedding <=> _query
  limit _limit
$$;

-- ============ TOP UP ============
create table public.top_up_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  messages integer not null,
  price_kz numeric(12,2) not null,
  is_active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.top_up_packages enable row level security;

create table public.top_up_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  package_id uuid references public.top_up_packages(id) on delete set null,
  messages integer not null,
  amount_kz numeric(12,2) not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users(id) on delete set null
);
alter table public.top_up_requests enable row level security;

-- Seed packages
insert into public.top_up_packages (name, messages, price_kz, position) values
  ('Muwoyo Small', 500, 7500, 1),
  ('Muwoyo Medium', 1000, 14000, 2),
  ('Muwoyo Medium II', 3000, 40000, 3),
  ('Muwoyo Big', 5000, 65000, 4)
on conflict do nothing;

-- ============ RLS POLICIES ============
-- profiles
create policy "profiles self read" on public.profiles for select using (auth.uid() = user_id);
create policy "profiles self update" on public.profiles for update using (auth.uid() = user_id);
create policy "profiles self insert" on public.profiles for insert with check (auth.uid() = user_id);
create policy "profiles admin all" on public.profiles for all using (public.is_admin(auth.uid()));
create policy "profiles subadmin read own" on public.profiles for select using (created_by = auth.uid());

-- user_roles
create policy "roles self read" on public.user_roles for select using (auth.uid() = user_id);
create policy "roles admin all" on public.user_roles for all using (public.is_admin(auth.uid()));

-- instances
create policy "instances owner all" on public.instances for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "instances admin all" on public.instances for all using (public.is_admin(auth.uid()));

-- whatsapp_contacts
create policy "contacts owner all" on public.whatsapp_contacts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- blocked_contacts
create policy "blocks owner all" on public.blocked_contacts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- messages
create policy "messages owner read" on public.messages for select using (auth.uid() = user_id);
create policy "messages admin all" on public.messages for all using (public.is_admin(auth.uid()));

-- stores (public read)
create policy "stores public read" on public.stores for select using (true);
create policy "stores owner all" on public.stores for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- products (public read)
create policy "products public read" on public.products for select using (true);
create policy "products owner all" on public.products for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- product_images public read
create policy "pimages public read" on public.product_images for select using (true);
create policy "pimages owner all" on public.product_images for all using (
  exists(select 1 from public.products p where p.id = product_id and p.user_id = auth.uid())
) with check (
  exists(select 1 from public.products p where p.id = product_id and p.user_id = auth.uid())
);

-- store_orders
create policy "orders owner all" on public.store_orders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "orders admin all" on public.store_orders for all using (public.is_admin(auth.uid()));

-- appointments
create policy "appts owner all" on public.appointments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "appts admin all" on public.appointments for all using (public.is_admin(auth.uid()));

-- notifications
create policy "notif self read" on public.notifications for select using (auth.uid() = user_id);
create policy "notif self update" on public.notifications for update using (auth.uid() = user_id);
create policy "notif admin all" on public.notifications for all using (public.is_admin(auth.uid()));

-- message_queue
create policy "queue owner read" on public.message_queue for select using (auth.uid() = user_id);
create policy "queue admin all" on public.message_queue for all using (public.is_admin(auth.uid()));

-- ai_documents
create policy "aidocs owner all" on public.ai_documents for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- top_up_packages public read
create policy "pkg public read" on public.top_up_packages for select using (true);
create policy "pkg admin all" on public.top_up_packages for all using (public.is_admin(auth.uid()));

-- top_up_requests
create policy "topup self read" on public.top_up_requests for select using (auth.uid() = user_id);
create policy "topup self insert" on public.top_up_requests for insert with check (auth.uid() = user_id);
create policy "topup admin all" on public.top_up_requests for all using (public.is_admin(auth.uid()));

-- ============ TRIGGER: auto-create profile on signup ============
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, email, phone, full_name, created_by)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    nullif(new.raw_user_meta_data->>'created_by','')::uuid
  )
  on conflict (user_id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'client')
  on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- ============ TRIGGER: notify admin on subadmin actions ============
create or replace function public.notify_admin_on_user_create()
returns trigger language plpgsql security definer set search_path = public as $$
declare admin_id uuid;
begin
  if new.created_by is not null and public.has_role(new.created_by, 'sub_admin') then
    for admin_id in select user_id from public.user_roles where role = 'admin' loop
      insert into public.notifications (user_id, title, message, type)
      values (admin_id, 'Novo usuário cadastrado', 'Subadmin cadastrou: ' || coalesce(new.full_name, new.email, new.phone, 'novo usuário'), 'subadmin_create');
    end loop;
  end if;
  return new;
end $$;

drop trigger if exists trg_notify_admin_user on public.profiles;
create trigger trg_notify_admin_user after insert on public.profiles
for each row execute function public.notify_admin_on_user_create();

-- ============ TRIGGER: notify on order/appointment ============
create or replace function public.notify_owner_new_order()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (user_id, title, message, type, link)
  values (new.user_id, 'Novo pedido recebido', 'Cliente: ' || coalesce(new.customer_name, new.customer_phone, 'desconhecido'), 'new_order', '/dashboard/pedidos');
  return new;
end $$;

drop trigger if exists trg_notify_order on public.store_orders;
create trigger trg_notify_order after insert on public.store_orders
for each row execute function public.notify_owner_new_order();

create or replace function public.notify_owner_new_appointment()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (user_id, title, message, type, link)
  values (new.user_id, 'Novo agendamento', 'Cliente: ' || coalesce(new.customer_name, new.customer_phone, 'desconhecido'), 'new_appointment', '/dashboard/agenda');
  return new;
end $$;

drop trigger if exists trg_notify_appt on public.appointments;
create trigger trg_notify_appt after insert on public.appointments
for each row execute function public.notify_owner_new_appointment();

-- ============ STORAGE BUCKETS ============
insert into storage.buckets (id, name, public) values ('store-assets', 'store-assets', true)
on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('business-docs', 'business-docs', false)
on conflict (id) do nothing;

create policy "store-assets public read" on storage.objects for select using (bucket_id = 'store-assets');
create policy "store-assets owner write" on storage.objects for insert with check (bucket_id = 'store-assets' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "store-assets owner update" on storage.objects for update using (bucket_id = 'store-assets' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "store-assets owner delete" on storage.objects for delete using (bucket_id = 'store-assets' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "biz-docs owner read" on storage.objects for select using (bucket_id = 'business-docs' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "biz-docs owner write" on storage.objects for insert with check (bucket_id = 'business-docs' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "biz-docs owner delete" on storage.objects for delete using (bucket_id = 'business-docs' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============ REALTIME ============
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.instances;
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.store_orders;
alter publication supabase_realtime add table public.appointments;