-- Lock in RLS policies that exist in production but were created via the
-- Supabase dashboard rather than committed migrations. Verified May 2 2026
-- by probing each table with the public anon key.
--
-- Posture: anon role can ONLY do the operation listed; everything else is
-- blocked by RLS. Service role bypasses RLS entirely (used by API routes).
--
-- Drop-then-create is used so this migration is idempotent against the
-- existing production database (where these policies already exist under
-- the same names) and against a fresh database.

-- submissions: public form inserts; reads/updates/deletes are admin-only
drop policy if exists "anon can insert" on public.submissions;
create policy "anon can insert"
  on public.submissions
  for insert to anon
  with check (true);

-- corrections: same shape as submissions
drop policy if exists "anon can insert" on public.corrections;
create policy "anon can insert"
  on public.corrections
  for insert to anon
  with check (true);

-- terrace_events: analytics events written from the frontend
drop policy if exists "anon can insert" on public.terrace_events;
create policy "anon can insert"
  on public.terrace_events
  for insert to anon
  with check (true);

-- reviews already has "public read" from the initial schema migration.
-- Writes go through POST /api/reviews using the service role.

-- terrace_season_dates already has "public read" from 20260418000000.
-- Writes go through POST /api/season-dates using the service role.
