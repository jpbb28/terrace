// Populate terrace_name on every row in reviews, terrace_events,
// terrace_season_dates, and terrace_season_date_submissions by joining
// terrace_id against names parsed from src/data/terraces.ts.
//
// Idempotent — re-run any time terraces.ts is edited and you want existing
// rows to pick up renamed terraces. Only updates rows where the stored name
// differs from the current source-of-truth name.
const fs = require("fs");
const path = require("path");

const env = fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf-8");
for (const line of env.split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

// Parse id + name pairs out of the literal terraces array. Matches the same
// shape that scripts/cap-terrace-hours.cjs relies on.
const FILE = path.join(__dirname, "..", "src", "data", "terraces.ts");
const src = fs.readFileSync(FILE, "utf-8");
const entryRe = /id:\s*"([^"]+)",[\s\S]*?name:\s*"((?:[^"\\]|\\.)*)"/g;

const idToName = new Map();
for (const m of src.matchAll(entryRe)) {
  const id = m[1];
  const name = m[2].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  if (!idToName.has(id)) idToName.set(id, name);
}
console.log(`Parsed ${idToName.size} terraces from terraces.ts`);

const TABLES = [
  "reviews",
  "terrace_events",
  "terrace_season_dates",
  "terrace_season_date_submissions",
];

(async () => {
  for (const table of TABLES) {
    const { data, error } = await supabase
      .from(table)
      .select("terrace_id, terrace_name");

    if (error) {
      console.error(`[${table}] read failed:`, error.message);
      process.exit(1);
    }

    // Group rows that need updating by their target name to minimize round-trips.
    const buckets = new Map();
    for (const row of data ?? []) {
      const want = idToName.get(row.terrace_id);
      if (!want) continue;
      if (row.terrace_name === want) continue;
      if (!buckets.has(want)) buckets.set(want, []);
      buckets.get(want).push(row.terrace_id);
    }

    let updated = 0;
    let skipped =
      (data?.length ?? 0) -
      [...buckets.values()].reduce((n, ids) => n + ids.length, 0);

    for (const [name, ids] of buckets) {
      const uniqueIds = [...new Set(ids)];
      const { error: updateError, count } = await supabase
        .from(table)
        .update({ terrace_name: name }, { count: "exact" })
        .in("terrace_id", uniqueIds);

      if (updateError) {
        console.error(
          `[${table}] update for "${name}" failed:`,
          updateError.message,
        );
        process.exit(1);
      }
      updated += count ?? 0;
    }

    console.log(
      `[${table}] updated ${updated} row(s), ${skipped} already correct`,
    );
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
