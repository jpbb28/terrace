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

const PHOTOS_DIR = path.join(ROOT, "public", "photos");
const RESULTS_FILE = path.join(ROOT, "scripts", "photo-results.json");
const PHOTOS_PER_PLACE = 10;

// Extract terraces from the TS file (simple regex parse to avoid needing ts-node)
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
        "X-Goog-FieldMask": "places.id,places.displayName,places.photos",
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

async function downloadPhoto(photoName, terraceId, index) {
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&maxHeightPx=600&key=${API_KEY}`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) {
    console.error(`  Failed to download photo ${index}: ${res.status}`);
    return null;
  }

  const dir = path.join(PHOTOS_DIR, terraceId);
  fs.mkdirSync(dir, { recursive: true });

  const filename = `${index}.jpg`;
  const filepath = path.join(dir, filename);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(filepath, buffer);

  return `/photos/${terraceId}/${filename}`;
}

async function main() {
  const terraces = loadTerraces();
  console.log(`Found ${terraces.length} terraces\n`);

  // Resume from previous progress if available
  let results = {};
  if (fs.existsSync(RESULTS_FILE)) {
    results = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf-8"));
    console.log(
      `Resuming — ${Object.keys(results).length} already processed\n`
    );
  }

  for (const terrace of terraces) {
    if (results[terrace.id]) {
      continue; // already done
    }

    console.log(`[${terrace.id}] ${terrace.name}`);

    const place = await searchPlace(terrace.name, terrace.address);
    if (!place || !place.photos?.length) {
      console.log("  No photos found\n");
      results[terrace.id] = { name: terrace.name, photos: [] };
      fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
      continue;
    }

    const photos = [];
    const toDownload = place.photos.slice(0, PHOTOS_PER_PLACE);

    for (let i = 0; i < toDownload.length; i++) {
      const photoPath = await downloadPhoto(
        toDownload[i].name,
        terrace.id,
        i
      );
      if (photoPath) {
        photos.push({
          path: photoPath,
          authors: toDownload[i].authorAttributions?.map((a) => a.displayName) || [],
        });
      }
      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 200));
    }

    console.log(`  Downloaded ${photos.length} photos\n`);
    results[terrace.id] = { name: terrace.name, photos };
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
  }

  console.log("\nDone! Now run: node scripts/build-review.js");
}

main().catch(console.error);
