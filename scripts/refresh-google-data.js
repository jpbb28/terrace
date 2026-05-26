import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// Support GitHub Actions env var or local .env.local
let API_KEY = process.env.GOOGLE_PLACES_API_KEY_UNRESTRICTED;
if (!API_KEY) {
  const envPath = path.join(ROOT, ".env.local");
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf-8");
    API_KEY = envFile
      .split("\n")
      .find((l) => l.startsWith("GOOGLE_PLACES_API_KEY_UNRESTRICTED="))
      ?.split("=")[1]
      ?.trim();
  }
}

if (!API_KEY) {
  console.error("Missing GOOGLE_PLACES_API_KEY");
  process.exit(1);
}

const TERRACES_FILE = path.join(ROOT, "src", "data", "terraces.ts");
const RATINGS_FILE = path.join(ROOT, "scripts", "ratings-results.json");

function loadPlaceIds() {
  const src = fs.readFileSync(TERRACES_FILE, "utf-8");
  const terraces = [];
  const regex = /id:\s*"(\d+)"[\s\S]*?placeId:\s*"([^"]+)"/g;
  let match;
  while ((match = regex.exec(src)) !== null) {
    terraces.push({ id: match[1], placeId: match[2] });
  }
  return terraces;
}

// One Place Details request returns ratings AND hours together. Requesting
// them in a single call bills once at the Enterprise tier, instead of the two
// separate Enterprise calls the old fetch-ratings.js + refresh-hours.js made.
async function fetchPlace(placeId) {
  const res = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}`,
    {
      headers: {
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "rating,userRatingCount,regularOpeningHours",
      },
    },
  );
  const data = await res.json();
  if (data.error) {
    console.error(`  API error: ${data.error.message}`);
    return null;
  }
  return data;
}

function parsePeriods(regularOpeningHours) {
  if (!regularOpeningHours?.periods?.length) return [];
  return regularOpeningHours.periods.map((p) => {
    if (!p.close) {
      return { day: p.open.day, open: "00:00", close: "00:00", is24h: true };
    }
    return {
      day: p.open.day,
      open: `${String(p.open.hour ?? 0).padStart(2, "0")}:${String(p.open.minute ?? 0).padStart(2, "0")}`,
      close: `${String(p.close.hour ?? 0).padStart(2, "0")}:${String(p.close.minute ?? 0).padStart(2, "0")}`,
    };
  });
}

function buildPeriodsStr(periods) {
  if (periods.length === 0) return "[]";
  const items = periods
    .map((p) => {
      const base = `      { day: ${p.day}, open: "${p.open}", close: "${p.close}"`;
      return p.is24h ? base + `, is24h: true }` : base + ` }`;
    })
    .join(",\n");
  return `[\n${items},\n    ]`;
}

// Montreal terrace-hour cap, with owner-hour protection.
//
// A Google close that wraps past midnight (close < open, not exactly midnight)
// is the establishment's INDOOR closing time — never a legal terrace close. For
// any day where Google's hours wrap like that:
//   - if we already store hours for that day, those were curated by a human
//     (a submission / owner) and are strictly more reliable than capped indoor
//     hours, so we keep the stored period verbatim;
//   - otherwise we clamp the close to 23:00 (the 11 PM bylaw backstop).
// Days where Google reports a normal, non-wrapping close are trusted and
// updated as usual, so genuine hour changes still flow through. Mirrors the
// clamp in scripts/cap-terrace-hours.cjs, plus the stored-hours preservation.
function capPeriods(googlePeriods, storedPeriods = []) {
  const toMin = (s) => {
    const [h, m] = s.split(":").map(Number);
    return h * 60 + m;
  };
  const wraps = (p) =>
    !p.is24h && p.close !== "00:00" && toMin(p.close) < toMin(p.open);

  const storedByDay = {};
  for (const p of storedPeriods) {
    if (!storedByDay[p.day]) storedByDay[p.day] = [];
    storedByDay[p.day].push(p);
  }
  const googleByDay = {};
  const dayOrder = [];
  for (const p of googlePeriods) {
    if (!googleByDay[p.day]) {
      googleByDay[p.day] = [];
      dayOrder.push(p.day);
    }
    googleByDay[p.day].push(p);
  }

  const out = [];
  for (const day of dayOrder) {
    const gperiods = googleByDay[day];
    const needsCap = gperiods.some(wraps);
    if (needsCap && storedByDay[day] && storedByDay[day].length) {
      // Google only knows indoor hours for this day — keep curated terrace hours.
      for (const sp of storedByDay[day]) {
        out.push(
          sp.is24h
            ? { day: sp.day, open: sp.open, close: sp.close, is24h: true }
            : { day: sp.day, open: sp.open, close: sp.close },
        );
      }
    } else {
      for (const gp of gperiods) {
        out.push(wraps(gp) ? { ...gp, close: "23:00" } : gp);
      }
    }
  }
  return out;
}

// Order-insensitive canonical form, for detecting whether hours actually
// changed. Compared after capping, so re-capping never counts as a change.
function periodsKey(periods) {
  return periods
    .map((p) => `${p.day}|${p.open}|${p.close}|${p.is24h ? 1 : 0}`)
    .sort()
    .join(",");
}

// The slice of terraces.ts for one terrace (its id line up to the next id
// line), so we read its current hours without bleeding into the next entry.
function terraceSlice(src, id) {
  const start = src.search(new RegExp(`id:\\s*"${id}"`));
  if (start === -1) return "";
  const after = src.slice(start + 1);
  const nextRel = after.search(/id:\s*"\d+"/);
  return nextRel === -1
    ? src.slice(start)
    : src.slice(start, start + 1 + nextRel);
}

// Parse the { day, open, close, is24h } tuples already stored for a terrace.
function existingPeriods(src, id) {
  const slice = terraceSlice(src, id);
  const periodRe =
    /\{\s*day:\s*(\d),\s*open:\s*"(\d{2}:\d{2})",\s*close:\s*"(\d{2}:\d{2})"(\s*,\s*is24h:\s*true)?\s*\}/g;
  const periods = [];
  let m;
  while ((m = periodRe.exec(slice)) !== null) {
    periods.push({ day: Number(m[1]), open: m[2], close: m[3], is24h: !!m[4] });
  }
  return { periods, hasOpeningPeriods: /openingPeriods:/.test(slice) };
}

async function main() {
  const terraces = loadPlaceIds();
  console.log(`Found ${terraces.length} terraces with placeId\n`);

  let src = fs.readFileSync(TERRACES_FILE, "utf-8");
  const ratings = {};
  let hoursUpdated = 0;
  let hoursUnchanged = 0;

  for (const terrace of terraces) {
    console.log(`[${terrace.id}] fetching...`);
    const data = await fetchPlace(terrace.placeId);

    if (!data) {
      ratings[terrace.id] = { rating: null, userRatingCount: null };
      await new Promise((r) => setTimeout(r, 150));
      continue;
    }

    // --- ratings (consumed by apply-ratings.js via ratings-results.json) ---
    ratings[terrace.id] = {
      rating: data.rating ?? null,
      userRatingCount: data.userRatingCount ?? null,
    };

    // --- hours (capped to bylaw, written inline only when actually changed) ---
    const hours = data.regularOpeningHours ?? null;
    if (hours) {
      const { periods: current, hasOpeningPeriods } = existingPeriods(
        src,
        terrace.id,
      );
      const periods = capPeriods(parsePeriods(hours), current);

      if (hasOpeningPeriods && periodsKey(periods) === periodsKey(current)) {
        hoursUnchanged++;
        console.log(
          `  rating ${data.rating ?? "—"} (${data.userRatingCount ?? 0}), hours unchanged`,
        );
      } else {
        const periodsStr = buildPeriodsStr(periods);
        if (hasOpeningPeriods) {
          src = src.replace(
            new RegExp(
              `(id:\\s*"${terrace.id}"[\\s\\S]*?)    openingPeriods:\\s*\\[[\\s\\S]*?\\],?`,
              "m",
            ),
            `$1    openingPeriods: ${periodsStr},`,
          );
        } else {
          src = src.replace(
            new RegExp(
              `(id:\\s*"${terrace.id}"[\\s\\S]*?)(\\n    description:)`,
              "m",
            ),
            `$1\n    openingPeriods: ${periodsStr},$2`,
          );
        }
        hoursUpdated++;
        console.log(
          `  rating ${data.rating ?? "—"} (${data.userRatingCount ?? 0}), hours updated (${periods.length} periods)`,
        );
      }
    } else {
      console.log(
        `  rating ${data.rating ?? "—"} (${data.userRatingCount ?? 0}), no hours`,
      );
    }

    await new Promise((r) => setTimeout(r, 150));
  }

  fs.writeFileSync(TERRACES_FILE, src);
  fs.writeFileSync(RATINGS_FILE, JSON.stringify(ratings, null, 2));
  console.log(
    `\nHours: ${hoursUpdated} updated, ${hoursUnchanged} unchanged. Wrote ratings-results.json (${Object.keys(ratings).length} entries).`,
  );
}

main().catch(console.error);
