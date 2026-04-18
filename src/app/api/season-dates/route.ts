import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

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

  const { error } = await supabase.from("terrace_season_dates").upsert(
    {
      terrace_id: terraceId,
      opening_date: openingDate,
      closing_date: closingDate || null,
      submitter_email: submitterEmail || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "terrace_id" },
  );

  if (error) {
    logError("POST /api/season-dates", error, { terraceId });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
