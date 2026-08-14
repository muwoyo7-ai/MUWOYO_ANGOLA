alter table public.profiles
  add column if not exists ai_personality text,
  add column if not exists appointment_duration_minutes integer default 30 not null check (appointment_duration_minutes between 10 and 240),
  add column if not exists accepts_appointments boolean not null default true;

create index if not exists idx_profiles_accepts_appointments on public.profiles(accepts_appointments);
create index if not exists idx_profiles_appointment_duration on public.profiles(appointment_duration_minutes);
