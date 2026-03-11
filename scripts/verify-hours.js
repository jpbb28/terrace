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

const RESULTS_FILE = path.join(ROOT, "scripts", "hours-results.json");
const results = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf-8"));

// Normalize a name for comparison: lowercase, strip accents, remove punctuation,
// remove common venue words that Google often omits or adds differently
function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[''`']/g, "")                            // strip apostrophes
    .replace(/[^a-z0-9\s]/g, " ")                      // punctuation → space
    .replace(/\b(bar|buvette|bistro|bistrot|restaurant|resto|cafe|pub|brasserie|taverne|tavern|lounge|grill|garden|jardin|terrasse|terrace|le|la|les|l|de|du|des|et|the|a|an)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function similarity(a, b) {
  const na = normalize(a).split(" ").filter(Boolean);
  const nb = normalize(b).split(" ").filter(Boolean);
  if (na.length === 0 || nb.length === 0) return 0;
  const matches = na.filter((w) => nb.includes(w)).length;
  return matches / Math.max(na.length, nb.length);
}

async function getDisplayName(placeId) {
  const res = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}`,
    {
      headers: {
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "displayName,formattedAddress",
      },
    }
  );
  const data = await res.json();
  if (data.error) {
    console.error(`  API error for ${placeId}: ${data.error.message}`);
    return null;
  }
  return { name: data.displayName?.text ?? null, address: data.formattedAddress ?? null };
}

async function main() {
  const entries = Object.entries(results).filter(([, v]) => v.placeId);
  console.log(`Verifying ${entries.length} place matches...\n`);

  const mismatches = [];
  const ok = [];

  for (const [id, data] of entries) {
    const place = await getDisplayName(data.placeId);
    if (!place?.name) {
      mismatches.push({ id, ourName: data.name, googleName: "(not found)", placeId: data.placeId, score: 0 });
      await new Promise((r) => setTimeout(r, 200));
      continue;
    }

    const score = similarity(data.name, place.name);
    const entry = { id, ourName: data.name, googleName: place.name, address: place.address, placeId: data.placeId, score };

    if (score < 0.5) {
      mismatches.push(entry);
    } else {
      ok.push(entry);
    }

    await new Promise((r) => setTimeout(r, 150));
  }

  console.log(`✅ ${ok.length} good matches\n`);

  if (mismatches.length === 0) {
    console.log("No mismatches found.");
  } else {
    console.log(`⚠️  ${mismatches.length} possible mismatches:\n`);
    for (const m of mismatches.sort((a, b) => a.score - b.score)) {
      console.log(`[${m.id}] Score: ${(m.score * 100).toFixed(0)}%`);
      console.log(`  Ours:   ${m.ourName}`);
      console.log(`  Google: ${m.googleName}`);
      console.log(`  Addr:   ${m.address ?? "—"}`);
      console.log(`  ID:     ${m.placeId}\n`);
    }
  }
}

main().catch(console.error);
