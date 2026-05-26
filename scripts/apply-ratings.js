import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const RESULTS_FILE = path.join(ROOT, "scripts", "ratings-results.json");
const TERRACES_FILE = path.join(ROOT, "src", "data", "terraces.ts");

if (!fs.existsSync(RESULTS_FILE)) {
  console.error(
    "ratings-results.json not found. Run refresh-google-data.js first.",
  );
  process.exit(1);
}

const results = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf-8"));
let src = fs.readFileSync(TERRACES_FILE, "utf-8");

let updated = 0;

for (const [id, data] of Object.entries(results)) {
  if (!data.rating) continue;

  const rating = Math.round(data.rating * 10) / 10;
  const count = data.userRatingCount;

  // Remove existing googleRating / googleReviewCount lines for this terrace
  src = src.replace(
    new RegExp(`(id:\\s*"${id}"[\\s\\S]*?)\\n    googleRating:[^\\n]+`, "m"),
    "$1",
  );
  src = src.replace(
    new RegExp(
      `(id:\\s*"${id}"[\\s\\S]*?)\\n    googleReviewCount:[^\\n]+`,
      "m",
    ),
    "$1",
  );

  // Insert after placeId line
  src = src.replace(
    new RegExp(`(id:\\s*"${id}"[\\s\\S]*?placeId:\\s*"[^"]+",)(\\r?\\n)`, "m"),
    `$1$2    googleRating: ${rating},\n    googleReviewCount: ${count},\n`,
  );

  updated++;
}

fs.writeFileSync(TERRACES_FILE, src);
console.log(`Updated ${updated} terraces with Google ratings.`);
