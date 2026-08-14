-- Add transfer_phone to profiles
alter table public.profiles
  add column if not exists transfer_phone text;

-- Create function to insert notification when a human transfer request is created
create or replace function public.notify_on_human_transfer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Insert a notification for the owner (user_id)
  insert into public.notifications (user_id, title, message, type, link)
  values (
    NEW.user_id,
    'Transferido para humano',
    coalesce(NEW.customer_name, 'Cliente') || ' solicita transferência para humano.',
    'info',
    '/transferido-para-humano'
  );

  return NEW;
end;
$$;

drop trigger if exists trg_notify_on_human_transfer on public.human_transfer_requests;
create trigger trg_notify_on_human_transfer
after insert on public.human_transfer_requests
for each row
execute function public.notify_on_human_transfer();
