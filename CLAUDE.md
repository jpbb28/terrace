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

## ⚠️ SECURITY

### Google API Key

- The key lives ONLY in `.env.local` — this file is gitignored, never commit it
- Used only for `scripts/fetch-hours.js` — hours data fetching via Google Places API
- Restrict the key in Google Cloud Console to: Places API (New) only
- Set `GOOGLE_PLACES_API_KEY` as an environment variable in Netlify

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

## Planned V2 Features

- Supabase backend with PostGIS for geo queries
- Working submission form (currently logs to console)
- Crowdsourced availability reporting
- User accounts + favorites
- "Notify me when terrace opens for season"
- Proper geocoding for lat/lng coordinates
