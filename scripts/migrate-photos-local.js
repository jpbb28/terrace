/**
 * Downloads all terrace photos from Supabase Storage to public/photos/,
 * then rewrites all Supabase URLs in terraces.ts to local /photos/ paths.
 *
 * Run: node scripts/migrate-photos-local.js
 */

import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_BASE =
  "https://mnrpyixjrjoqiecfsibg.supabase.co/storage/v1/object/public/photos";
const LOCAL_BASE = path.join(__dirname, "../public/photos");
const TERRACES_FILE = path.join(__dirname, "../src/data/terraces.ts");

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(dest);
    proto
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close();
          fs.unlinkSync(dest);
          return download(res.headers.location, dest).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlinkSync(dest);
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        res.pipe(file);
        file.on("finish", () => file.close(resolve));
      })
      .on("error", (err) => {
        fs.existsSync(dest) && fs.unlinkSync(dest);
        reject(err);
      });
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const source = fs.readFileSync(TERRACES_FILE, "utf8");

  // Extract all unique Supabase photo URLs
  const regex =
    /https:\/\/mnrpyixjrjoqiecfsibg\.supabase\.co\/storage\/v1\/object\/public\/photos\/([^"']+)/g;
  const allMatches = [...source.matchAll(regex)];
  const uniquePaths = [...new Set(allMatches.map((m) => m[1]))];

  console.log(`Found ${uniquePaths.length} unique photo paths to migrate.`);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;
  const failedPaths = [];

  for (const photoPath of uniquePaths) {
    const localPath = path.join(LOCAL_BASE, photoPath);
    const localDir = path.dirname(localPath);

    if (fs.existsSync(localPath)) {
      skipped++;
      continue;
    }

    fs.mkdirSync(localDir, { recursive: true });

    const url = `${SUPABASE_BASE}/${photoPath}`;
    try {
      await download(url, localPath);
      downloaded++;
      if (downloaded % 10 === 0) {
        console.log(`  Downloaded ${downloaded}...`);
      }
      await sleep(50); // be gentle
    } catch (err) {
      console.error(`  FAILED: ${photoPath} — ${err.message}`);
      failed++;
      failedPaths.push(photoPath);
    }
  }

  console.log(
    `\nDownload complete: ${downloaded} downloaded, ${skipped} already existed, ${failed} failed.`
  );

  if (failed > 0) {
    console.log(`\n${failed} file(s) failed to download — they will keep their Supabase URL in terraces.ts.`);
  }

  // Rewrite Supabase URLs to local /photos/ paths, skipping any that failed to download
  let updated = source;
  for (const photoPath of uniquePaths) {
    if (failedPaths.includes(photoPath)) continue;
    const supabaseUrl = `https://mnrpyixjrjoqiecfsibg.supabase.co/storage/v1/object/public/photos/${photoPath}`;
    updated = updated.split(supabaseUrl).join(`/photos/${photoPath}`);
  }

  if (updated === source) {
    console.log("No URLs changed — already migrated?");
    return;
  }

  fs.writeFileSync(TERRACES_FILE, updated, "utf8");
  console.log(`\nRewrote terraces.ts — all Supabase photo URLs now point to /photos/`);
  console.log("Next steps:");
  console.log("  1. Run: npm run build  (verify no errors)");
  console.log("  2. Deploy to Netlify (photos will be served via Netlify CDN)");
  console.log("  3. After confirming the deploy works, delete photos from Supabase Storage");
}

main().catch(console.error);
