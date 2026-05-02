// Mark the listed submission UUIDs as 'approved' in the submissions table.
// Reads scripts/submissions-verified.json to know which UUIDs to mark.
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

const inputs = JSON.parse(
  fs.readFileSync(path.join(__dirname, "submissions-input.json"), "utf-8"),
);
const ids = inputs.map((s) => s.id);

(async () => {
  const { data, error } = await supabase
    .from("submissions")
    .update({ status: "approved" })
    .in("id", ids)
    .select("id, name, status");
  if (error) {
    console.error(error);
    process.exit(1);
  }
  console.log(`Marked ${data.length} submissions as approved:`);
  for (const r of data) console.log(`  ${r.id}  ${r.name}`);
})();
