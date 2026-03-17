// Renames photos[0] for each terrace in terraces.ts to main.{ext} in Supabase Storage.
// Also updates the URL in terraces.ts to reflect the new filename.
//
// Usage: node scripts/rename-main-photos.js
// Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY in .env.local

import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse .env.local manually (no dotenv needed)
const envPath = resolve(__dirname, "../.env.local");
const envVars = {};
readFileSync(envPath, "utf8").split("\n").forEach((line) => {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) envVars[key.trim()] = rest.join("=").trim();
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_KEY
);

const BUCKET = "photos";
const filePath = resolve(__dirname, "../src/data/terraces.ts");
let source = readFileSync(filePath, "utf8");

async function run() {
  const photoLineRe = /photos:\s*\["(https:\/\/[^"]+)"[^\]]*\]/g;
  let match;
  let replacements = 0;
  let skipped = 0;

  while ((match = photoLineRe.exec(source)) !== null) {
    const firstUrl = match[1];
    const urlObj = new URL(firstUrl);

    const prefix = `/storage/v1/object/public/${BUCKET}/`;
    if (!urlObj.pathname.startsWith(prefix)) {
      console.log(`  Skipping unrecognised URL: ${firstUrl}`);
      skipped++;
      continue;
    }

    const storagePath = decodeURIComponent(urlObj.pathname.slice(prefix.length));
    const lastSlash = storagePath.lastIndexOf("/");
    const folder = storagePath.slice(0, lastSlash);
    const filename = storagePath.slice(lastSlash + 1);

    if (filename.startsWith("main.")) {
      skipped++;
      continue;
    }

    const ext = filename.includes(".") ? filename.split(".").pop() : "jpg";
    const newPath = `${folder}/main.${ext}`;
    const newUrl = `${urlObj.origin}${prefix}${newPath}`;

    process.stdout.write(`  ${storagePath} → ${newPath} ... `);

    const { error } = await supabase.storage.from(BUCKET).move(storagePath, newPath);
    if (error) {
      console.log(`FAILED: ${error.message}`);
      skipped++;
      continue;
    }

    source = source.replace(firstUrl, newUrl);
    console.log("OK");
    replacements++;
  }

  if (replacements > 0) {
    writeFileSync(filePath, source, "utf8");
    console.log(`\nDone. Renamed ${replacements} photos, updated terraces.ts.`);
  } else {
    console.log(`\nNothing to rename (${skipped} skipped).`);
  }
}

run().catch(console.error);
