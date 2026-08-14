-- AI token monitoring schema
create extension if not exists pgcrypto;

create table if not exists public.ai_models (
  id uuid primary key default gen_random_uuid(),
  model_name text not null unique,
  input_cost_per_1m_usd numeric(18,8) not null check (input_cost_per_1m_usd >= 0),
  output_cost_per_1m_usd numeric(18,8) not null check (output_cost_per_1m_usd >= 0),
  estimated_tokens_per_message integer not null check (estimated_tokens_per_message > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_ai_deposits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_usd numeric(18,8) not null check (amount_usd >= 0),
  description text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create table if not exists public.ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  execution_id text,
  workflow_name text,
  workflow_id text,
  model_id uuid not null references public.ai_models(id),
  prompt_tokens bigint not null default 0 check (prompt_tokens >= 0),
  completion_tokens bigint not null default 0 check (completion_tokens >= 0),
  total_tokens bigint not null default 0 check (total_tokens >= 0),
  cost_usd numeric(18,8) not null check (cost_usd >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.user_ai_balances (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_deposited_usd numeric(18,8) not null default 0 check (total_deposited_usd >= 0),
  total_spent_usd numeric(18,8) not null default 0 check (total_spent_usd >= 0),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ai_deposits_user_created on public.user_ai_deposits(user_id, created_at desc);
create index if not exists idx_ai_usage_user_created on public.ai_usage_events(user_id, created_at desc);
create index if not exists idx_ai_usage_model on public.ai_usage_events(model_id);
create index if not exists idx_ai_usage_execution on public.ai_usage_events(execution_id);
create index if not exists idx_ai_models_name on public.ai_models(model_name);

create or replace function public.set_ai_usage_totals()
returns trigger
language plpgsql
as $$
begin
  new.total_tokens := coalesce(new.prompt_tokens,0) + coalesce(new.completion_tokens,0);
  return new;
end;
$$;

drop trigger if exists trg_set_ai_usage_totals on public.ai_usage_events;
create trigger trg_set_ai_usage_totals
before insert or update of prompt_tokens, completion_tokens
on public.ai_usage_events
for each row
execute function public.set_ai_usage_totals();

create or replace function public.calculate_usage_cost(
  p_model_id uuid,
  p_prompt_tokens bigint,
  p_completion_tokens bigint
)
returns numeric
language sql
stable
as $$
  select
    (
      (select input_cost_per_1m_usd from public.ai_models where id = p_model_id) * p_prompt_tokens / 1000000
    ) + (
      (select output_cost_per_1m_usd from public.ai_models where id = p_model_id) * p_completion_tokens / 1000000
    );
$$;

alter table public.ai_models enable row level security;
alter table public.user_ai_deposits enable row level security;
alter table public.ai_usage_events enable row level security;
alter table public.user_ai_balances enable row level security;

create policy "ai_models_read_all"
on public.ai_models
for select
using (true);

create policy "ai_models_admin_write"
on public.ai_models
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "deposits_self_read"
on public.user_ai_deposits
for select
using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "deposits_admin_write"
on public.user_ai_deposits
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "usage_self_read"
on public.ai_usage_events
for select
using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "usage_insert_own"
on public.ai_usage_events
for insert
with check (auth.uid() = user_id);

create policy "balances_self_read"
on public.user_ai_balances
for select
using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "balances_admin_write"
on public.user_ai_balances
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create or replace view public.v_ai_user_balance_dashboard as
with deposits as (
  select
    user_id,
    coalesce(sum(amount_usd), 0) as total_depositado_usd
  from public.user_ai_deposits
  group by user_id
), usage as (
  select
    user_id,
    coalesce(sum(cost_usd), 0) as total_gasto_usd
  from public.ai_usage_events
  group by user_id
), base as (
  select
    d.user_id,
    coalesce(d.total_depositado_usd, 0) as total_depositado_usd,
    coalesce(u.total_gasto_usd, 0) as total_gasto_usd,
    coalesce(d.total_depositado_usd, 0) - coalesce(u.total_gasto_usd, 0) as saldo_atual_usd
  from deposits d
  full outer join usage u on u.user_id = d.user_id
)
select
  b.user_id,
  b.total_depositado_usd,
  b.total_gasto_usd,
  b.saldo_atual_usd,
  case
    when b.saldo_atual_usd <= 0 then 0
    else floor(b.saldo_atual_usd / (
      select coalesce(avg((input_cost_per_1m_usd + output_cost_per_1m_usd) / 1000000 * estimated_tokens_per_message), 0)
      from public.ai_models
    ))
  end as mensagens_restantes_estimadas
from base b;
