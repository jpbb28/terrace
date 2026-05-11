import { NextRequest, NextResponse } from "next/server";
import { notify } from "@/lib/notify";

function line(label: string, value: unknown): string {
  if (value === null || value === undefined || value === "" || value === false)
    return "";
  if (Array.isArray(value) && value.length === 0) return "";
  const display = Array.isArray(value) ? value.join(", ") : String(value);
  return `\n**${label}:** ${display}`;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface HourPeriodLike {
  day: number;
  open: string;
  close: string;
}

function isHourPeriodArray(v: unknown): v is HourPeriodLike[] {
  return (
    Array.isArray(v) &&
    v.every(
      (p) =>
        p &&
        typeof p === "object" &&
        typeof (p as HourPeriodLike).day === "number" &&
        typeof (p as HourPeriodLike).open === "string" &&
        typeof (p as HourPeriodLike).close === "string",
    )
  );
}

function formatHours(periods: HourPeriodLike[]): string {
  if (!periods.length) return "(closed)";
  return periods
    .map((p) => `• ${DAY_NAMES[p.day] ?? `Day ${p.day}`} ${p.open}–${p.close}`)
    .join("\n");
}

function formatValue(field: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "(empty)";
  if (field === "openingPeriods" && isHourPeriodArray(value)) {
    return formatHours(value);
  }
  if (field === "photos" && Array.isArray(value)) {
    return value.length === 0 ? "(none)" : `${value.length} photo(s)`;
  }
  if (Array.isArray(value)) return value.length ? value.join(", ") : "(empty)";
  if (typeof value === "boolean") return value ? "yes" : "no";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function formatChange(
  field: string,
  diff: { from: unknown; to: unknown },
): string {
  const fromStr = formatValue(field, diff.from);
  const toStr = formatValue(field, diff.to);
  if (fromStr.includes("\n") || toStr.includes("\n")) {
    return `**${field}** was:\n${fromStr}\n\n**${field}** now:\n${toStr}`;
  }
  return `**${field}:** ${fromStr} → ${toStr}`;
}

export async function POST(req: NextRequest) {
  const { type, table, record } = await req.json();

  if (type !== "INSERT") return NextResponse.json({ ok: true });

  let message: string;

  if (table === "submissions") {
    const flags = [
      record.covered && "covered",
      record.dog_friendly && "dog-friendly",
      record.heated && "heated",
    ]
      .filter(Boolean)
      .join(", ");

    message =
      `**New terrace submission**` +
      line("Name", record.name) +
      line("Address", record.address) +
      line("Neighborhood", record.neighborhood) +
      line("Type", record.terrace_type) +
      line("Cuisine", record.cuisine_type) +
      line("Capacity", record.capacity) +
      (flags ? `\n**Features:** ${flags}` : "") +
      line("Season open", record.seasonal_open) +
      line("Season close", record.seasonal_close) +
      line("Website", record.website) +
      line("Instagram", record.instagram) +
      line("Phone", record.phone) +
      line("Description", record.description) +
      line(
        "Photos",
        record.photos?.length ? `${record.photos.length} uploaded` : null,
      ) +
      line(
        "From",
        [record.submitter_name, record.submitter_email, record.submitter_role]
          .filter(Boolean)
          .join(" — "),
      );
  } else if (table === "corrections") {
    const changes = (record.changes ?? {}) as Record<
      string,
      { from: unknown; to: unknown }
    >;
    const changeBlocks = Object.entries(changes).map(([field, diff]) =>
      formatChange(field, diff),
    );

    message =
      `**New correction — ${record.terrace_name}**\n\n` +
      (changeBlocks.length
        ? changeBlocks.join("\n\n")
        : "_(no field-level diff was recorded)_") +
      line(
        "From",
        [record.submitter_name, record.submitter_email, record.submitter_role]
          .filter(Boolean)
          .join(" — "),
      );
  } else {
    return NextResponse.json({ ok: true });
  }

  await notify(message);

  return NextResponse.json({ ok: true });
}
