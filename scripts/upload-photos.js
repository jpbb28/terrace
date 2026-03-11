// Uploads all photos from public/photos/ to Supabase Storage "photos" bucket.
// Then updates terraces.ts photo paths to Supabase Storage public URLs.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const envFile = fs.readFileSync(path.join(ROOT, ".env.local"), "utf-8");
function getEnv(key) {
  return envFile.split("\n").find((l) => l.startsWith(key + "="))?.split("=").slice(1).join("=").trim();
}

const SUPABASE_URL = getEnv("NEXT_PUBLIC_SUPABASE_URL");
const SUPABASE_SERVICE_KEY = getEnv("SUPABASE_SERVICE_KEY");
const BUCKET = "photos";

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const PHOTOS_DIR = path.join(ROOT, "public", "photos");

function getAllFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllFiles(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

async function main() {
  const allFiles = getAllFiles(PHOTOS_DIR);
  console.log(`Found ${allFiles.length} photos to upload\n`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const filePath of allFiles) {
    // Storage path = relative to public/photos/, e.g. "102/0.jpg"
    const storagePath = path.relative(PHOTOS_DIR, filePath).replace(/\\/g, "/");

    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error(`  FAILED ${storagePath}: ${error.message}`);
      failed++;
    } else {
      console.log(`  OK ${storagePath}`);
      uploaded++;
    }
  }

  console.log(`\nDone: ${uploaded} uploaded, ${skipped} skipped, ${failed} failed`);

  if (failed === 0) {
    console.log("\nUpdating terraces.ts photo paths...");
    updateTerracesTs();
    console.log("Done! terraces.ts updated.");
  } else {
    console.log("\nSome uploads failed — fix errors before updating terraces.ts");
  }
}

function updateTerracesTs() {
  const terracesPath = path.join(ROOT, "src", "data", "terraces.ts");
  let src = fs.readFileSync(terracesPath, "utf-8");

  // Replace /photos/... paths with Supabase Storage URLs
  const storageBase = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`;

  // Match local photo paths: "/photos/123/0.jpg"
  src = src.replace(/\"\/photos\/([^"]+)\"/g, `"${storageBase}/$1"`);

  fs.writeFileSync(terracesPath, src);
}

main().catch(console.error);
