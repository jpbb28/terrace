// Fetches up to 10 additional photos per terrace using the legacy Places API
// and appends them to existing photo-results.json entries.
// Only processes terraces that don't already have extra photos fetched.

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

const RESULTS_FILE = path.join(ROOT, "scripts", "photo-results.json");
const PHOTOS_DIR = path.join(ROOT, "public", "photos");
const EXTRA_PER_PLACE = 10;

// Only top-up terraces from this ID onwards (1-28 already reviewed)
const START_FROM_ID = 29;

function loadTerraces() {
  const src = fs.readFileSync(path.join(ROOT, "src", "data", "terraces.ts"), "utf-8");
  const terraces = [];
  const idRe = /id:\s*"(\d+)"/g;
  const nameRe = /name:\s*"([^"]+)"/g;
  const addrRe = /address:\s*"([^"]+)"/g;
  const ids = [...src.matchAll(/id:\s*"(\d+)"/g)].map(m => m[1]);
  const names = [...src.matchAll(/name:\s*"([^"]+)"/g)].map(m => m[1]);
  const addrs = [...src.matchAll(/address:\s*"([^"]+)"/g)].map(m => m[1]);
  for (let i = 0; i < ids.length; i++) {
    terraces.push({ id: ids[i], name: names[i], address: addrs[i] });
  }
  return terraces;
}

async function findPlaceId(name, address) {
  const query = encodeURIComponent(`${name} ${address} Montreal`);
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.candidates?.[0]?.place_id || null;
}

async function fetchPhotoRefs(placeId) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.result?.photos || [];
}

async function downloadLegacyPhoto(photoRef, terraceId, index) {
  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${API_KEY}`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) return null;

  const dir = path.join(PHOTOS_DIR, terraceId);
  fs.mkdirSync(dir, { recursive: true });

  const filename = `${index}.jpg`;
  const filepath = path.join(dir, filename);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(filepath, buffer);

  return `/photos/${terraceId}/${filename}`;
}

async function main() {
  const terraces = loadTerraces().filter(t => parseInt(t.id) >= START_FROM_ID);
  const results = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf-8"));

  console.log(`Topping up ${terraces.length} terraces (IDs ${START_FROM_ID}+) with up to ${EXTRA_PER_PLACE} extra photos each\n`);

  for (const terrace of terraces) {
    const existing = results[terrace.id];
    if (!existing) continue;

    // Skip if already topped up (has more than 10 photos)
    if (existing.photos.length > 10) {
      continue;
    }

    console.log(`[${terrace.id}] ${terrace.name} (${existing.photos.length} existing)`);

    const placeId = await findPlaceId(terrace.name, terrace.address);
    if (!placeId) {
      console.log("  No place found\n");
      continue;
    }

    const photoRefs = await fetchPhotoRefs(placeId);
    if (!photoRefs.length) {
      console.log("  No photos\n");
      continue;
    }

    // Skip first 10 (already have those from new API), take next EXTRA_PER_PLACE
    const toFetch = photoRefs.slice(10, 10 + EXTRA_PER_PLACE);
    if (!toFetch.length) {
      console.log("  No additional photos available\n");
      continue;
    }

    const newPhotos = [];
    let index = existing.photos.length; // start numbering after existing files

    for (const ref of toFetch) {
      const photoPath = await downloadLegacyPhoto(ref.photo_reference, terrace.id, index);
      if (photoPath) {
        newPhotos.push({
          path: photoPath,
          authors: ref.html_attributions?.map(a => a.replace(/<[^>]+>/g, "")) || [],
        });
        index++;
      }
      await new Promise(r => setTimeout(r, 150));
    }

    console.log(`  Added ${newPhotos.length} extra photos\n`);
    existing.photos = [...existing.photos, ...newPhotos];
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
  }

  console.log("Done! Run: node scripts/build-review.js");
}

main().catch(console.error);
