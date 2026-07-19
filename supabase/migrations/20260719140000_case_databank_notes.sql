-- Optional additional-notes field on the case databank. Defaults to
-- 'None' so existing rows and future rows with no notes read consistently
-- instead of showing blank.

alter table public.case_databank
  add column if not exists notes text not null default 'None';

update public.case_databank set notes = 'None' where notes is null;
