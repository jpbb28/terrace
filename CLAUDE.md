# Terrace Season

Discover every terrace and patio in Montreal.

## Git / Deployment Rules

- **Never push to git unless explicitly asked.** Each push triggers a Vercel production build.
- **Batch commits** — complete all related changes before committing. Don't commit after each small fix.

**Production URL**: https://terrasseseason.com
**Hosting**: Vercel (migrated from Netlify)

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4, warm/earthy theme
- **Fonts**: Playfair Display (display) + DM Sans (body) via Google Fonts
- **Map**: Leaflet + react-leaflet (sepia-filtered OSM tiles)
- **Data**: Static seed data (170 terraces), no database yet

## File Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout, fonts, metadata
│   ├── page.tsx            # Main page (map + sidebar + mobile tabs)
│   ├── globals.css         # Global styles, CSS variables, Leaflet theme
│   └── submit/
│       └── page.tsx        # "Suggest a terrace" submission form
├── components/
│   ├── Map.tsx             # Leaflet map (client-only, dynamic import)
│   ├── TerraceCard.tsx     # List item card
│   ├── TerraceDetail.tsx   # Detail overlay panel
│   └── FilterBar.tsx       # Search + filters (24 neighborhoods)
├── data/
│   └── terraces.ts         # Seed data (180 Montreal terraces, sourced from 12+ publications)
└── lib/
    ├── types.ts            # TypeScript types (HourPeriod, Terrace, neighborhoods, terrace types)
    └── utils.ts            # isOpenNow(), formatHours() — Montreal timezone aware
```

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm start` — Start production server

## Key Decisions

- **Supabase is live** — Used for reviews. Plan: expand to submissions, PostGIS geo queries in v2.
- **Data sourcing** — Terraces compiled from Time Out, Tastet, Cult MTL, Tourisme Montreal, Narcity, Daily Hive, OpenTable, Montreal Diaries, MTL Blog, The Rooftop Guide, experienceoldmontreal.com, and Eater Montreal. Cross-referenced across multiple lists. Sources from 2024-2025 preferred.
- **Data integrity** — Optional fields (terraceType, capacity, openingHours, seasonalOpen/Close) are only set when confirmed by source articles. Boolean flags (heated, dogFriendly, covered) default to false and are only set true when explicitly confirmed. Missing data is hidden in the UI, never shown as zeros or defaults.
- **Leaflet over Mapbox** — Free, no API key needed, sepia theme via CSS filter.
- **Dynamic import for Map** — Leaflet requires `window`, so SSR is disabled for the Map component.
- **Warm earthy aesthetic** — Background #faf6f1, accent #c45d3e, with Playfair Display + DM Sans fonts.

## Data Conventions

- Each terrace description cites its source publication
- `terraceType` only set when source explicitly describes the terrace type
- `heated`, `dogFriendly`, `covered` only `true` when confirmed by source or establishment
- `capacity` only set when source provides a number
- Neighborhoods: 24 types covering core Montreal areas
- No pop-ups, ephemeral spots, or locations outside Montreal proper
- `openingPeriods` — structured hours from Google Places API (`{day, open, close}[]`); populated via `node scripts/fetch-hours.js` then `node scripts/apply-hours.js`. Re-run seasonally (winter/summer hours differ). `placeId` stored per terrace to enable cheap future refreshes.
- `openingHours` — legacy display string, kept for terraces not yet in Places data

### Automated refresh (`.github/workflows/refresh-google-data.yml`)

- Runs biweekly (cron `0 6 1,15 * *` — 1st & 15th, 6am UTC) plus manual `workflow_dispatch`. Calls `node scripts/refresh-google-data.js` then `node scripts/apply-ratings.js`, commits with `[skip ci]`.
- `scripts/refresh-google-data.js` makes **one** Place Details call per terrace (`rating,userRatingCount,regularOpeningHours`), writing hours inline into `terraces.ts` and ratings to `scripts/ratings-results.json`. It replaced the old `fetch-ratings.js` + `refresh-hours.js`, which made two billable Enterprise calls per terrace — the main Places API cost driver. Keep it to one call per terrace.
- Hours are capped to bylaw inline (same rule as `scripts/cap-terrace-hours.cjs`) before being written, and a terrace's `openingPeriods` is only rewritten when the capped result differs from what's stored — so unchanged terraces produce no diff. The API call still happens for every terrace (needed to detect changes); change-detection only avoids file churn, it doesn't reduce cost.
- **Owner-hour protection**: for any day where Google's hours wrap past midnight (i.e. Google is reporting _indoor_ hours, which it always does — terrace hours aren't in Places data), if we already store hours for that day the refresh keeps the **stored** period verbatim instead of clamping to 23:00. Rationale: a stored close like `23:30` or `00:00` can only have come from a human submission (the cap itself only ever produces `23:00`), so it's strictly more reliable than capped indoor hours. Days where Google reports a normal non-wrapping close are still trusted and updated, so genuine hour changes flow through. This makes owner-confirmed late closes (e.g. BENELUX Fri/Sat `23:30`) stable across refreshes.

