-- Business-submitted season dates (authoritative, one row per terrace)
-- Written directly by POST /api/season-dates when owners submit the edit form with dates.
-- Bypasses the corrections review queue because opening dates are time-sensitive.
create table public.terrace_season_dates (
  terrace_id text primary key,
  opening_date date not null,
  closing_date date,
  updated_at timestamptz default now(),
  submitter_email text
);

alter table public.terrace_season_dates enable row level security;
create policy "public read" on public.terrace_season_dates for select using (true);
