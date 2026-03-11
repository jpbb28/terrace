# Terrace Season

Discover every terrace and patio in Montreal.

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
│   └── terraces.ts         # Seed data (179 Montreal terraces, sourced from 12+ publications)
└── lib/
    ├── types.ts            # TypeScript types (HourPeriod, Terrace, neighborhoods, terrace types)
    └── utils.ts            # isOpenNow(), formatHours() — Montreal timezone aware
```

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm start` — Start production server

## Key Decisions
- **No database yet** — Using static data to validate the concept. Plan: Supabase (PostGIS) for v2.
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

## ⚠️ SECURITY — READ BEFORE WORKING ON PHOTOS OR DEPLOYMENT

### Google API Key
- The key lives ONLY in `.env.local` — this file is gitignored, never commit it
- **`terraces.ts` must never contain the raw API key** — Street View entries are stored as `/api/streetview/{id}` paths, served via a Next.js API route that reads `GOOGLE_PLACES_API_KEY` server-side
- `scripts/review.html` temporarily embeds the key in Street View `<img>` src URLs for local review only — **delete `review.html` and `photo-results.json` when the review is complete**, or at minimum never share/deploy them
- Run `node scripts/apply-photos.js` to apply selections — it stores safe paths, not raw URLs

### TODO before going live
1. **Build `/api/streetview/[id]` route** — proxies Street View requests server-side so the key is never exposed to the browser
2. **Add your production domain to the Google API key whitelist** in Google Cloud Console → APIs & Services → Credentials → restrict the key to your domain (e.g. `terrace.yourdomain.com`)
3. **Also restrict the key by API** — only enable: Places API (New) + Street View Static API
4. Set `GOOGLE_PLACES_API_KEY` as an environment variable in your hosting platform (Netlify/Vercel)

## Planned V2 Features
- Supabase backend with PostGIS for geo queries
- Working submission form (currently logs to console)
- Crowdsourced availability reporting
- User accounts + favorites
- "Notify me when terrace opens for season"
- Proper geocoding for lat/lng coordinates
