import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { logError } from "@/lib/logger";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

export async function GET() {
  const today = new Date().toISOString().split("T")[0];

  // Canonical table holds only approved live data — submissions queue (and
  // any pending/rejected/withdrawn rows) lives in terrace_season_date_submissions
  // and is not read here.
  const { data, error } = await supabase
    .from("terrace_season_dates")
    .select("terrace_id, opening_date, closing_date, updated_at");

  if (error) {
    logError("GET /api/open-reports", error, {});
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const official: Record<
    string,
    { opening_date: string; closing_date: string | null; updated_at: string }
  > = {};
  for (const row of data ?? []) {
    official[row.terrace_id] = {
      opening_date: row.opening_date,
      closing_date: row.closing_date,
      updated_at: row.updated_at,
    };
  }

  return NextResponse.json({ official, today });
}
