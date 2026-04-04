import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/ratelimit";
import { logError } from "@/lib/logger";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const PAGE_SIZE = 50;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ terraceId: string }> },
) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!rateLimit(`reviews-get:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { terraceId } = await params;
  const { searchParams } = new URL(req.url);
  const page = Math.max(0, parseInt(searchParams.get("page") ?? "0", 10));

  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, text, created_at")
    .eq("terrace_id", terraceId)
    .order("created_at", { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  if (error) {
    logError("GET /api/reviews/[terraceId]", error, { terraceId });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const avg =
    data.length > 0
      ? data.reduce((sum, r) => sum + r.rating, 0) / data.length
      : null;

  return NextResponse.json({
    reviews: data,
    avg,
    count: data.length,
    page,
    hasMore: data.length === PAGE_SIZE,
  });
}
