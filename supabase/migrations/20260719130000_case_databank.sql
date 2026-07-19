-- Case databank: admin-entered issue / case law / findings records.
-- Same access model as `cases` — no per-user Supabase auth yet, the whole
-- app (including the admin page) sits behind the shared app password, so
-- both read and insert are granted to `anon`.

create table if not exists public.case_databank (
  id uuid primary key default gen_random_uuid(),
  issue text not null,
  case_law text not null,
  findings text not null,
  created_at timestamptz not null default now()
);

create index if not exists case_databank_issue_idx on public.case_databank (issue);
create index if not exists case_databank_search_idx on public.case_databank
  using gin (to_tsvector('english', issue || ' ' || case_law || ' ' || findings));

alter table public.case_databank enable row level security;

create policy "Anyone with the app password can read the case databank"
  on public.case_databank for select
  to anon
  using (true);

create policy "Anyone with the app password can add to the case databank"
  on public.case_databank for insert
  to anon
  with check (true);
