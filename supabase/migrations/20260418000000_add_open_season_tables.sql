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


-- Crowdsourced "this terrace is open" confirmations
-- Supplemental signal for places that haven't submitted official dates.
-- Reports older than 21 days are ignored by GET /api/open-reports.
-- Deduplicated at the API level: same session_id + terrace_id within 7 days = no new row.
create table public.terrace_open_reports (
  id uuid primary key default gen_random_uuid(),
  terrace_id text not null,
  opening_date date not null,
  reported_at timestamptz default now(),
  session_id text not null,
  source text not null default 'crowdsource'
);

create index idx_open_reports_terrace on public.terrace_open_reports(terrace_id, reported_at desc);

alter table public.terrace_open_reports enable row level security;
create policy "public read" on public.terrace_open_reports for select using (true);