### Terrace hours vs indoor hours (Montreal bylaw)

Stored hours are **terrace** hours, NOT the establishment's indoor hours. Montreal regulates terrace hours, but there is **no single citywide closing time** — the rules are set per **borough (arrondissement)** and apply to _all_ commercial terraces, whether on public property (sidewalks/roads, governed by the public-domain occupation rules) or private property (courtyards/backyards, governed by Urban Planning By-law 01-274). The common patterns:

- **Most boroughs**: a flat **7 AM–11 PM** every day, for both public and private terraces.
- **Some boroughs** (e.g. CDN–NDG, Rosemont) allow **midnight Thu–Sat**; Le Sud-Ouest allows midnight Fri–Sat.
- **A few are stricter** (Outremont 10 PM, Verdun 9 PM in most areas).

We don't model per-borough rules. Instead we apply a single conservative backstop: **11 PM (`23:00`)** — accurate for the majority of boroughs, and at most ~1h early for the few that permit midnight. This only ever clamps obviously-illegal post-midnight closes (indoor hours leaking in); it is not a faithful encoding of every borough's rule.

**Rules when populating `openingPeriods`:**

1. If a user submission specifies an earlier close time than Google Places, **trust the submission** — the operator knows their own terrace hours. Google reports indoor/establishment hours.
2. Any close time that wraps past midnight (close earlier than open, and not exactly `00:00`) must be capped to `"23:00"`. The bulk fix is `node scripts/cap-terrace-hours.cjs` (idempotent — re-run any time); `verify-submissions.cjs` and `refresh-google-data.js` apply the same rule inline.
3. Don't write descriptions that mention specific late closing times like "until 3 AM" — those refer to indoor hours and contradict our terrace data.

The hours UI (TerraceDetail expanded panel and the `/terraces/[slug]` SEO page) shows the note: _"Terrace hours per Montreal city bylaws. Indoor hours may differ."_

## Adding New Listings — Workflow

When the user pastes pending submissions (JSON from the `submissions` table) for verification + add, follow this workflow. **JSON is the preferred input format** (CSV/SQL require escaping for multi-line French descriptions; JSON is most token-efficient).

**Pin coordinates: always source from Google Places API by `placeId`, never geocode from the address string.** Hand-typed or geocoded coords cause the pin-misplacement bug fixed in 8af4e15.

### Pipeline

1. Save the pasted JSON to `scripts/submissions-input.json`.
2. Run `node scripts/verify-submissions.cjs` — for each submission, calls `places:searchText` and writes `scripts/submissions-verified.json` with submitter data, Google data, and a `recommended_opening_periods` field that has already been capped to terrace-bylaw hours and merged with any earlier submitter close times. Flags include `street_number_mismatch`, `no_match`, `hours_capped`, `submitter_earlier_day_N`.
3. Review `submissions-verified.json`. Investigate any flags before proceeding (manually correct the `name`/`address` or skip the entry).
4. Append entries to `src/data/terraces.ts`. Use the next sequential `id` (currently up through 207). For each entry:
   - **Always from Google**: `placeId`, `lat`, `lng`, `googleRating`, `googleReviewCount`
   - **`openingPeriods`**: copy from `recommended_opening_periods` in the verified JSON (already merged + capped). Don't write descriptions that name specific late close times like "until 3 AM" — those refer to indoor hours.
   - **Always from submitter**: `terraceType`, `capacity`, `covered`, `dogFriendly`, `heated`, `instagram`, raw `description`
   - **Prefer submitter, fall back to Google**: `name`, `address` (use submitter's intent unless Google's canonical version is clearly more correct), `website` (skip if Google only has a Facebook/Instagram URL)
   - **Translate**: produce both `description` (EN) and `descriptionFr`. Cite source as `"Sources: User submission."`
   - **Photos**: download **every** photo from the submission (the site has an image carousel — single-photo entries look bare). Save the first as `public/photos/{id}/main.{ext}` and the rest as `2.{ext}`, `3.{ext}`, etc. Run `node scripts/convert-to-webp.js` (handles JPG; PNG/WebP can be kept as-is). Populate `photos: ["/photos/{id}/main.webp", "/photos/{id}/2.webp", ...]` with the full list.
