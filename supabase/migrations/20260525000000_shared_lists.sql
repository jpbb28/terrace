-- shared_lists: anonymous, shareable curated terrace lists.
--
-- A visitor saves terraces to localStorage (no account). When they tap "Share",
-- POST /api/lists snapshots the current terrace IDs into one row keyed by a
-- short random slug. The receiver page /list/[slug] reads that row server-side
-- and renders a read-only view. Lists are immutable snapshots: editing your own
-- favourites afterwards does not change an already-shared link, and re-sharing
-- creates a fresh slug.
--
-- Access posture: service_role only.
--   - create: POST /api/lists (server route, service key)
--   - read:   /list/[slug] server component (service key)
-- Neither path touches the browser's anon client, so anon/authenticated need no
-- direct grants. RLS is enabled with no policies (default deny), matching the
-- locked-down posture of terrace_season_date_submissions.

create table if not exists public.shared_lists (
  slug         text primary key,
  terrace_ids  jsonb not null,
  title        text,
  created_at   timestamptz not null default now()
);

alter table public.shared_lists enable row level security;

-- No blanket grants under the new Supabase Data API model (see
-- 20260515000000_explicit_data_api_grants.sql). Service role only.
revoke all on public.shared_lists from anon, authenticated;
grant all on public.shared_lists to service_role;
