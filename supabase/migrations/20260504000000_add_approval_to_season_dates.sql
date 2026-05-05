-- Two-table moderation flow for opening date submissions:
--
--   terrace_season_date_submissions  — append-only queue. One row per submission.
--                                       Holds submitter info, decision state,
--                                       and the per-submission undo token.
--   terrace_season_dates             — canonical "what the public sees". One row
--                                       per terrace. Only ever written by the
--                                       approval action via /api/discord/interactions.
--
-- The /open page POSTs into the queue. The Discord buttons flip queue rows
-- between pending → approved/rejected, and an approval also upserts the
-- canonical row. /api/open-reports continues to read only the canonical
-- table, so the public surface stays simple.

create table if not exists public.terrace_season_date_submissions (
  id uuid primary key default gen_random_uuid(),
  terrace_id text not null,
  opening_date date not null,
  closing_date date,
  submitter_email text,
  submitter_id text,                          -- anonymous browser UUID, see /open page
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'withdrawn')),
  decided_at timestamptz,
  decided_by text,                            -- Discord username for admin actions, 'submitter' for self-withdrawals, 'backfill' for the migration below
  discord_message_id text,
  undo_token text not null default gen_random_uuid()::text,
  created_at timestamptz not null default now()
);

create index if not exists idx_season_date_subs_terrace
  on public.terrace_season_date_submissions (terrace_id);
create index if not exists idx_season_date_subs_status
  on public.terrace_season_date_submissions (status);
create index if not exists idx_season_date_subs_submitter
  on public.terrace_season_date_submissions (submitter_id);

alter table public.terrace_season_date_submissions enable row level security;
-- No anon policies. All reads/writes go through API routes using the service role.

-- These columns are sensitive: submitter_email is PII, submitter_id and
-- undo_token are auth handles. Block them from anon SELECT in case a future
-- read policy gets added accidentally.
revoke select (submitter_email, submitter_id, undo_token)
  on public.terrace_season_date_submissions
  from anon, authenticated;

-- Backfill: every existing canonical row becomes an approved submission so
-- the submitter's undo token continues to work, and the audit trail picks up
-- a record of every date that was ever live.
insert into public.terrace_season_date_submissions
  (terrace_id, opening_date, closing_date, submitter_email, undo_token,
   status, decided_at, decided_by, created_at)
select
  terrace_id,
  opening_date,
  closing_date,
  submitter_email,
  coalesce(undo_token, gen_random_uuid()::text),
  'approved',
  coalesce(updated_at, now()),
  'backfill',
  coalesce(updated_at, now())
from public.terrace_season_dates;

-- Canonical now only stores live data. Per-submission state moved to the queue.
alter table public.terrace_season_dates
  drop column if exists submitter_email,
  drop column if exists undo_token;
