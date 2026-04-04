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

  const [pageResult, aggResult] = await Promise.all([
    supabase
      .from("reviews")
      .select("id, rating, text, created_at")
      .eq("terrace_id", terraceId)
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1),
    supabase.from("reviews").select("rating").eq("terrace_id", terraceId),
  ]);

  if (pageResult.error) {
    logError("GET /api/reviews/[terraceId]", pageResult.error, { terraceId });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
  if (aggResult.error) {
    logError("GET /api/reviews/[terraceId] agg", aggResult.error, {
      terraceId,
    });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const allRatings = aggResult.data;
  const totalCount = allRatings.length;
  const avg =
    totalCount > 0
      ? allRatings.reduce((sum, r) => sum + r.rating, 0) / totalCount
      : null;

  return NextResponse.json({
    reviews: pageResult.data,
    avg,
    count: totalCount,
    page,
    hasMore: pageResult.data.length === PAGE_SIZE,
  });
}
