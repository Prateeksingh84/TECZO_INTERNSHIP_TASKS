create extension if not exists pgcrypto;

-- Main leads table
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  message text not null,
  status text not null default 'new',
  priority text not null default 'medium',
  admin_notes text default '',
  created_at timestamptz not null default now()
);

-- Add missing columns safely if table already exists
alter table public.leads
add column if not exists priority text not null default 'medium';

alter table public.leads
add column if not exists admin_notes text default '';

alter table public.leads
alter column status set default 'new';

alter table public.leads
alter column priority set default 'medium';

alter table public.leads
alter column created_at set default now();

-- Status constraint
alter table public.leads
drop constraint if exists valid_lead_status;

alter table public.leads
add constraint valid_lead_status
check (
  status in ('new', 'contacted', 'qualified', 'closed')
);

-- Priority constraint
alter table public.leads
drop constraint if exists valid_lead_priority;

alter table public.leads
add constraint valid_lead_priority
check (
  priority in ('low', 'medium', 'high', 'urgent')
);

-- Admin users table
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.leads enable row level security;
alter table public.admin_users enable row level security;

-- Remove old policies
drop policy if exists "Anyone can submit leads" on public.leads;
drop policy if exists "Public visitors can submit leads" on public.leads;
drop policy if exists "Authenticated users can submit leads" on public.leads;
drop policy if exists "Authenticated users can read leads" on public.leads;
drop policy if exists "Authenticated users can update leads" on public.leads;
drop policy if exists "Authenticated users can delete leads" on public.leads;
drop policy if exists "Admins can read leads" on public.leads;
drop policy if exists "Admins can update leads" on public.leads;
drop policy if exists "Admins can delete leads" on public.leads;
drop policy if exists "Admins can read admin_users" on public.admin_users;

-- Public website visitors can submit contact form leads
create policy "Public visitors can submit leads"
on public.leads
for insert
to anon
with check (true);

-- Logged-in users/admins can also submit leads
create policy "Authenticated users can submit leads"
on public.leads
for insert
to authenticated
with check (true);

-- Logged-in admin can read leads
-- This is kept simple for your current project.
create policy "Authenticated users can read leads"
on public.leads
for select
to authenticated
using (true);

-- Logged-in admin can update status, priority and notes
create policy "Authenticated users can update leads"
on public.leads
for update
to authenticated
using (true)
with check (true);

-- Logged-in admin can delete leads
create policy "Authenticated users can delete leads"
on public.leads
for delete
to authenticated
using (true);

-- Admin can read their own admin record
create policy "Admins can read admin_users"
on public.admin_users
for select
to authenticated
using (
  user_id = auth.uid()
);

-- Enable realtime for leads
do $$
begin
  alter publication supabase_realtime add table public.leads;
exception
  when duplicate_object then null;
end $$;