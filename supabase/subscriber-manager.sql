-- बहल झलक Subscriber Manager
-- Supabase SQL Editor में यह script एक बार चलाएँ।
create table if not exists public.subscriber_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  status text not null default 'active'
);
alter table public.subscriber_profiles enable row level security;
drop policy if exists "subscriber_profiles_admin_read" on public.subscriber_profiles;
create policy "subscriber_profiles_admin_read" on public.subscriber_profiles
for select to authenticated using (auth.jwt() ->> 'email' = 'surenderbugaliya067@gmail.com');
drop policy if exists "subscriber_profiles_self_insert" on public.subscriber_profiles;
create policy "subscriber_profiles_self_insert" on public.subscriber_profiles
for insert to authenticated with check (id = auth.uid() and email = auth.jwt() ->> 'email');
