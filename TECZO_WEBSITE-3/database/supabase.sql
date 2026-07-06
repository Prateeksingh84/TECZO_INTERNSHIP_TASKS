-- =========================================================
-- Teczo Futuristic Realtime Website Backend
-- Supabase PostgreSQL + Auth + Realtime + RLS
-- =========================================================

create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text default '',
  phone text default '',
  service_interest text default 'General',
  budget_range text default '',
  timeline text default '',
  message text not null,
  source text not null default 'website-form',
  consent boolean not null default false,
  status text not null default 'new',
  priority text not null default 'medium',
  admin_notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_lead_status check (status in ('new','contacted','qualified','proposal','won','lost','closed')),
  constraint valid_lead_priority check (priority in ('low','medium','high','urgent')),
  constraint valid_lead_source check (source in ('website-form','chatbot','service-page','manual'))
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  created_at timestamptz default now()
);

create table if not exists public.site_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  page_path text,
  page_title text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists leads_touch_updated_at on public.leads;
create trigger leads_touch_updated_at
before update on public.leads
for each row execute procedure public.touch_updated_at();

alter table public.leads enable row level security;
alter table public.admin_users enable row level security;
alter table public.site_events enable row level security;

drop policy if exists "Public can submit leads" on public.leads;
drop policy if exists "Authenticated can submit leads" on public.leads;
drop policy if exists "Admins can read leads" on public.leads;
drop policy if exists "Admins can update leads" on public.leads;
drop policy if exists "Admins can delete leads" on public.leads;
drop policy if exists "Admins can read admin users" on public.admin_users;
drop policy if exists "Public can create events" on public.site_events;
drop policy if exists "Admins can read events" on public.site_events;

-- Public website visitors can submit form/chatbot leads only.
create policy "Public can submit leads"
on public.leads
for insert
to anon
with check (consent = true);

create policy "Authenticated can submit leads"
on public.leads
for insert
to authenticated
with check (consent = true);

-- Admin-only read/update/delete. Add admin user after creating Auth user.
create policy "Admins can read leads"
on public.leads
for select
to authenticated
using (
  exists (select 1 from public.admin_users where admin_users.user_id = auth.uid())
);

create policy "Admins can update leads"
on public.leads
for update
to authenticated
using (
  exists (select 1 from public.admin_users where admin_users.user_id = auth.uid())
)
with check (
  exists (select 1 from public.admin_users where admin_users.user_id = auth.uid())
);

create policy "Admins can delete leads"
on public.leads
for delete
to authenticated
using (
  exists (select 1 from public.admin_users where admin_users.user_id = auth.uid())
);

create policy "Admins can read admin users"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

create policy "Public can create events"
on public.site_events
for insert
to anon, authenticated
with check (true);

create policy "Admins can read events"
on public.site_events
for select
to authenticated
using (
  exists (select 1 from public.admin_users where admin_users.user_id = auth.uid())
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_priority_idx on public.leads (priority);
create index if not exists leads_source_idx on public.leads (source);
create index if not exists site_events_created_at_idx on public.site_events (created_at desc);

do $$
begin
  alter publication supabase_realtime add table public.leads;
exception when duplicate_object then null;
end $$;

-- After creating admin@teczo.demo in Supabase Auth, run:
-- insert into public.admin_users (user_id, email)
-- values ('PASTE_AUTH_USER_UUID_HERE', 'admin@teczo.demo')
-- on conflict (user_id) do update set email = excluded.email;
