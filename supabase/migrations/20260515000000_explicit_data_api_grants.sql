-- Explicit table grants for the Supabase Data API.
--
-- Background:
--   Supabase historically granted full table access to anon + authenticated on
--   the public schema by default, leaving RLS as the only gate. Starting
--   May 30 2026 (new projects) and Oct 30 2026 (existing projects), that
--   blanket default is being removed: any table that is supposed to be
--   reachable via PostgREST / supabase-js needs an explicit GRANT. Existing
--   tables keep their current effective grants, but we declare them here so
--   the access posture lives in code and future tables have a template.
--
-- Posture per table:
--   reviews                              anon SELECT + INSERT (service_role ALL)
--   submissions                          anon INSERT          (service_role ALL)
--   corrections                          anon INSERT          (service_role ALL)
--   terrace_events                       anon INSERT          (service_role ALL)
--   terrace_season_dates                 anon SELECT          (service_role ALL)
--   terrace_season_date_submissions      no anon access       (service_role ALL)
--
-- The authenticated role mirrors anon: this app does not use Supabase Auth, so
-- any future authenticated traffic should behave like today's anonymous
-- traffic. Service role bypasses RLS but still needs the GRANT under the new
-- model. RLS policies (locked in by 20260502000000) remain the real gate.

-- Wipe any legacy blanket grants so the explicit set below is the only source of truth.
revoke all on public.reviews from anon, authenticated;
revoke all on public.submissions from anon, authenticated;
revoke all on public.corrections from anon, authenticated;
revoke all on public.terrace_events from anon, authenticated;
revoke all on public.terrace_season_dates from anon, authenticated;
revoke all on public.terrace_season_date_submissions from anon, authenticated;

-- reviews: public can read; inserts allowed for anon (RLS-gated via API routes
-- that use service_role today, but keep INSERT in case the client ever writes directly).
grant select, insert on public.reviews to anon, authenticated;
grant all on public.reviews to service_role;

-- submissions: anon form posts only. Reads stay admin-only via the dashboard.
grant insert on public.submissions to anon, authenticated;
grant all on public.submissions to service_role;

-- corrections: same shape as submissions.
grant insert on public.corrections to anon, authenticated;
grant all on public.corrections to service_role;

-- terrace_events: analytics events written from the browser.
grant insert on public.terrace_events to anon, authenticated;
grant all on public.terrace_events to service_role;

-- terrace_season_dates: canonical public-facing season dates.
grant select on public.terrace_season_dates to anon, authenticated;
grant all on public.terrace_season_dates to service_role;

-- terrace_season_date_submissions: queue holds PII (submitter_email, submitter_id,
-- undo_token). All access goes through API routes using the service role.
grant all on public.terrace_season_date_submissions to service_role;

-- Note for future migrations: tables that use bigserial / identity / sequence-
-- backed defaults also need `grant usage on sequence <name> to <role>` for any
-- role that can INSERT. All current tables use uuid PKs with gen_random_uuid()
-- defaults, so no sequence grants are needed here.
