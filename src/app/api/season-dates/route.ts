import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { terraces } from "@/data/terraces";

async function notifyDiscord(message: string) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: message }),
  });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const terraceId = searchParams.get("terraceId");

  if (!terraceId) {
    return NextResponse.json({ error: "Missing terraceId" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("terrace_season_dates")
    .select("opening_date, closing_date")
    .eq("terrace_id", terraceId)
    .maybeSingle();

  if (error) {
    logError("GET /api/season-dates", error, { terraceId });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? null });
}

export async function POST(req: NextRequest) {
  const { terraceId, openingDate, closingDate, submitterEmail } =
    await req.json();

  if (
    !terraceId ||
    typeof terraceId !== "string" ||
    !openingDate ||
    typeof openingDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(openingDate) ||
    (closingDate &&
      (typeof closingDate !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(closingDate)))
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const token = crypto.randomUUID();

  const { error } = await supabase.from("terrace_season_dates").upsert(
    {
      terrace_id: terraceId,
      opening_date: openingDate,
      closing_date: closingDate || null,
      submitter_email: submitterEmail || null,
      updated_at: new Date().toISOString(),
      undo_token: token,
    },
    { onConflict: "terrace_id" },
  );

  if (error) {
    logError("POST /api/season-dates", error, { terraceId });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const terraceName =
    terraces.find((t) => t.id === terraceId)?.name ?? terraceId;
  const msg =
    `**Opening date reported**\n**Terrace:** ${terraceName}\n**Opens:** ${openingDate}` +
    (closingDate ? `\n**Closes:** ${closingDate}` : "") +
    (submitterEmail ? `\n**From:** ${submitterEmail}` : "");
  await notifyDiscord(msg);

  return NextResponse.json({ ok: true, token });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const terraceId = searchParams.get("terraceId");
  const token = searchParams.get("token");

  if (
    !terraceId ||
    typeof terraceId !== "string" ||
    !token ||
    typeof token !== "string"
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { data: row, error: fetchError } = await supabase
    .from("terrace_season_dates")
    .select("undo_token")
    .eq("terrace_id", terraceId)
    .maybeSingle();

  if (fetchError) {
    logError("DELETE /api/season-dates fetch", fetchError, { terraceId });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  if (!row || row.undo_token !== token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { error } = await supabase
    .from("terrace_season_dates")
    .delete()
    .eq("terrace_id", terraceId);

  if (error) {
    logError("DELETE /api/season-dates", error, { terraceId });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
