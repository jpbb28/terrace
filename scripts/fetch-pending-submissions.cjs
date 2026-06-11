// Fetch all pending submissions from the `submissions` table and write them to
// scripts/submissions-input.json (the input for the verify/add pipeline).
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

(async () => {
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) {
    console.error(error);
    process.exit(1);
  }
  console.log(`Found ${data.length} pending submission(s):`);
  for (const r of data) console.log(`  ${r.id}  ${r.name}  (${r.created_at})`);
  fs.writeFileSync(
    path.join(__dirname, "submissions-input.json"),
    JSON.stringify(data, null, 2),
  );
})();
