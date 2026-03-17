/**
 * Compresses main (first) photos for all terraces on Supabase Storage.
 * Downloads the original, re-encodes as a smaller progressive JPEG, re-uploads in place.
 * After a fresh Vercel deploy, /_next/image cache is reset and the smaller sources are used.
 *
 * Usage: node scripts/compress-main-photos.js [--dry-run]
 */

import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DRY_RUN = process.argv.includes("--dry-run");

// Load env vars
const envFile = fs.readFileSync(path.join(ROOT, ".env.local"), "utf-8");
const env = Object.fromEntries(
  envFile.split("\n")
    .filter(l => l.includes("=") && !l.startsWith("#"))
    .map(l => { const idx = l.indexOf("="); return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()]; })
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// Extract all Supabase main.jpg (and main.webp) URLs from terraces.ts
const terraceSrc = fs.readFileSync(path.join(ROOT, "src", "data", "terraces.ts"), "utf-8");

const BUCKET = "photos";
const PROJECT_URL = SUPABASE_URL;

// Find all unique main photo URLs (first photo in each photos array)
// Pattern: photos: ["<URL>", ...] — capture the first URL
const photoArrayRegex = /photos:\s*\["(https:\/\/[^"]+)"[^\]]*\]/g;
const mainPhotos = [];
let m;
while ((m = photoArrayRegex.exec(terraceSrc)) !== null) {
  const url = m[1];
  if (!url.includes("supabase.co")) continue;
  // Extract storage path: everything after /public/photos/
  const match = url.match(/\/public\/photos\/(.+)$/);
  if (!match) continue;
  const storagePath = match[1].split("?")[0]; // strip any query params
  mainPhotos.push({ url, storagePath });
}

// Deduplicate by storagePath
const unique = [...new Map(mainPhotos.map(x => [x.storagePath, x])).values()];
console.log(`Found ${unique.length} unique main photos to process${DRY_RUN ? " (dry-run)" : ""}\n`);

const TARGET_MAX_WIDTH = 1200;
const JPEG_QUALITY = 78;
const MIN_SAVINGS_PERCENT = 15; // skip if compression saves less than this

let compressed = 0, skipped = 0, errors = 0;

for (const { url, storagePath } of unique) {
  try {
    // Download original
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  SKIP  ${storagePath} — fetch ${res.status}`);
      skipped++;
      continue;
    }
    const originalBuffer = Buffer.from(await res.arrayBuffer());
    const originalKB = (originalBuffer.length / 1024).toFixed(0);

    // Detect format
    const metadata = await sharp(originalBuffer).metadata();
    const isAlreadySmall = originalBuffer.length < 400 * 1024; // under 400KB, skip
    if (isAlreadySmall) {
      console.log(`  SKIP  ${storagePath} — already ${originalKB}KB`);
      skipped++;
      continue;
    }

    // Compress
    const compressedBuffer = await sharp(originalBuffer)
      .resize({ width: TARGET_MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true })
      .toBuffer();

    const compressedKB = (compressedBuffer.length / 1024).toFixed(0);
    const savingsPct = ((1 - compressedBuffer.length / originalBuffer.length) * 100).toFixed(0);

    if (compressedBuffer.length >= originalBuffer.length * (1 - MIN_SAVINGS_PERCENT / 100)) {
      console.log(`  SKIP  ${storagePath} — ${originalKB}KB, only ${savingsPct}% saving`);
      skipped++;
      continue;
    }

    if (DRY_RUN) {
      console.log(`  DRY   ${storagePath} — ${originalKB}KB → ${compressedKB}KB (${savingsPct}% saved)`);
      compressed++;
      continue;
    }

    // Re-upload in place
    const { error } = await supabase.storage.from(BUCKET).upload(storagePath, compressedBuffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

    if (error) {
      console.error(`  ERROR ${storagePath} — upload: ${error.message}`);
      errors++;
      continue;
    }

    console.log(`  OK    ${storagePath} — ${originalKB}KB → ${compressedKB}KB (${savingsPct}% saved)`);
    compressed++;
  } catch (e) {
    console.error(`  ERROR ${storagePath} — ${e.message}`);
    errors++;
  }
}

console.log(`\n${DRY_RUN ? "Dry-run" : "Done"}: ${compressed} compressed, ${skipped} skipped, ${errors} errors`);
