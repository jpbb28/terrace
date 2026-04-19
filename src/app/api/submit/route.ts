import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("[submit webhook] payload:", JSON.stringify(body));

  const { type, table, record } = body;

  if (type !== "INSERT") {
    console.log("[submit webhook] skipping, type =", type);
    return NextResponse.json({ ok: true });
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log("[submit webhook] DISCORD_WEBHOOK_URL not set");
    return NextResponse.json({ ok: true });
  }

  let message: string;

  if (table === "submissions") {
    const who = [record.submitter_name, record.submitter_email]
      .filter(Boolean)
      .join(" — ");
    message = `**New terrace submission**\n**Name:** ${record.name}\n**Neighborhood:** ${record.neighborhood ?? "—"}\n**Address:** ${record.address}${who ? `\n**From:** ${who}` : ""}`;
  } else if (table === "corrections") {
    const changedFields = record.changes
      ? Object.keys(record.changes).join(", ")
      : "—";
    const who = [record.submitter_name, record.submitter_email]
      .filter(Boolean)
      .join(" — ");
    message = `**New correction**\n**Terrace:** ${record.terrace_name}\n**Changed:** ${changedFields}${who ? `\n**From:** ${who}` : ""}`;
  } else {
    return NextResponse.json({ ok: true });
  }

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: message }),
  });

  return NextResponse.json({ ok: true });
}
