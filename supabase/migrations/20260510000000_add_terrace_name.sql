-- Denormalize terrace name onto every row that references a terrace by id.
-- Lets the admin scan rows in the Supabase dashboard without cross-referencing
-- src/data/terraces.ts. terraces.ts remains the source of truth for names;
-- if a name ever changes there, run scripts/backfill-terrace-names.cjs to
-- refresh existing rows.

alter table public.reviews
  add column if not exists terrace_name text;

alter table public.terrace_events
  add column if not exists terrace_name text;

alter table public.terrace_season_dates
  add column if not exists terrace_name text;

alter table public.terrace_season_date_submissions
  add column if not exists terrace_name text;
