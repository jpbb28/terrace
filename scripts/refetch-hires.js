// Re-downloads kept Google Places photos at 1600px resolution.
// Skips custom photos (custom*.jpg) and street view paths.
// Reads terraces.ts to know which terraces have kept photos.

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

const PROGRESS_FILE = path.join(ROOT, "scripts", "hires-progress.json");
let progress = fs.existsSync(PROGRESS_FILE)
  ? JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf-8"))
  : {};

// Parse terraces.ts to find terraces with kept Google Places photos
function getKeptTerraces() {
  const src = fs.readFileSync(path.join(ROOT, "src", "data", "terraces.ts"), "utf-8");
  const kept = [];

  const ids = [...src.matchAll(/id:\s*"(\d+)"/g)].map(m => m[1]);
  const names = [...src.matchAll(/name:\s*"([^"]+)"/g)].map(m => m[1]);
  const addrs = [...src.matchAll(/address:\s*"([^"]+)"/g)].map(m => m[1]);

  // Find photo arrays for each terrace
  const photoBlockRe = /id:\s*"(\d+)"[\s\S]*?photos:\s*\[([^\]]*)\]/g;
  let match;
  while ((match = photoBlockRe.exec(src)) !== null) {
    const id = match[1];
    const photosStr = match[2];
    // Extract paths from the photos array
    const paths = [...photosStr.matchAll(/"([^"]+)"/g)].map(m => m[1]);
    // Only include Google Places photos (not custom, not streetview API)
    const googlePhotos = paths.filter(p =>
      p.startsWith("/photos/") && !p.includes("custom") && !p.startsWith("/api/")
    );
    if (googlePhotos.length > 0) {
      const idx = ids.indexOf(id);
      kept.push({ id, name: names[idx], address: addrs[idx], photos: googlePhotos });
    }
  }
  return kept;
}

async function searchPlace(name, address) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": "places.id,places.photos",
    },
    body: JSON.stringify({
      textQuery: `${name} ${address} Montreal`,
      maxResultCount: 1,
    }),
  });
  const data = await res.json();
  if (data.error) { console.error(`  API error: ${data.error.message}`); return null; }
  return data.places?.[0] || null;
}

async function downloadPhoto(photoName, destPath) {
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=4800&maxHeightPx=4800&key=${API_KEY}`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) { console.error(`  Failed: ${res.status}`); return false; }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, buffer);
  return true;
}

async function main() {
  const terraces = getKeptTerraces();
  console.log(`Found ${terraces.length} terraces with Google Places photos to upgrade\n`);

  for (const terrace of terraces) {
    if (progress[terrace.id]) continue;

    console.log(`[${terrace.id}] ${terrace.name} (${terrace.photos.length} photos)`);

    const place = await searchPlace(terrace.name, terrace.address);
    if (!place?.photos?.length) {
      console.log("  No photos found in Places API\n");
      progress[terrace.id] = true;
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
      continue;
    }

    let downloaded = 0;
    for (const keptPath of terrace.photos) {
      // Extract index from path e.g. /photos/5/3.jpg -> 3
      const indexMatch = keptPath.match(/\/(\d+)\.jpg$/);
      if (!indexMatch) continue;
      const photoIndex = parseInt(indexMatch[1]);

      const photoRef = place.photos[photoIndex];
      if (!photoRef) {
        console.log(`  No photo ref for index ${photoIndex}, skipping`);
        continue;
      }

      const destPath = path.join(ROOT, "public", keptPath);
      const ok = await downloadPhoto(photoRef.name, destPath);
      if (ok) downloaded++;
      await new Promise(r => setTimeout(r, 200));
    }

    console.log(`  Re-downloaded ${downloaded}/${terrace.photos.length} at 1600px\n`);
    progress[terrace.id] = true;
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  }

  console.log("Done! All kept photos upgraded to 1600px.");
  fs.unlinkSync(PROGRESS_FILE);
}

main().catch(console.error);
