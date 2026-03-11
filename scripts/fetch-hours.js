import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// Load API key from .env.local
const envFile = fs.readFileSync(path.join(ROOT, ".env.local"), "utf-8");
const API_KEY = envFile
  .split("\n")
  .find((l) => l.startsWith("GOOGLE_PLACES_API_KEY="))
  ?.split("=")[1]
  ?.trim();

if (!API_KEY) {
  console.error("Missing GOOGLE_PLACES_API_KEY in .env.local");
  process.exit(1);
}

const RESULTS_FILE = path.join(ROOT, "scripts", "hours-results.json");

function loadTerraces() {
  const src = fs.readFileSync(
    path.join(ROOT, "src", "data", "terraces.ts"),
    "utf-8"
  );
  const terraces = [];
  const regex =
    /{\s*id:\s*"(\d+)",\s*name:\s*"([^"]+)",\s*address:\s*"([^"]+)"/g;
  let match;
  while ((match = regex.exec(src)) !== null) {
    terraces.push({ id: match[1], name: match[2], address: match[3] });
  }
  return terraces;
}

async function searchPlace(name, address) {
  const res = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.regularOpeningHours",
      },
      body: JSON.stringify({
        textQuery: `${name} ${address} Montreal`,
        maxResultCount: 1,
      }),
    }
  );
  const data = await res.json();
  if (data.error) {
    console.error(`  API error: ${data.error.message}`);
    return null;
  }
  return data.places?.[0] || null;
}

function parsePeriods(regularOpeningHours) {
  if (!regularOpeningHours?.periods?.length) return [];

  return regularOpeningHours.periods.map((p) => {
    // 24/7: Google returns a single period with open {day:0, hour:0, minute:0} and no close
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

async function main() {
  const terraces = loadTerraces();
  console.log(`Found ${terraces.length} terraces\n`);

  let results = {};
  if (fs.existsSync(RESULTS_FILE)) {
    results = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf-8"));
    console.log(`Resuming — ${Object.keys(results).length} already processed\n`);
  }

  for (const terrace of terraces) {
    if (results[terrace.id]) continue;

    console.log(`[${terrace.id}] ${terrace.name}`);

    const place = await searchPlace(terrace.name, terrace.address);
    if (!place) {
      console.log("  No result found\n");
      results[terrace.id] = { name: terrace.name, placeId: null, periods: [] };
      fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
      await new Promise((r) => setTimeout(r, 300));
      continue;
    }

    const periods = parsePeriods(place.regularOpeningHours);
    console.log(
      `  placeId: ${place.id} | ${periods.length} hour periods\n`
    );

    results[terrace.id] = {
      name: terrace.name,
      placeId: place.id,
      periods,
    };
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));

    await new Promise((r) => setTimeout(r, 300));
  }

  console.log("\nDone! Now run: node scripts/apply-hours.js");
}

main().catch(console.error);
