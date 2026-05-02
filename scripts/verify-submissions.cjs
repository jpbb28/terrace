// Verify pending submissions against Google Places API.
// Reads scripts/submissions-input.json, queries Places searchText for each,
// and writes scripts/submissions-verified.json with merged + flagged data.
//
// For each submission:
//   - placeId, lat, lng, googleRating, googleReviewCount, hours -> Google
//   - terraceType, capacity, covered, dogFriendly, heated, instagram -> submitter
//   - description -> submitter (trusted as user's intent)
//   - website -> Google's official, fall back to submitter's
//   - name, address -> Google's canonical (flagged if street # differs from submitter)
//
// Outputs a "needs review" flag for any street-number mismatch or no-result.
const fs = require("fs");
const path = require("path");
const env = fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf-8");
for (const line of env.split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}
const GOOGLE_KEY =
  process.env.GOOGLE_PLACES_API_KEY_UNRESTRICTED ||
  process.env.GOOGLE_PLACES_API_KEY;

const ROOT = path.resolve(__dirname, "..");
const INPUT = path.join(ROOT, "scripts", "submissions-input.json");
const OUTPUT = path.join(ROOT, "scripts", "submissions-verified.json");

async function searchPlace(name, address) {
  const url = "https://places.googleapis.com/v1/places:searchText";
  const body = {
    textQuery: `${name} ${address} Montreal`,
    locationBias: {
      circle: {
        center: { latitude: 45.5019, longitude: -73.5674 },
        radius: 30000,
      },
    },
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_KEY,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.websiteUri,places.regularOpeningHours,places.types",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return json.places?.[0] || null;
}

function googlePeriodsToOurFormat(google) {
  if (!google?.regularOpeningHours?.periods) return null;
  return google.regularOpeningHours.periods.map((p) => {
    const open = `${String(p.open.hour).padStart(2, "0")}:${String(p.open.minute || 0).padStart(2, "0")}`;
    const close = p.close
      ? `${String(p.close.hour).padStart(2, "0")}:${String(p.close.minute || 0).padStart(2, "0")}`
      : "00:00";
    const is24h =
      !p.close ||
      (p.open.hour === 0 &&
        p.open.minute === 0 &&
        p.close.hour === 0 &&
        p.close.minute === 0);
    return is24h
      ? { day: p.open.day, open, close, is24h: true }
      : { day: p.open.day, open, close };
  });
}

function streetNumber(addr) {
  return (addr?.match(/^\d+/) || [""])[0];
}

const toMin = (s) => {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
};

// Cap any post-midnight close (overnight that ends past 00:00) to "23:30".
// Mirrors scripts/cap-terrace-hours.cjs.
function capPeriods(periods) {
  if (!periods) return periods;
  let capped = false;
  const out = periods.map((p) => {
    if (p.is24h) return p;
    if (p.close === "00:00") return p;
    if (toMin(p.close) >= toMin(p.open)) return p;
    capped = true;
    return { day: p.day, open: p.open, close: "23:30" };
  });
  return { periods: out, capped };
}

// Build the recommended opening_periods to write into terraces.ts.
// Rule: trust Google's structure (split shifts, day-by-day variance), cap to
// terrace-bylaw hours, then, for any day where the submitter's last close is
// earlier than Google's last close, use the submitter's earlier close instead.
function mergePeriods(googlePeriods, submitterPeriods) {
  const flags = [];
  let basePeriods = googlePeriods;
  if (!basePeriods?.length) {
    if (submitterPeriods?.length) {
      flags.push("hours_from_submitter_only");
      const r = capPeriods(submitterPeriods);
      if (r.capped) flags.push("hours_capped");
      return { periods: r.periods, flags };
    }
    return { periods: null, flags };
  }
  const { periods: capped, capped: didCap } = capPeriods(basePeriods);
  if (didCap) flags.push("hours_capped");
  if (!submitterPeriods?.length) return { periods: capped, flags };

  // For each day, compare last-close between capped Google and submitter.
  // If submitter has an earlier last-close on that day, apply it as a uniform
  // close-cap for that day's periods (preserves split shifts whose first
  // close is earlier than submitter's anyway).
  const subLastCloseByDay = {};
  for (const p of submitterPeriods) {
    const m = toMin(p.close === "00:00" ? "24:00" : p.close);
    if (!(p.day in subLastCloseByDay) || m > subLastCloseByDay[p.day]) {
      subLastCloseByDay[p.day] = m;
    }
  }
  const out = capped.map((p) => {
    const subLast = subLastCloseByDay[p.day];
    if (subLast === undefined) return p;
    const gMin = toMin(p.close === "00:00" ? "24:00" : p.close);
    if (subLast < gMin) {
      flags.push(`submitter_earlier_day_${p.day}`);
      const subClose =
        subLast === 24 * 60
          ? "00:00"
          : `${String(Math.floor(subLast / 60)).padStart(2, "0")}:${String(subLast % 60).padStart(2, "0")}`;
      return { day: p.day, open: p.open, close: subClose };
    }
    return p;
  });
  return { periods: out, flags };
}

(async () => {
  const submissions = JSON.parse(fs.readFileSync(INPUT, "utf-8"));
  const results = [];

  for (const sub of submissions) {
    process.stdout.write(`[${sub.idx}] ${sub.name} ... `);
    const place = await searchPlace(sub.name, sub.address);
    if (!place) {
      console.log("NO MATCH");
      results.push({ submission: sub, google: null, flags: ["no_match"] });
      continue;
    }
    const flags = [];
    const subNum = streetNumber(sub.address);
    const gNum = streetNumber(place.formattedAddress);
    if (subNum && gNum && subNum !== gNum) flags.push("street_number_mismatch");

    const periodsFromGoogle = googlePeriodsToOurFormat(place);
    const periodsFromSubmitter = sub.opening_periods
      ? JSON.parse(sub.opening_periods)
      : null;
    const merged = mergePeriods(periodsFromGoogle, periodsFromSubmitter);
    flags.push(...merged.flags);

    results.push({
      submission: {
        idx: sub.idx,
        name: sub.name,
        address: sub.address,
        neighborhood: sub.neighborhood,
        terrace_type: sub.terrace_type ? JSON.parse(sub.terrace_type) : null,
        cuisine_type: sub.cuisine_type,
        capacity: sub.capacity,
        covered: sub.covered,
        dog_friendly: sub.dog_friendly,
        heated: sub.heated,
        website: sub.website,
        instagram: sub.instagram,
        description: sub.description,
        opening_periods: periodsFromSubmitter,
        photos: sub.photos,
      },
      google: {
        placeId: place.id,
        displayName: place.displayName?.text,
        formattedAddress: place.formattedAddress,
        lat: place.location.latitude,
        lng: place.location.longitude,
        rating: place.rating,
        userRatingCount: place.userRatingCount,
        website: place.websiteUri,
        types: place.types,
        opening_periods: periodsFromGoogle,
      },
      recommended_opening_periods: merged.periods,
      flags,
    });
    console.log(
      `OK  pid=${place.id}  ${flags.length ? "FLAGS=" + flags.join(",") : ""}`,
    );
    await new Promise((r) => setTimeout(r, 200));
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(results, null, 2));
  console.log(`\nWrote ${results.length} verified entries to ${OUTPUT}`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
