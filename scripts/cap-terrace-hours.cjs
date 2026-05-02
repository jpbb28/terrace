// Cap any post-midnight close times to "23:30" — Montreal terrace hour rules.
// A period is "post-midnight" when:
//   close < open  AND  close != "00:00"
// (close == "00:00" means closes exactly at midnight, which is allowed.)
// Applies to every `{ day: N, open: "HH:MM", close: "HH:MM" }` line in terraces.ts.
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "src", "data", "terraces.ts");
const src = fs.readFileSync(FILE, "utf-8");

const periodRe =
  /\{\s*day:\s*(\d),\s*open:\s*"(\d{2}:\d{2})",\s*close:\s*"(\d{2}:\d{2})"(\s*,\s*is24h:\s*true)?\s*\}/g;

const toMin = (s) => {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
};

let changed = 0;
const out = src.replace(periodRe, (m, day, open, close, is24h) => {
  if (is24h) return m;
  if (close === "00:00") return m;
  const openMin = toMin(open);
  const closeMin = toMin(close);
  if (closeMin >= openMin) return m;
  changed++;
  return `{ day: ${day}, open: "${open}", close: "23:30" }`;
});

fs.writeFileSync(FILE, out);
console.log(`Capped ${changed} period(s) to 23:30`);
