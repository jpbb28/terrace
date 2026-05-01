import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

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

const RESULTS_FILE = path.join(ROOT, "scripts", "coords-results.json");

function loadTerraces() {
  const src = fs.readFileSync(
    path.join(ROOT, "src", "data", "terraces.ts"),
    "utf-8",
  );
  const terraces = [];
  // Extract id, name, and placeId from each terrace block
  const blocks = src.split(/(?=\s*{\s*\n\s*id:)/);
  for (const block of blocks) {
    const idMatch = block.match(/id:\s*"(\d+)"/);
    const nameMatch = block.match(/name:\s*"([^"]+)"/);
    const placeIdMatch = block.match(/placeId:\s*"([^"]+)"/);
    if (idMatch && nameMatch && placeIdMatch) {
      terraces.push({
        id: idMatch[1],
        name: nameMatch[1],
        placeId: placeIdMatch[1],
      });
    }
  }
  return terraces;
}

async function fetchLocation(placeId) {
  const res = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}`,
    {
      headers: {
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "location",
        Referer: "https://terrasseseason.com",
      },
    },
  );
  const data = await res.json();
  if (data.error) {
    console.error(`  API error: ${data.error.message}`);
    return null;
  }
  return data.location || null;
}

async function main() {
  const terraces = loadTerraces();
  console.log(`Found ${terraces.length} terraces with placeId\n`);

  let results = {};
  if (fs.existsSync(RESULTS_FILE)) {
    results = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf-8"));
    console.log(
      `Resuming — ${Object.keys(results).length} already processed\n`,
    );
  }

  for (const terrace of terraces) {
    if (results[terrace.id]) continue;

    console.log(`[${terrace.id}] ${terrace.name}`);

    const location = await fetchLocation(terrace.placeId);
    if (!location) {
      console.log("  No location returned\n");
      results[terrace.id] = { name: terrace.name, lat: null, lng: null };
      fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
      await new Promise((r) => setTimeout(r, 200));
      continue;
    }

    console.log(`  lat: ${location.latitude}, lng: ${location.longitude}\n`);
    results[terrace.id] = {
      name: terrace.name,
      lat: location.latitude,
      lng: location.longitude,
    };
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
    await new Promise((r) => setTimeout(r, 200));
  }

  const found = Object.values(results).filter((r) => r.lat !== null).length;
  const missing = Object.values(results).filter((r) => r.lat === null).length;
  console.log(`\nDone! ${found} found, ${missing} missing.`);
  console.log("Now run: node scripts/apply-coords.js");
}

main().catch(console.error);
