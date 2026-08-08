-- Salt Lash City initial schema
-- Run in Supabase SQL editor or via CLI.

create table if not exists public.leads (
  id bigint generated always as identity primary key,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  message text not null,
  service_interest text,
  source_page text not null default '/',
  landing_url text,
  referrer_url text,
  created_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);

alter table public.leads enable row level security;

-- No anon/authenticated policies on purpose.
-- Inserts happen from the Vercel API using the service role key.
