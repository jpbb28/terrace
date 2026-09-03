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
- **Fonts**: Playfair Display (display headings) + DM Sans (app UI body) + Lora (long-form reading) via Google Fonts. Apply the `.font-reading` class (globals.css → Lora serif) to prose bodies: About/FAQ/Terms, terrace descriptions on SEO pages, and the `TerraceDetail` panel. App UI (filters, cards, map, nav) stays DM Sans; headings stay Playfair. The small list `TerraceCard` snippets intentionally stay DM Sans.
- **Icons**: `lucide-react` for filter/UI icons (PawPrint/Umbrella/Flame/Clock on the attribute filters). Brand icons (Instagram) were removed from lucide — hand-roll inline SVG for those (see `ContactBlock.tsx`).
- **Map**: Leaflet + react-leaflet (sepia-filtered OSM tiles)
- **Data**: Static seed data (217 terraces), no database yet

## Press / Media Credits

Featured in MTL Blog (May 2026, `mtlblog.com/montreal-restaurants-terrasses-map`). Logo at `public/mtlbloglogo.png`. The credit lives in three spots: (1) a desktop-only "As seen in {logo}" link left of the Submit button in both nav bars (`SiteNav.tsx` + homepage header in `page.tsx`); (2) a press card quoting the article headline on the About page (`AboutContent.tsx`, EN + FR, headline kept in English); (3) a small link in the homepage bottom-of-list footer. `ContactBlock.tsx` is the shared email + Instagram block (bottom of About; rendered as a closing Q&A on FAQ).

## File Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout, fonts, metadata (html lang="en")
│   ├── page.tsx            # Homepage route (thin server wrapper: <HomeJsonLd/> + <Home/>)
│   ├── HomeJsonLd.tsx      # Homepage-only directory @graph JSON-LD (server component)
│   ├── globals.css         # Global styles, CSS variables, Leaflet theme
│   ├── sitemap.ts          # XML sitemap (EN + FR terrace URLs w/ hreflang)
│   ├── terraces/[slug]/    # English terrace SEO page (page.tsx, thin)
│   ├── fr/terraces/[slug]/ # French terrace SEO page (page.tsx, thin)
│   └── submit/
│       └── page.tsx        # "Suggest a terrace" submission form
├── components/
│   ├── HomeClient.tsx      # Main interactive home app (map + sidebar + mobile tabs); rendered by / and /fr
│   ├── Map.tsx             # Leaflet map (client-only, dynamic import)
│   ├── TerraceCard.tsx     # List item card
│   ├── TerraceDetail.tsx   # Detail overlay panel
│   ├── TerracePageView.tsx # Shared bilingual terrace-page body + SEO builders
│   ├── SiteNav.tsx         # Top nav + language toggle (link on slug pages)
│   └── FilterBar.tsx       # Search + filters (24 neighborhoods)
├── data/
│   └── terraces.ts         # Seed data (217 Montreal terraces, sourced from 12+ publications)
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

## Bilingual SEO (URL-based i18n)

**Language follows the URL.** English lives at the root, French under `/fr` (chosen default: English is x-default, matching where the terrace pages started). Every indexable page has a crawlable EN + FR URL:

| EN                         | FR                                  | Renderer                                                                          |
| -------------------------- | ----------------------------------- | --------------------------------------------------------------------------------- |
| `/`                        | `/fr`                               | `app/page.tsx` (client `Home`); `/fr/page.tsx` re-renders it with French metadata |
| `/terraces/[slug]`         | `/fr/terraces/[slug]`               | `components/TerracePageView.tsx` (+ `buildTerraceMetadata`/`buildTerraceJsonLd`)  |
| `/blog`, `/blog/[slug]`    | `/fr/blog`, `/fr/blog/[slug]`       | `BlogIndexContent` / `BlogPostContent` + `lib/blogSeo.ts` builders                |
| `/about`, `/faq`, `/terms` | `/fr/about`, `/fr/faq`, `/fr/terms` | shared `*Content` client components                                               |

