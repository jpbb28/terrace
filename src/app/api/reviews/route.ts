import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: NextRequest) {
  const { terraceId, rating, text, token } = await req.json();

  if (
    !terraceId ||
    typeof rating !== "number" ||
    rating < 1 ||
    rating > 5 ||
    typeof token !== "string" ||
    token.length < 10
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { error } = await supabase.from("reviews").insert({
    terrace_id: terraceId,
    rating,
    text: text?.trim() || null,
    token,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "already_reviewed" }, { status: 409 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
