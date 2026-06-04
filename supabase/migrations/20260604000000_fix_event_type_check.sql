-- terrace_events.event_type carried a CHECK constraint
-- (terrace_events_event_type_check) that was created via the Supabase dashboard
-- and never committed. It only allowed an outdated subset of event types
-- (view, website_click, directions, instagram). Event types added later or
-- omitted — card_click, map_marker_click, share, phone_click — were rejected
-- with HTTP 400 (error 23514). Since the frontend inserts are fire-and-forget
-- and fetch does not reject on a 400, those events were silently dropped for
-- months (they never appeared in the table at all).
--
-- We drop the value constraint entirely rather than re-listing the allowed
-- values: analytics ingestion should be permissive, the canonical list of event
-- types lives in the EventType union in src/lib/analytics.ts, and a DB check
-- that silently rejects new values is a footgun that already cost real data.
-- trackEvent now logs non-2xx responses, so any genuinely bad insert is visible
-- instead of silent.

alter table public.terrace_events
  drop constraint if exists terrace_events_event_type_check;
