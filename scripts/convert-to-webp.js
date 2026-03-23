/**
 * Converts all JPG/JPEG images in public/photos/ to WebP (quality 90, near-lossless).
 * Deletes originals after successful conversion. Skips files already in WebP.
 *
 * Run: node scripts/convert-to-webp.js
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PHOTOS_DIR = path.join(__dirname, "../public/photos");

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkDir(full));
    else files.push(full);
  }
  return files;
}

async function main() {
  const all = walkDir(PHOTOS_DIR);
  const jpgs = all.filter((f) => /\.(jpg|jpeg)$/i.test(f));

  console.log(`Found ${jpgs.length} JPG files to convert.`);

  let converted = 0;
  let failed = 0;
  let savedBytes = 0;

  for (const src of jpgs) {
    const dest = src.replace(/\.(jpg|jpeg)$/i, ".webp");
    try {
      const srcSize = fs.statSync(src).size;
      await sharp(src).webp({ quality: 90 }).toFile(dest);
      const destSize = fs.statSync(dest).size;
      savedBytes += srcSize - destSize;
      fs.unlinkSync(src);
      converted++;
    } catch (err) {
      console.error(`  FAILED: ${src} — ${err.message}`);
      // Clean up partial output if it exists
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      failed++;
    }
  }

  const savedMB = (savedBytes / 1024 / 1024).toFixed(1);
  console.log(`\nDone: ${converted} converted, ${failed} failed.`);
  console.log(`Size reduction: ${savedMB} MB saved.`);
}

main().catch(console.error);