**How the language is fixed per route:** `LanguageProvider` takes `initialLang` (default `"en"`) and no longer reads `localStorage` — language is purely route-derived. `src/app/fr/layout.tsx` wraps all `/fr/*` routes in a nested `<LanguageProvider initialLang="fr">`, so every child (including shared client content components) server-renders French. The root tree renders English. This fixed a latent bug where the provider defaulted to `"fr"` and served French HTML to crawlers on English URLs.

**Functional pages** `/submit` and `/open` stay single-URL (not `/fr`-routed) — they're forms, not SEO targets. They render English by default with an in-page toggle. Internal links to them are never `/fr`-prefixed.

**Conventions / gotchas:**

- **hreflang** via `alternates.languages` (`en-CA`, `fr-CA`, `x-default` → EN) on every page's metadata; each canonicals to itself. The homepage's hreflang lives in the root layout metadata. Next renders the tag as `hrefLang` (camelCase) — valid, HTML attrs are case-insensitive.
- **`<html lang>` stays `en`** (single root layout; reading `headers()` there would deopt static generation site-wide). FR pages scope language with a wrapper `<div lang="fr-CA">` where it matters (terrace pages). Google uses hreflang, not the `lang` attribute, for language targeting.
- **Locale-aware internal links**: on French pages, SEO links are prefixed with `/fr` (homepage uses a `localizePath` helper; `BlogIndexContent`/`FaqContent` use a local `lp()`; `SiteNav` takes `pageLang` + `altHref` so the language button is a `<Link>` to the other-language URL).
- **FAQ data lives in `src/data/faqs.ts`** (plain module, not `"use client"`) so both the client `FaqContent` and the server FAQ pages can import the real arrays for `FAQPage` JSON-LD. Importing data out of a `"use client"` module into a server component yields client-reference proxies, not values (this broke the build once).
- **Structured data placement** — the directory-wide `@graph` (Organization / WebSite / CollectionPage / the `ItemList` of every terrace, each `FoodEstablishment` carrying its own `aggregateRating`) lives in `src/app/HomeJsonLd.tsx` and renders **only on the homepage** (`/` and `/fr`, via the thin server `page.tsx` wrappers). **Do NOT move it back into the root layout.** It used to be in `layout.tsx`, so it injected on every page including `/terraces/[slug]` — where each terrace already emits its own `FoodEstablishment` + `aggregateRating`. Google then saw two aggregate ratings for the same business and flagged "Review has multiple aggregate ratings" in Search Console. Terrace pages must carry exactly one rated `FoodEstablishment` (from `TerracePageView.tsx`).
- **Sitemap** (`sitemap.ts`) emits EN+FR for every page via a `pair()` helper, each with `xhtml:link` alternates.
- **Translations** reuse `src/lib/i18n.ts` (`translations`, `cuisineTypeFR`, `neighborhoodFR`). `formatHours(periods, lang)` localizes day names; time-of-day stays AM/PM to match the app.
- **Neighborhoods** display in French via `neighborhoodFR` (Downtown→Centre-ville, etc.). Display only — `Neighborhood` data values stay English (filter keys + `?neighborhood=` URLs). No-standard-form or anglo-preferred names (West Island, NDG) fall back to English.

## Data Conventions

- Each terrace description cites its source publication
- `terraceType` only set when source explicitly describes the terrace type
- `heated`, `dogFriendly`, `covered` only `true` when confirmed by source or establishment
- `capacity` only set when source provides a number
- Neighborhoods: 24 types covering core Montreal areas
- No pop-ups, ephemeral spots, or locations outside Montreal proper
- **One entry per venue — `placeId` is the identity key.** Two ids sharing a `placeId` put two pins on the map and two cards in the list, and if the names slugify alike (`La Catrina` / `Restaurant La Catrina`) only the lower id is reachable at `/terraces/[slug]`, so the newer entry's data is dead weight. Three such pairs (23/208, 56/218, 129/216) were merged in Sept 2026. When merging, keep the **lower** id and repoint any `terrace_events` rows from the discarded id, or its traffic silently drops out of the engagement numbers.
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
3. Review `submissions-verified.json`. Investigate any flags before proceeding (manually correct the `name`/`address` or skip the entry). Two checks the scripts don't do:
   - **Dedupe first.** `verify-submissions.cjs` now flags this automatically (`duplicate_of_existing_id_N`, `duplicate_within_batch_of_idx_N`, `slug_collision_with_id_N`) and prints a `DUPLICATE WARNING(S)` block — **never append an entry that carries one of those flags.** A newly-opened spot often draws several submissions in a day (spelling and address vary: "OMBRÉ BAR" / "Ombre Bar", "2020 Rue Drummond" / "2020 Drummon"), and venues already in the file get resubmitted. Resolve into **one** entry — keep the **lower** id (reviews, analytics and any shared links point at it), take the union of the fields, and where submitters conflict on hours prefer the set that matches Google.
   - **Check the photos actually show the venue.** Download every submitted/corrected photo and look at it. `md5sum` across a batch catches the same file being uploaded to two different listings — that's how the Sept 2026 Casa Del Popolo "correction" was caught (it carried an Ombre Bar photo and blanked a live website).
