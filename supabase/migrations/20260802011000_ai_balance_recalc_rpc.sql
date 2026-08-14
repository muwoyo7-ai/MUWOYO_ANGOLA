create or replace function public.recalculate_all_user_ai_balances()
returns table (
  user_id uuid,
  total_depositado_usd numeric,
  total_gasto_usd numeric,
  saldo_atual_usd numeric,
  mensagens_restantes_estimadas bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
begin
  delete from public.user_ai_balances;

  for r in
    select
      d.user_id,
      coalesce(sum(d.amount_usd), 0) as total_depositado_usd,
      coalesce((select sum(cost_usd) from public.ai_usage_events where user_id = d.user_id), 0) as total_gasto_usd
    from public.user_ai_deposits d
    group by d.user_id
  loop
    insert into public.user_ai_balances(user_id, total_deposited_usd, total_spent_usd, updated_at)
    values (
      r.user_id,
      r.total_depositado_usd,
      r.total_gasto_usd,
      now()
    )
    on conflict (user_id)
    do update set
      total_deposited_usd = excluded.total_deposited_usd,
      total_spent_usd = excluded.total_spent_usd,
      updated_at = now();
  end loop;

  return query
  select
    b.user_id,
    b.total_deposited_usd,
    b.total_spent_usd,
    b.total_deposited_usd - b.total_spent_usd as saldo_atual_usd,
    floor((b.total_deposited_usd - b.total_spent_usd) / coalesce((
      select avg(((input_cost_per_1m_usd + output_cost_per_1m_usd) / 1000000) * estimated_tokens_per_message)
      from public.ai_models
    ), 0))::bigint as mensagens_restantes_estimadas
  from public.user_ai_balances b;
end;
$$;

grant execute on function public.recalculate_all_user_ai_balances() to authenticated;
