import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// Support GitHub Actions env var or local .env.local
let API_KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!API_KEY) {
  const envPath = path.join(ROOT, ".env.local");
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf-8");
    API_KEY = envFile
      .split("\n")
      .find((l) => l.startsWith("GOOGLE_PLACES_API_KEY="))
      ?.split("=")[1]
      ?.trim();
  }
}

if (!API_KEY) {
  console.error("Missing GOOGLE_PLACES_API_KEY");
  process.exit(1);
}

const RESULTS_FILE = path.join(ROOT, "scripts", "ratings-results.json");

function loadPlaceIds() {
  const src = fs.readFileSync(
    path.join(ROOT, "src", "data", "terraces.ts"),
    "utf-8"
  );
  const terraces = [];
  const regex = /id:\s*"(\d+)"[\s\S]*?placeId:\s*"([^"]+)"/g;
  let match;
  while ((match = regex.exec(src)) !== null) {
    terraces.push({ id: match[1], placeId: match[2] });
  }
  return terraces;
}

async function fetchRating(placeId) {
  const res = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}`,
    {
      headers: {
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "rating,userRatingCount",
      },
    }
  );
  const data = await res.json();
  if (data.error) {
    console.error(`  API error: ${data.error.message}`);
    return null;
  }
  return {
    rating: data.rating ?? null,
    userRatingCount: data.userRatingCount ?? null,
  };
}

async function main() {
  const terraces = loadPlaceIds();
  console.log(`Found ${terraces.length} terraces with placeId\n`);

  const results = {};

  for (const terrace of terraces) {
    console.log(`[${terrace.id}] fetching...`);
    const data = await fetchRating(terrace.placeId);
    if (data) {
      results[terrace.id] = data;
      console.log(`  rating: ${data.rating} (${data.userRatingCount} reviews)`);
    } else {
      results[terrace.id] = { rating: null, userRatingCount: null };
    }
    await new Promise((r) => setTimeout(r, 150));
  }

  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
  console.log(`\nSaved to ratings-results.json`);
}

main().catch(console.error);
