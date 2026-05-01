import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const RESULTS_FILE = path.join(ROOT, "scripts", "coords-results.json");
const TERRACES_FILE = path.join(ROOT, "src", "data", "terraces.ts");

if (!fs.existsSync(RESULTS_FILE)) {
  console.error("coords-results.json not found. Run fetch-coords.js first.");
  process.exit(1);
}

const results = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf-8"));
let src = fs.readFileSync(TERRACES_FILE, "utf-8");

let updated = 0;
let skipped = 0;

for (const [id, data] of Object.entries(results)) {
  if (data.lat === null || data.lng === null) {
    skipped++;
    continue;
  }

  const lat = data.lat.toFixed(7);
  const lng = data.lng.toFixed(7);

  // Replace lat: <number>, for this terrace block
  // Strategy: find the block starting at id: "N", then replace the lat/lng within it.
  // We use a two-pass replace: match from `id: "N"` up through the lat/lng lines.
  const latReplaced = src.replace(
    new RegExp(`(id:\\s*"${id}"[\\s\\S]*?\\n    lat:\\s*)[-\\d.]+`, "m"),
    `$1${lat}`,
  );

  if (latReplaced === src) {
    console.log(`[${id}] ${data.name} — lat not found, skipping`);
    skipped++;
    continue;
  }

  const lngReplaced = latReplaced.replace(
    new RegExp(`(id:\\s*"${id}"[\\s\\S]*?\\n    lng:\\s*)[-\\d.]+`, "m"),
    `$1${lng}`,
  );

  if (lngReplaced === latReplaced) {
    console.log(`[${id}] ${data.name} — lng not found, skipping`);
    skipped++;
    continue;
  }

  src = lngReplaced;
  console.log(`[${id}] ${data.name} → ${lat}, ${lng}`);
  updated++;
}

fs.writeFileSync(TERRACES_FILE, src);
console.log(`\nUpdated ${updated} terraces | skipped ${skipped}`);
