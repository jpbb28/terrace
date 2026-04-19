import { NextRequest, NextResponse } from "next/server";
import { notify } from "@/lib/notify";

function line(label: string, value: unknown): string {
  if (value === null || value === undefined || value === "" || value === false)
    return "";
  if (Array.isArray(value) && value.length === 0) return "";
  const display = Array.isArray(value) ? value.join(", ") : String(value);
  return `\n**${label}:** ${display}`;
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
    const changedFields = record.changes
      ? Object.keys(record.changes).join(", ")
      : "—";

    message =
      `**New correction — ${record.terrace_name}**` +
      line("Changed fields", changedFields) +
      line("Address", record.address) +
      line("Neighborhood", record.neighborhood) +
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
  } else {
    return NextResponse.json({ ok: true });
  }

  await notify(message);

  return NextResponse.json({ ok: true });
}
