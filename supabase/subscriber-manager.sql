-- बहल झलक Subscriber Manager — सुरक्षित Admin-only संस्करण
-- Supabase SQL Editor में यह पूरा script चलाएँ।

create table if not exists public.subscriber_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  status text not null default 'active'
);

alter table public.subscriber_profiles enable row level security;

-- Browser से table की direct SELECT access policy हटाएँ।
drop policy if exists "subscriber_profiles_admin_read" on public.subscriber_profiles;
drop policy if exists "subscriber_profiles_self_insert" on public.subscriber_profiles;

-- नए Subscriber को Auth signup के समय profile में अपने-आप दर्ज करें।
create or replace function public.handle_new_subscriber()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.subscriber_profiles (id, email, created_at, status)
  values (new.id, new.email, coalesce(new.created_at, now()), 'active')
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_subscriber on auth.users;
create trigger on_auth_user_created_subscriber
after insert on auth.users
for each row execute function public.handle_new_subscriber();

-- Admin के लिए सुरक्षित RPC: table को सीधे browser से पढ़ने के बजाय
-- SECURITY DEFINER function email claim verify करके केवल Admin को rows लौटाता है।
create or replace function public.get_subscriber_profiles_admin()
returns table (
  id uuid,
  email text,
  created_at timestamptz,
  status text
)
language sql
security definer
set search_path = public
as $$
  select sp.id, sp.email, sp.created_at, sp.status
  from public.subscriber_profiles sp
  where auth.jwt() ->> 'email' = 'surenderbugaliya067@gmail.com'
  order by sp.created_at desc;
$$;

revoke all on function public.get_subscriber_profiles_admin() from public;
grant execute on function public.get_subscriber_profiles_admin() to authenticated;

-- पहले से बने Auth users को भी profile table में भरें।
insert into public.subscriber_profiles (id, email, created_at, status)
select id, email, created_at, 'active'
from auth.users
on conflict (id) do update
set email = excluded.email;

-- PostgREST schema cache refresh
notify pgrst, 'reload schema';
