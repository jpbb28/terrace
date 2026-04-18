import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/ratelimit";
import { logError } from "@/lib/logger";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

export async function GET() {
  const today = new Date().toISOString().split("T")[0];
  const crowdsourceCutoff = new Date();
  crowdsourceCutoff.setDate(crowdsourceCutoff.getDate() - 21);
  const cutoffStr = crowdsourceCutoff.toISOString().split("T")[0];

  const [seasonRes, crowdsourceRes] = await Promise.all([
    supabase
      .from("terrace_season_dates")
      .select("terrace_id, opening_date, closing_date, updated_at"),
    supabase
      .from("terrace_open_reports")
      .select("terrace_id, opening_date, reported_at")
      .gte("opening_date", cutoffStr)
      .order("reported_at", { ascending: false }),
  ]);

  if (seasonRes.error) {
    logError("GET /api/open-reports (season)", seasonRes.error, {});
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  // Official season dates keyed by terrace_id
  const official = new Map<
    string,
    { opening_date: string; closing_date: string | null; updated_at: string }
  >();
  for (const row of seasonRes.data ?? []) {
    official.set(row.terrace_id, {
      opening_date: row.opening_date,
      closing_date: row.closing_date,
      updated_at: row.updated_at,
    });
  }

  // Crowdsource confirmation counts keyed by terrace_id
  const crowdsource = new Map<string, number>();
  for (const row of crowdsourceRes.data ?? []) {
    crowdsource.set(row.terrace_id, (crowdsource.get(row.terrace_id) ?? 0) + 1);
  }

  return NextResponse.json({
    official: Object.fromEntries(official),
    crowdsource: Object.fromEntries(crowdsource),
    today,
  });
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!rateLimit(`open-reports:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { terraceId, openingDate, sessionId } = await req.json();

  if (
    !terraceId ||
    typeof terraceId !== "string" ||
    !openingDate ||
    typeof openingDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(openingDate) ||
    !sessionId ||
    typeof sessionId !== "string" ||
    sessionId.length < 10
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Dedup: same session + terrace within last 7 days
  const dedupCutoff = new Date();
  dedupCutoff.setDate(dedupCutoff.getDate() - 7);
  const { data: existing } = await supabase
    .from("terrace_open_reports")
    .select("id")
    .eq("terrace_id", terraceId)
    .eq("session_id", sessionId)
    .gte("reported_at", dedupCutoff.toISOString())
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const { error } = await supabase.from("terrace_open_reports").insert({
    terrace_id: terraceId,
    opening_date: openingDate,
    session_id: sessionId,
    source: "crowdsource",
  });

  if (error) {
    logError("POST /api/open-reports", error, { terraceId });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
