import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/ratelimit";
import { logError } from "@/lib/logger";
import { terraces } from "@/data/terraces";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!rateLimit(`reviews:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { terraceId, rating, text, token } = await req.json();

  if (
    !terraceId ||
    typeof rating !== "number" ||
    rating < 1 ||
    rating > 5 ||
    typeof token !== "string" ||
    token.length < 10 ||
    (text && (typeof text !== "string" || text.length > 500))
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { error } = await supabase.from("reviews").insert({
    terrace_id: terraceId,
    terrace_name: terraces.find((t) => t.id === terraceId)?.name ?? terraceId,
    rating,
    text: text?.trim() || null,
    token,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "already_reviewed" }, { status: 409 });
    }
    logError("POST /api/reviews", error, { terraceId });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
