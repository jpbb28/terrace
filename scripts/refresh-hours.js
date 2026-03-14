import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

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

async function fetchHours(placeId) {
  const res = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}`,
    {
      headers: {
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "regularOpeningHours",
      },
    }
  );
  const data = await res.json();
  if (data.error) {
    console.error(`  API error: ${data.error.message}`);
    return null;
  }
  return data.regularOpeningHours ?? null;
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

async function main() {
  const terraces = loadPlaceIds();
  console.log(`Found ${terraces.length} terraces with placeId\n`);

  let src = fs.readFileSync(TERRACES_FILE, "utf-8");
  let updated = 0;

  for (const terrace of terraces) {
    console.log(`[${terrace.id}] fetching hours...`);
    const hours = await fetchHours(terrace.placeId);
    if (!hours) {
      console.log("  No hours returned");
      await new Promise((r) => setTimeout(r, 150));
      continue;
    }

    const periods = parsePeriods(hours);
    const periodsStr = buildPeriodsStr(periods);

    const hasExisting = new RegExp(
      `id:\\s*"${terrace.id}"[\\s\\S]*?openingPeriods:`,
      "m"
    ).test(src);

    if (hasExisting) {
      src = src.replace(
        new RegExp(`(id:\\s*"${terrace.id}"[\\s\\S]*?)    openingPeriods:\\s*\\[[\\s\\S]*?\\],?`, "m"),
        `$1    openingPeriods: ${periodsStr},`
      );
    } else {
      src = src.replace(
        new RegExp(`(id:\\s*"${terrace.id}"[\\s\\S]*?)(\\n    description:)`, "m"),
        `$1\n    openingPeriods: ${periodsStr},$2`
      );
    }

    console.log(`  ${periods.length} periods`);
    updated++;
    await new Promise((r) => setTimeout(r, 150));
  }

  fs.writeFileSync(TERRACES_FILE, src);
  console.log(`\nUpdated ${updated} terraces with fresh opening hours.`);
}

main().catch(console.error);
