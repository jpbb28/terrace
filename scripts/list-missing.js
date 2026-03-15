// Lists terraces missing website or instagram
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const content = readFileSync(resolve(__dirname, "../src/data/terraces.ts"), "utf8");

// Extract terrace blocks
const blocks = content.split(/\n  \{/).slice(1);

const results = [];
for (const block of blocks) {
  const nameMatch = block.match(/name: "([^"]+)"/);
  if (!nameMatch) continue;
  const name = nameMatch[1];
  const hasWebsite = /website:/.test(block);
  const hasInstagram = /instagram:/.test(block);
  results.push({ name, hasWebsite, hasInstagram });
}

const missingWebsite = results.filter(r => !r.hasWebsite).map(r => r.name);
const missingInstagram = results.filter(r => !r.hasInstagram).map(r => r.name);

console.log("=== MISSING WEBSITE ===");
missingWebsite.forEach(n => console.log(" -", n));
console.log("\n=== MISSING INSTAGRAM ===");
missingInstagram.forEach(n => console.log(" -", n));
console.log(`\nTotal: ${results.length} terraces, ${missingWebsite.length} missing website, ${missingInstagram.length} missing instagram`);
