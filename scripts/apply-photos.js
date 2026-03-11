import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const selectionFile = process.argv[2];
if (!selectionFile) {
  console.error("Usage: node scripts/apply-photos.js <selected-photos.json>");
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(selectionFile, "utf-8"));

// Support old format (id -> [paths]) and new format (id -> { main, photos: [{path, base64?}|string] })
const selected = {};
for (const [id, val] of Object.entries(raw)) {
  selected[id] = Array.isArray(val) ? val.map(p => ({ path: p })) : (val.photos || []).map(p => typeof p === 'string' ? { path: p } : p);
}
const terracesPath = path.join(ROOT, "src", "data", "terraces.ts");
let src = fs.readFileSync(terracesPath, "utf-8");

// Load API key (needed to build Street View URLs)
const envFile = fs.readFileSync(path.join(ROOT, ".env.local"), "utf-8");
const API_KEY = envFile
  .split("\n")
  .find((l) => l.startsWith("GOOGLE_PLACES_API_KEY="))
  ?.split("=")[1]
  ?.trim();

// Load lat/lng for Street View URL reconstruction
const terraceSrcRaw = fs.readFileSync(path.join(ROOT, "src", "data", "terraces.ts"), "utf-8");
const coordMap = {};
const coordRegex = /id:\s*"(\d+)"[\s\S]*?lat:\s*([\d.-]+),\s*\n\s*lng:\s*([\d.-]+)/g;
let cm;
while ((cm = coordRegex.exec(terraceSrcRaw)) !== null) {
  coordMap[cm[1]] = { lat: cm[2], lng: cm[3] };
}

function resolvePhotoPath(p, id) {
  if (p.startsWith("__sv__")) {
    // Store as a safe internal path — served via /api/streetview route (key stays server-side)
    return `/api/streetview/${id}`;
  }
  return p;
}

// Delete unselected photo files (skip Street View paths)
const resultsFile = path.join(ROOT, "scripts", "photo-results.json");
if (fs.existsSync(resultsFile)) {
  const allResults = JSON.parse(fs.readFileSync(resultsFile, "utf-8"));
  let deleted = 0;
  for (const [id, data] of Object.entries(allResults)) {
    const kept = (selected[id] || []).map(p => p.path);
    for (const photo of data.photos) {
      if (!kept.includes(photo.path)) {
        const fullPath = path.join(ROOT, "public", photo.path);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          deleted++;
        }
      }
    }
    const dir = path.join(ROOT, "public", "photos", id);
    if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
      fs.rmdirSync(dir);
    }
  }
  console.log(`Deleted ${deleted} unselected photos`);
}

// Update terraces.ts — replace empty photos arrays with selected paths
let updated = 0;
for (const [id, entries] of Object.entries(selected)) {
  if (entries.length === 0) continue;

  // Write custom base64 images to disk
  let customIndex = 0;
  for (const entry of entries) {
    if (entry.path.startsWith('__custom__') && entry.base64) {
      const dir = path.join(ROOT, "public", "photos", id);
      fs.mkdirSync(dir, { recursive: true });
      const filename = `custom${customIndex++}.jpg`;
      const base64Data = entry.base64.replace(/^data:image\/\w+;base64,/, '');
      fs.writeFileSync(path.join(dir, filename), Buffer.from(base64Data, 'base64'));
      entry.resolvedPath = `/photos/${id}/${filename}`;
    }
  }

  const resolved = entries.map(e => {
    if (e.resolvedPath) return e.resolvedPath;
    return resolvePhotoPath(e.path, id);
  }).filter(Boolean);
  if (resolved.length === 0) continue;
  const photosStr = resolved.map((p) => `"${p}"`).join(", ");

  // Match: id: "X", ... photos: [],
  // Use a targeted replacement for each terrace block
  const idPattern = new RegExp(
    `(id:\\s*"${id}"[\\s\\S]*?photos:\\s*)\\[\\]`,
    "m"
  );
  const newSrc = src.replace(idPattern, `$1[${photosStr}]`);

  if (newSrc !== src) {
    updated++;
    src = newSrc;
  }
}

fs.writeFileSync(terracesPath, src);
console.log(`Updated ${updated} terraces with selected photos`);
