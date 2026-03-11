import { Terrace } from "./types";

/**
 * Returns true if the terrace is currently open, false if closed,
 * or null if no structured hours data is available.
 * Uses Montreal timezone (America/Toronto).
 */
export function isOpenNow(terrace: Terrace): boolean | null {
  if (!terrace.openingPeriods?.length) return null;

  // Get current local time in Montreal
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Toronto" })
  );
  const todayDay = now.getDay(); // 0=Sun … 6=Sat
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const yesterdayDay = (todayDay + 6) % 7;

  for (const p of terrace.openingPeriods) {
    // 24/7 — always open
    if (p.is24h) return true;

    const [oh, om] = p.open.split(":").map(Number);
    const [ch, cm] = p.close.split(":").map(Number);
    const openMin = oh * 60 + om;
    const closeMin = ch * 60 + cm;
    const overnight = closeMin < openMin; // crosses midnight (strict less-than)

    if (p.day === todayDay) {
      if (!overnight) {
        if (nowMin >= openMin && nowMin < closeMin) return true;
      } else {
        // Open tonight, closes tomorrow morning — are we in the evening portion?
        if (nowMin >= openMin) return true;
      }
    }

    // Check if an overnight period from yesterday extends into now
    if (p.day === yesterdayDay && overnight) {
      if (nowMin < closeMin) return true;
    }
  }

  return false;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function fmt(t: string) {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour} ${suffix}` : `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

function fmtMin(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return fmt(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
}

interface HoursStatus {
  open: boolean;
  qualifier: string; // "Closes 10 PM" | "Opens 5 PM" | "Opens 11 AM Thu" | ""
  todayHours: string; // "11 AM – 10 PM" | "Closed" | "Open 24 hours"
}

/**
 * Returns Google Maps-style status: open/closed, qualifier text, and today's hours.
 */
export function getHoursStatus(terrace: Terrace): HoursStatus | null {
  const periods = terrace.openingPeriods;
  if (!periods?.length) return null;

  if (periods.some((p) => p.is24h)) {
    return { open: true, qualifier: "", todayHours: "Open 24 hours" };
  }

  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Toronto" })
  );
  const todayDay = now.getDay();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const yesterdayDay = (todayDay + 6) % 7;

  const todayPeriods = periods.filter((p) => p.day === todayDay);
  const todayHours =
    todayPeriods.length > 0
      ? todayPeriods.map((p) => `${fmt(p.open)} – ${fmt(p.close)}`).join(", ")
      : "Closed";

  // Check if currently open and find the active close time
  for (const p of periods) {
    const [oh, om] = p.open.split(":").map(Number);
    const [ch, cm] = p.close.split(":").map(Number);
    const openMin = oh * 60 + om;
    const closeMin = ch * 60 + cm;
    const overnight = closeMin < openMin;

    if (p.day === todayDay) {
      if (!overnight && nowMin >= openMin && nowMin < closeMin) {
        return { open: true, qualifier: `Closes ${fmtMin(closeMin)}`, todayHours };
      }
      if (overnight && nowMin >= openMin) {
        return { open: true, qualifier: `Closes ${fmtMin(closeMin)}`, todayHours };
      }
    }
    if (p.day === yesterdayDay && overnight && nowMin < closeMin) {
      return { open: true, qualifier: `Closes ${fmtMin(closeMin)}`, todayHours };
    }
  }

  // Closed — find next opening time
  const sortedLaterToday = todayPeriods
    .filter((p) => {
      const [oh, om] = p.open.split(":").map(Number);
      return oh * 60 + om > nowMin;
    })
    .sort((a, b) => {
      const [ah, am] = a.open.split(":").map(Number);
      const [bh, bm] = b.open.split(":").map(Number);
      return ah * 60 + am - (bh * 60 + bm);
    });

  if (sortedLaterToday.length > 0) {
    return { open: false, qualifier: `Opens ${fmt(sortedLaterToday[0].open)}`, todayHours };
  }

  for (let i = 1; i <= 7; i++) {
    const nextDay = (todayDay + i) % 7;
    const nextPeriods = periods
      .filter((p) => p.day === nextDay)
      .sort((a, b) => {
        const [ah, am] = a.open.split(":").map(Number);
        const [bh, bm] = b.open.split(":").map(Number);
        return ah * 60 + am - (bh * 60 + bm);
      });
    if (nextPeriods.length > 0) {
      const dayLabel = i === 1 ? "" : ` ${DAY_NAMES[nextDay]}`;
      return { open: false, qualifier: `Opens ${fmt(nextPeriods[0].open)}${dayLabel}`, todayHours };
    }
  }

  return { open: false, qualifier: "", todayHours };
}

/**
 * Returns the full week schedule as an array, with today flagged.
 */
export function getDaysSchedule(
  periods: Terrace["openingPeriods"]
): { dayName: string; hours: string; isToday: boolean }[] {
  if (!periods?.length) return [];

  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Toronto" })
  );
  const todayDay = now.getDay();

  if (periods.some((p) => p.is24h)) {
    return FULL_DAY_NAMES.map((name, i) => ({
      dayName: name,
      hours: "Open 24 hours",
      isToday: i === todayDay,
    }));
  }

  const byDay: Record<number, { open: string; close: string }[]> = {};
  for (const p of periods) {
    if (!byDay[p.day]) byDay[p.day] = [];
    byDay[p.day].push(p);
  }

  return FULL_DAY_NAMES.map((name, i) => {
    const dayPeriods = byDay[i] ?? [];
    const hours =
      dayPeriods.length > 0
        ? dayPeriods.map((p) => `${fmt(p.open)} – ${fmt(p.close)}`).join(", ")
        : "Closed";
    return { dayName: name, hours, isToday: i === todayDay };
  });
}

/**
 * Returns a human-readable summary of opening hours grouped by consecutive
 * same-schedule days, e.g. "Mon–Fri: 5 PM – 11 PM".
 */
export function formatHours(periods: Terrace["openingPeriods"]): string[] {
  if (!periods?.length) return [];

  // If any period is 24/7, short-circuit
  if (periods.some((p) => p.is24h)) return ["Open 24 hours"];

  // Group by schedule string so consecutive days with identical hours merge
  type DayEntry = { day: number; open: string; close: string };
  const byDay: Record<number, DayEntry[]> = {};
  for (const p of periods) {
    if (!byDay[p.day]) byDay[p.day] = [];
    byDay[p.day].push(p);
  }

  // Build ordered list Sun→Sat
  const ordered: { days: number[]; label: string }[] = [];
  for (let d = 0; d <= 6; d++) {
    if (!byDay[d]) continue;
    const label = byDay[d]
      .map((p) => `${fmt(p.open)} – ${fmt(p.close)}`)
      .join(", ");

    const last = ordered[ordered.length - 1];
    if (last && last.label === label && last.days[last.days.length - 1] === d - 1) {
      last.days.push(d);
    } else {
      ordered.push({ days: [d], label });
    }
  }

  return ordered.map(({ days, label }) => {
    const dayStr =
      days.length === 1
        ? DAY_NAMES[days[0]]
        : `${DAY_NAMES[days[0]]}–${DAY_NAMES[days[days.length - 1]]}`;
    return `${dayStr}: ${label}`;
  });
}
