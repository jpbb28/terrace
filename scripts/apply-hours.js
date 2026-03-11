import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const RESULTS_FILE = path.join(ROOT, "scripts", "hours-results.json");
const TERRACES_FILE = path.join(ROOT, "src", "data", "terraces.ts");

if (!fs.existsSync(RESULTS_FILE)) {
  console.error("hours-results.json not found. Run fetch-hours.js first.");
  process.exit(1);
}

const results = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf-8"));
let src = fs.readFileSync(TERRACES_FILE, "utf-8");

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

let updated = 0;

for (const [id, data] of Object.entries(results)) {
  if (!data.placeId) continue;

  const periodsStr = buildPeriodsStr(data.periods);

  // ── 1. Add placeId after the id line (if not already present) ────────────
  // Pattern: match `id: "N",` then newline, negative lookahead for placeId
  // We don't anchor on leading spaces so the match is robust across indentation.
  // $1 = `id: "N",`, $2 = newline char
  const placeIdExists = new RegExp(`id:\\s*"${id}"[\\s\\S]*?placeId:`, "m").test(src);
  if (!placeIdExists) {
    src = src.replace(
      new RegExp(`(id:\\s*"${id}",)(\\r?\\n)`, "m"),
      `$1$2    placeId: "${data.placeId}",\n`
    );
  }

  // ── 2. Add/replace openingPeriods ─────────────────────────────────────────
  // Check if openingPeriods already exists for this terrace
  const hasExisting = new RegExp(
    `id:\\s*"${id}"[\\s\\S]*?openingPeriods:`,
    "m"
  ).test(src);

  if (hasExisting) {
    // Replace existing openingPeriods block (matches `    openingPeriods: [...],`)
    // The [\s\S]*? handles both empty [] and multi-line arrays
    src = src.replace(
      new RegExp(`(id:\\s*"${id}"[\\s\\S]*?)    openingPeriods:\\s*\\[[\\s\\S]*?\\],?`, "m"),
      `$1    openingPeriods: ${periodsStr},`
    );
  } else {
    // Insert openingPeriods before the description field.
    // Capture `\n    description:` as $2 so indentation is preserved exactly.
    src = src.replace(
      new RegExp(`(id:\\s*"${id}"[\\s\\S]*?)(\\n    description:)`, "m"),
      `$1\n    openingPeriods: ${periodsStr},$2`
    );
  }

  updated++;
}

fs.writeFileSync(TERRACES_FILE, src);
console.log(`Updated ${updated} terraces with structured opening hours.`);

const withHours = Object.values(results).filter((r) => r.periods?.length > 0).length;
const noHours = Object.values(results).filter((r) => r.placeId && r.periods?.length === 0).length;
const notFound = Object.values(results).filter((r) => !r.placeId).length;
console.log(`  ${withHours} with hours | ${noHours} found but no hours | ${notFound} place not found`);
