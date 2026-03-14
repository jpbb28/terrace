import { Terrace } from "./types";
import { Lang } from "./i18n";

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

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
const DAY_NAMES_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const FULL_DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const FULL_DAY_NAMES_FR = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

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
export function getHoursStatus(terrace: Terrace, lang: Lang = "en"): HoursStatus | null {
  const periods = terrace.openingPeriods;
  if (!periods?.length) return null;

  const closedStr = lang === "fr" ? "Fermé" : "Closed";
  const open24hStr = lang === "fr" ? "Ouvert 24h/24" : "Open 24 hours";
  const closesStr = lang === "fr" ? "Ferme à" : "Closes";
  const opensStr = lang === "fr" ? "Ouvre à" : "Opens";
  const dayNames = lang === "fr" ? DAY_NAMES_FR : DAY_NAMES;

  if (periods.some((p) => p.is24h)) {
    return { open: true, qualifier: "", todayHours: open24hStr };
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
      : closedStr;

  // Check if currently open and find the active close time
  for (const p of periods) {
    const [oh, om] = p.open.split(":").map(Number);
    const [ch, cm] = p.close.split(":").map(Number);
    const openMin = oh * 60 + om;
    const closeMin = ch * 60 + cm;
    const overnight = closeMin < openMin;

    if (p.day === todayDay) {
      if (!overnight && nowMin >= openMin && nowMin < closeMin) {
        return { open: true, qualifier: `${closesStr} ${fmtMin(closeMin)}`, todayHours };
      }
      if (overnight && nowMin >= openMin) {
        return { open: true, qualifier: `${closesStr} ${fmtMin(closeMin)}`, todayHours };
      }
    }
    if (p.day === yesterdayDay && overnight && nowMin < closeMin) {
      return { open: true, qualifier: `${closesStr} ${fmtMin(closeMin)}`, todayHours };
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
    return { open: false, qualifier: `${opensStr} ${fmt(sortedLaterToday[0].open)}`, todayHours };
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
      const dayLabel = i === 1 ? "" : ` ${dayNames[nextDay]}`;
      return { open: false, qualifier: `${opensStr} ${fmt(nextPeriods[0].open)}${dayLabel}`, todayHours };
    }
  }

  return { open: false, qualifier: "", todayHours };
}

/**
 * Returns the full week schedule as an array, with today flagged.
 */
export function getDaysSchedule(
  periods: Terrace["openingPeriods"],
  lang: Lang = "en"
): { dayName: string; hours: string; isToday: boolean; isClosed: boolean }[] {
  if (!periods?.length) return [];

  const closedStr = lang === "fr" ? "Fermé" : "Closed";
  const open24hStr = lang === "fr" ? "Ouvert 24h/24" : "Open 24 hours";
  const fullDayNames = lang === "fr" ? FULL_DAY_NAMES_FR : FULL_DAY_NAMES;

  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Toronto" })
  );
  const todayDay = now.getDay();

  if (periods.some((p) => p.is24h)) {
    return fullDayNames.map((name, i) => ({
      dayName: name,
      hours: open24hStr,
      isToday: i === todayDay,
      isClosed: false,
    }));
  }

  const byDay: Record<number, { open: string; close: string }[]> = {};
  for (const p of periods) {
    if (!byDay[p.day]) byDay[p.day] = [];
    byDay[p.day].push(p);
  }

  return fullDayNames.map((name, i) => {
    const dayPeriods = byDay[i] ?? [];
    const isClosed = dayPeriods.length === 0;
    const hours = isClosed
      ? closedStr
      : dayPeriods.map((p) => `${fmt(p.open)} – ${fmt(p.close)}`).join(", ");
    return { dayName: name, hours, isToday: i === todayDay, isClosed };
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
