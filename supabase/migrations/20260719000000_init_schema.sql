-- Base schema: a starter cases table for search/cross-check.
-- Extend with real fields once the case data source is known.
-- The app has no Supabase auth (access is gated by a shared app password),
-- so requests use the anon key — policies grant read access to `anon`.

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  case_number text not null unique,
  title text not null,
  parties text,
  status text,
  court text,
  filed_date date,
  created_at timestamptz not null default now()
);

create index if not exists cases_case_number_idx on public.cases (case_number);
create index if not exists cases_title_idx on public.cases using gin (to_tsvector('english', title));

alter table public.cases enable row level security;

create policy "Anyone with the app password can search cases"
  on public.cases for select
  to anon
  using (true);
