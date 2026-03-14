import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ terraceId: string }> }
) {
  const { terraceId } = await params;

  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, text, created_at")
    .eq("terrace_id", terraceId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const avg =
    data.length > 0
      ? data.reduce((sum, r) => sum + r.rating, 0) / data.length
      : null;

  return NextResponse.json({ reviews: data, avg, count: data.length });
}
