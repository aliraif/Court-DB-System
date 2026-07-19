-- Allow modifying existing case databank entries from the admin page.
-- Same access model as the existing select/insert policies — gated by
-- the shared app password, not per-user Supabase auth.

create policy "Anyone with the app password can modify the case databank"
  on public.case_databank for update
  to anon
  using (true)
  with check (true);