4. Append entries to `src/data/terraces.ts`. Use the next sequential `id` (currently up through 227 — IDs have gaps and some out-of-order high values, so use max+1, i.e. 228). For each entry:
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

- `scripts/fetch-pending-submissions.cjs` — pulls every `status='pending'` row from `submissions` into `submissions-input.json`. Use this rather than pasting the notification emails: they omit the row UUIDs (needed to approve) and the uploaded photo URLs.
- `scripts/verify-submissions.cjs` — runs Google Places lookup + diff against submitter data, and guards against duplicates by matching the resolved `placeId` (and the slugified name) against everything already in `terraces.ts` plus the rest of the batch
- `scripts/approve-submissions.cjs` — marks the batch as approved in Supabase
- `scripts/fetch-corrections.cjs` — dumps the whole `corrections` table as JSON (there is no pending-only filter; check the `status` field)
- `scripts/set-correction-status.cjs <uuid> <applied|rejected>` — closes out a correction after you've applied or rejected it by hand
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

## Analytics event tracking (`terrace_events`)

Frontend usage events are written by `trackEvent(terraceId, eventType)` in `src/lib/analytics.ts`. The canonical list of event types is the `EventType` union at the top of that file: `view`, `website_click`, `directions`, `phone_click`, `instagram`, `share`, `card_click`, `map_marker_click`.

- **Insert mechanism**: `trackEvent` POSTs directly to the PostgREST endpoint (`/rest/v1/terrace_events`) with `fetch(..., { keepalive: true })`, **not** the supabase-js client. `keepalive` is required so the request survives the page being backgrounded — e.g. when `navigator.share()` opens the OS share sheet or a `tel:` link / same-tab navigation fires. A plain non-keepalive insert is cancelled mid-flight in those cases (this silently dropped `share`/`phone_click` events). The function checks `res.ok` and `console.error`s on any non-2xx — `fetch` does **not** reject on a 400, so without this an insert failure is completely invisible.
- **`view` is tracked once in `page.tsx`'s `openTerrace`, NOT in `TerraceDetail`'s mount effect.** `TerraceDetail` renders in two layout slots (desktop panel + mobile view) and CSS only hides one — both stay mounted, so an effect there fires twice and double-counts. Other events (clicks) come from the single visible element and are fine.

### ⚠️ Adding a new analytics event type — DB step required

`terrace_events` previously had a dashboard-created `CHECK` constraint (`terrace_events_event_type_check`) that whitelisted only a subset of event types and rejected the rest with HTTP 400. Because inserts are fire-and-forget and `fetch` ignores 400s, four event types (`card_click`, `map_marker_click`, `share`, `phone_click`) were silently dropped for **months**. Fixed by `supabase/migrations/20260604000000_fix_event_type_check.sql`, which **drops the constraint** — analytics ingestion is now permissive and the `EventType` union is the only source of truth.

So today, adding an event type is just: add it to the `EventType` union and call `trackEvent`. **No DB change is needed** as long as the constraint stays dropped. **If anyone ever re-adds a value `CHECK` on `event_type`, it must list every type in the union, and the same value must be added to the constraint in production whenever the union grows** — otherwise events silently 400. Prefer leaving it unconstrained. Note migrations here are **not auto-applied**; production is dashboard-managed, so schema changes must also be run by hand in the Supabase SQL editor (the migration file is the committed record).

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
