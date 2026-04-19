-- Add undo_token to terrace_season_dates.
-- Allows the submitting browser to delete its own entry via DELETE /api/season-dates.
-- The API verifies the token matches before deleting.
alter table public.terrace_season_dates
  add column if not exists undo_token text;

-- Prevent anon/authenticated roles from reading the token via direct Supabase queries.
-- The NEXT_PUBLIC_SUPABASE_ANON_KEY is exposed in the client bundle, so without this
-- anyone could SELECT undo_token and use it to delete any entry.
-- Server-side API routes use SUPABASE_SERVICE_KEY which bypasses RLS and can still read it.
revoke select (undo_token) on public.terrace_season_dates from anon, authenticated;
