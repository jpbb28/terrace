// Set the status of a correction row: node scripts/set-correction-status.cjs <uuid> <applied|rejected>
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

const [id, status] = process.argv.slice(2);
if (!id || !["applied", "rejected"].includes(status)) {
  console.error("Usage: node scripts/set-correction-status.cjs <uuid> <applied|rejected>");
  process.exit(1);
}

(async () => {
  const { data, error } = await supabase
    .from("corrections")
    .update({ status })
    .eq("id", id)
    .select("id, terrace_id, terrace_name, status");
  if (error) {
    console.error(error);
    process.exit(1);
  }
  if (!data.length) {
    console.error(`No correction found with id ${id}`);
    process.exit(1);
  }
  for (const r of data) console.log(`  ${r.id}  ${r.terrace_name} (#${r.terrace_id}) -> ${r.status}`);
})();
