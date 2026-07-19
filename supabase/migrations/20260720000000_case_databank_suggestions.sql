-- Fuzzy "did you mean" suggestions for the case databank search, so a
-- typo'd search term can still surface close matches instead of a dead
-- end. Uses pg_trgm's word_similarity, which scores how well the search
-- term matches *any* substring of a field — better suited to a short
-- query against long findings text than plain trigram similarity.

create extension if not exists pg_trgm;

create index if not exists case_databank_issue_trgm_idx
  on public.case_databank using gin (issue gin_trgm_ops);
create index if not exists case_databank_case_law_trgm_idx
  on public.case_databank using gin (case_law gin_trgm_ops);
create index if not exists case_databank_findings_trgm_idx
  on public.case_databank using gin (findings gin_trgm_ops);

create or replace function public.case_databank_suggestions(search_term text, match_limit int default 5)
returns setof public.case_databank
language sql
stable
as $$
  select *
  from public.case_databank
  where word_similarity(search_term, issue) > 0.25
     or word_similarity(search_term, case_law) > 0.25
     or word_similarity(search_term, findings) > 0.25
  order by greatest(
    word_similarity(search_term, issue),
    word_similarity(search_term, case_law),
    word_similarity(search_term, findings)
  ) desc
  limit match_limit;
$$;

grant execute on function public.case_databank_suggestions(text, int) to anon;