5. Run `npx tsc --noEmit -p tsconfig.json` to confirm types.
6. Run `node scripts/approve-submissions.cjs` — flips the `status` of every UUID in `submissions-input.json` from `pending` to `approved`.
7. Leave the input/verified JSON files untracked (they're scratch). Don't commit them.

### Helper scripts

- `scripts/verify-submissions.cjs` — runs Google Places lookup + diff against submitter data
- `scripts/approve-submissions.cjs` — marks the batch as approved in Supabase
- `scripts/fetch-coords.js` — re-fetches `lat`/`lng` for every terrace by `placeId` (audit pass). Run periodically to catch any drift.
- `scripts/verify-placeids.js` — sanity-checks that each stored `placeId` still resolves to the same business name/address

## ⚠️ SECURITY

### Google API Key

- The key lives ONLY in `.env.local` — this file is gitignored, never commit it
- Used only for `scripts/fetch-hours.js` — hours data fetching via Google Places API
- Restrict the key in Google Cloud Console to: Places API (New) only
- Set `GOOGLE_PLACES_API_KEY` as an environment variable in Netlify

### Discord Bot

- `DISCORD_BOT_TOKEN`, `DISCORD_PUBLIC_KEY`, `DISCORD_APPROVAL_CHANNEL_ID` live ONLY in `.env.local` + Vercel — never commit
- The Public Key is used to verify Ed25519 signatures on incoming Discord interactions; without it, the interactions endpoint rejects all requests as unauthenticated
- The bot token grants full message-posting rights on the channel. Reset it in the Developer Portal if exposed

## Photos

- All terrace photos are in `public/photos/{id}/` as WebP files, committed to git and served via Netlify CDN
- No external photo service (Supabase Storage removed)
- Street View removed — not used

## Supabase Schema

Project URL: `https://mnrpyixjrjoqiecfsibg.supabase.co`
Full schema in memory file `supabase_schema.md`. Tables:

- **`reviews`** — terrace-specific ratings (1–5) + text. Token-only dedup (localStorage UUID). API: `POST /api/reviews`, `GET /api/reviews/[terraceId]`
- **`submissions`** — new terrace suggestions from the submit form
- **`corrections`** — edit suggestions for existing terraces (includes `changes` jsonb diff and `terrace_id`)
- **`terrace_events`** — analytics events (views, clicks) with `event_type`, `session_id`, `device_type`
- **`terrace_season_dates`** — canonical "what the public sees". One row per terrace, `terrace_id` PK. Only ever written by the approval action, never directly by submissions.
- **`terrace_season_date_submissions`** — append-only moderation queue. UUID PK, `terrace_id` indexed (not unique). One row per submission with `status` (`pending`/`approved`/`rejected`/`withdrawn`), `submitter_email`, `submitter_id` (anonymous browser UUID), `decided_at`, `decided_by`, `discord_message_id`, `undo_token`.
- **`shared_lists`** — anonymous shareable favourite lists. `slug` text PK (short random base62), `terrace_ids` jsonb (immutable snapshot of saved ids), optional `title`, `created_at`. Written by `POST /api/lists`, read by the `/list/[slug]` server page. Service-role only (no anon grants) — see Favorites & Shareable Lists below.

**Denormalized `terrace_name`**: every terrace_id-keyed table (`reviews`, `terrace_events`, `terrace_season_dates`, `terrace_season_date_submissions`, plus the existing `corrections.terrace_name`) carries a copy of the terrace's display name so rows can be scanned in the Supabase dashboard without cross-referencing `src/data/terraces.ts`. Each insert site looks the name up inline via `terraces.find((t) => t.id === id)?.name ?? id`. If a name is renamed in `terraces.ts`, run `node scripts/backfill-terrace-names.cjs` to update existing rows.

**Data API grants (new tables)**: as of Oct 30 2026 Supabase no longer auto-grants anon/authenticated access on `public` tables. Every new table that should be reachable via supabase-js / PostgREST needs an explicit `GRANT ... TO anon, authenticated, service_role` in the same migration that creates it. Pattern lives in `supabase/migrations/20260515000000_explicit_data_api_grants.sql`. If a route returns PostgREST error code `42501`, a grant is missing. `shared_lists` (migration `20260525000000_shared_lists.sql`) is the locked-down variant: RLS enabled, **no** anon/authenticated grants, `grant all ... to service_role` only — both create and read go through server code using `SUPABASE_SERVICE_KEY` (`src/lib/supabaseAdmin.ts`).

## Opening date approval flow

Submissions from the `/open` page no longer go live immediately. Pipeline:

1. Visitor submits an opening date → `POST /api/season-dates` inserts a fresh row in `terrace_season_date_submissions` with `status='pending'`. The canonical `terrace_season_dates` table is untouched.
2. The endpoint queries existing canonical + other pending submissions for the same terrace, then posts an approval message to the admin Discord channel via the **Bot API** with green Approve / red Reject buttons. The message includes any conflicts (currently-live differs / other pending exists / same submitter vs different) so the admin can decide at a glance. The Resend email also goes out for paper-trail backup.
3. Admin clicks a button → Discord POSTs to `/api/discord/interactions`. The route verifies the Ed25519 signature, looks up the submission by UUID from the `custom_id`, updates `status`/`decided_at`/`decided_by`, and on **approve** also upserts the canonical row from the submission's data. The original Discord message is edited to remove buttons + show "Approved/Rejected by {user}".
4. `GET /api/open-reports` reads the canonical table directly. No filtering needed; pending/rejected/withdrawn rows live in the queue and never touch canonical.

**Submitter identity**: every browser persists a UUID at `localStorage.terrace_submitter_id` and sends it with each submission. Lets the Discord message tag conflicts as "same submitter resubmitting" vs "different person disagrees" without requiring login or email.

**Submitter undo** (`DELETE /api/season-dates?token=…`) marks the queue row as `withdrawn` (audit-preserving). If the withdrawn submission was the source of the live canonical row, the API recomputes canonical from the next-most-recent approved submission for that terrace, or removes canonical entirely if there isn't one.

**Stale Discord buttons**: each Discord message references a specific submission UUID, so resubmissions always create a new row with new buttons. Old buttons either still work (against the original submission) or fall through to "already decided" — they never accidentally affect a different row.

### Discord setup (one-time)

Done at https://discord.com/developers/applications:

1. Create a new Application (separate from any other bots).
2. Bot tab → reset token → save as `DISCORD_BOT_TOKEN`.
3. General Information → copy Public Key as `DISCORD_PUBLIC_KEY`.
4. General Information → set **Interactions Endpoint URL** = `https://terrasseseason.com/api/discord/interactions`. Discord pings the URL once on save; our route responds to type-1 PINGs. Save will fail if the route is not yet deployed.
5. OAuth2 → URL Generator → scopes `bot`, permissions `Send Messages` + `View Channel`. Use the generated URL to invite the bot to the admin server.
6. Right-click the approval channel → Copy Channel ID → save as `DISCORD_APPROVAL_CHANNEL_ID`.

All four env vars (`DISCORD_BOT_TOKEN`, `DISCORD_PUBLIC_KEY`, `DISCORD_APPROVAL_CHANNEL_ID`, plus the existing `DISCORD_WEBHOOK_URL` which still drives generic notifications) need to be set in `.env.local` and in Vercel.

## Favorites & Shareable Lists

No-account feature for saving terraces and sharing a curated list.

- **Personal favourites** live in `localStorage.terrace_favorites` (a JSON array of terrace ids). No Supabase persistence and no auth — the per-browser `terrace_submitter_id` UUID is also localStorage-bound, so server sync would buy nothing without real accounts. State is exposed via `FavoritesProvider` / `useFavorites()` (`src/lib/favorites.tsx`), wrapped in `layout.tsx` next to `LanguageProvider`. The provider has a `hydrated` flag to avoid SSR flicker and syncs across tabs via the `storage` event.
- **Heart toggle**: `src/components/FavoriteButton.tsx` (`overlay` variant for photo corners, bordered variant for the detail header). Added to `TerraceCard` (both compact + full — the card root is a `<button>`, so the heart is rendered as an absolutely-positioned **sibling** wrapped in a `relative` div, never nested inside the card button) and to the `TerraceDetail` header.
- **"My list" tray**: `src/components/FavoritesTray.tsx` — a floating pill (bottom-left to avoid the map's bottom-right locate control) with a count badge, opening a slide-up sheet (mobile) / floating panel (desktop). Lists saved terraces, remove + clear, and the share flow. Mounted in `page.tsx` only, hidden when a terrace detail is open (`hidden={!!selectedId}`) since the detail has its own heart.
- **Sharing**: tray → optional title → `POST /api/lists` (`src/app/api/lists/route.ts`, service role) validates ids against `terraces` (drops unknowns, caps at 50), generates a 7-char base62 slug, retries on PK collision, returns `{ slug }`. Client builds `/list/{slug}`, fires `navigator.share` on mobile + copy-to-clipboard. Lists are **immutable snapshots**; re-sharing makes a new slug.
- **Receiver view**: `/list/[slug]` (`src/app/list/[slug]/page.tsx`, server component, `noindex`) fetches the row via `supabaseAdmin`, resolves ids against static `terraces`, and renders `src/components/SharedListView.tsx` (client) — banner + "Save all to my list" (`addMany`, union/merge) + mini Leaflet map + compact card grid. Empty/missing slug renders a friendly not-found state.
- i18n strings under the `// Favorites & shared lists` comment in `src/lib/i18n.ts`.

## Planned V2 Features

- Supabase backend with PostGIS for geo queries
- Working submission form (currently logs to console)
- Crowdsourced availability reporting
- ~~User accounts + favorites~~ — favourites shipped (localStorage); accounts deferred (no demand yet, see Favorites & Shareable Lists)
- "Notify me when terrace opens for season"
- Proper geocoding for lat/lng coordinates
