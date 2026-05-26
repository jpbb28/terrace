import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { rateLimit } from "@/lib/ratelimit";
import { logError } from "@/lib/logger";
import { terraces } from "@/data/terraces";

const MAX_IDS = 50;
const MAX_TITLE = 80;
const SLUG_LEN = 7;
const SLUG_ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const validIds = new Set(terraces.map((t) => t.id));

function makeSlug(): string {
  const bytes = randomBytes(SLUG_LEN);
  let s = "";
  for (let i = 0; i < SLUG_LEN; i++) {
    s += SLUG_ALPHABET[bytes[i] % SLUG_ALPHABET.length];
  }
  return s;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!rateLimit(`lists:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { ids, title } = (body ?? {}) as { ids?: unknown; title?: unknown };

  if (!Array.isArray(ids)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Keep only known terrace ids, de-duped, preserving order.
  const cleanIds = Array.from(
    new Set(ids.filter((x): x is string => typeof x === "string")),
  ).filter((id) => validIds.has(id));

  if (cleanIds.length === 0) {
    return NextResponse.json({ error: "No valid terraces" }, { status: 400 });
  }
  if (cleanIds.length > MAX_IDS) {
    return NextResponse.json({ error: "Too many terraces" }, { status: 400 });
  }

  const cleanTitle =
    typeof title === "string" && title.trim()
      ? title.trim().slice(0, MAX_TITLE)
      : null;

  // Insert with a fresh slug, retrying on the rare PK collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = makeSlug();
    const { error } = await supabaseAdmin
      .from("shared_lists")
      .insert({ slug, terrace_ids: cleanIds, title: cleanTitle });

    if (!error) {
      return NextResponse.json({ slug });
    }
    if (error.code === "23505") {
      continue; // slug collision — try another
    }
    logError("POST /api/lists", error, { count: cleanIds.length });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  logError("POST /api/lists", "slug collision retries exhausted");
  return NextResponse.json({ error: "Server error" }, { status: 500 });
}
