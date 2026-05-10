import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { notify } from "@/lib/notify";
import { sendBotMessage } from "@/lib/discord";
import { terraces } from "@/data/terraces";

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
  const { terraceId, openingDate, closingDate, submitterEmail, submitterId } =
    await req.json();

  if (
    !terraceId ||
    typeof terraceId !== "string" ||
    !openingDate ||
    typeof openingDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(openingDate) ||
    (closingDate &&
      (typeof closingDate !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(closingDate))) ||
    (submitterEmail !== undefined &&
      submitterEmail !== null &&
      typeof submitterEmail !== "string") ||
    (submitterId !== undefined &&
      submitterId !== null &&
      typeof submitterId !== "string")
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Always a fresh row in the queue. The canonical /open data isn't touched
  // until the admin approves via Discord.
  const terraceName =
    terraces.find((t) => t.id === terraceId)?.name ?? terraceId;

  const { data: submission, error: insertError } = await supabase
    .from("terrace_season_date_submissions")
    .insert({
      terrace_id: terraceId,
      terrace_name: terraceName,
      opening_date: openingDate,
      closing_date: closingDate || null,
      submitter_email: submitterEmail || null,
      submitter_id: submitterId || null,
    })
    .select("id, undo_token")
    .single();

  if (insertError || !submission) {
    logError("POST /api/season-dates insert", insertError, { terraceId });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  // Look up anything that might conflict with this new submission so the
  // Discord approval message can flag it for the admin.
  const [canonicalRes, otherPendingRes] = await Promise.all([
    supabase
      .from("terrace_season_dates")
      .select("opening_date, closing_date, updated_at")
      .eq("terrace_id", terraceId)
      .maybeSingle(),
    supabase
      .from("terrace_season_date_submissions")
      .select(
        "id, opening_date, closing_date, submitter_id, submitter_email, created_at",
      )
      .eq("terrace_id", terraceId)
      .eq("status", "pending")
      .neq("id", submission.id)
      .order("created_at", { ascending: false }),
  ]);

  const canonical = canonicalRes.data;
  const otherPending = otherPendingRes.data ?? [];

  const submitterTag = submitterId
    ? `\`${submitterId.slice(0, 8)}\``
    : "anonymous";

  const lines = [
    `**Opening date pending approval**`,
    `**Terrace:** ${terraceName}`,
    `**Opens:** ${openingDate}`,
  ];
  if (closingDate) lines.push(`**Closes:** ${closingDate}`);
  lines.push(
    `**Submitter:** ${submitterTag}` +
      (submitterEmail ? ` — ${submitterEmail}` : ""),
  );

  const warnings: string[] = [];
  if (canonical) {
    if (
      canonical.opening_date !== openingDate ||
      (canonical.closing_date ?? null) !== (closingDate || null)
    ) {
      warnings.push(
        `⚠️ **Currently live:** opens ${canonical.opening_date}` +
          (canonical.closing_date ? `, closes ${canonical.closing_date}` : ""),
      );
    } else {
      warnings.push(`ℹ️ Same as currently live — approving is a no-op.`);
    }
  }
  for (const p of otherPending) {
    const samePerson =
      p.submitter_id && submitterId && p.submitter_id === submitterId;
    const tag = samePerson
      ? "same submitter"
      : p.submitter_id
        ? `different submitter \`${p.submitter_id.slice(0, 8)}\``
        : "different submitter";
    warnings.push(`⚠️ **Other pending:** opens ${p.opening_date} from ${tag}`);
  }
  const body =
    lines.join("\n") + (warnings.length ? `\n\n${warnings.join("\n")}` : "");

  // Try the bot first (it carries the action buttons). If that succeeds, fall
  // back to email-only via notify() so we don't post a duplicate plain-text
  // message via the legacy webhook. If the bot fails (env vars missing, bot
  // not in channel, etc.), notify() still posts via the webhook so the admin
  // at least sees something — they can then check Vercel logs to fix the bot.
  const messageId = await sendBotMessage({
    content: body,
    components: [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 3, // SUCCESS / green
            label: "Approve",
            custom_id: `approve_seasondatesub_${submission.id}`,
            emoji: { name: "✅" },
          },
          {
            type: 2,
            style: 4, // DANGER / red
            label: "Reject",
            custom_id: `reject_seasondatesub_${submission.id}`,
            emoji: { name: "❌" },
          },
        ],
      },
    ],
  });

  await notify(body, { skipWebhook: messageId !== null });

  if (messageId) {
    await supabase
      .from("terrace_season_date_submissions")
      .update({ discord_message_id: messageId })
      .eq("id", submission.id);
  }

  return NextResponse.json({
    ok: true,
    token: submission.undo_token,
    submissionId: submission.id,
  });
}

export async function DELETE(req: NextRequest) {
  // Submitter undo. The token alone identifies the submission row; we keep
  // terraceId in the URL only so the original GET/POST/DELETE shape stays
  // similar (and so localStorage records can pair them).
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { data: submission, error: fetchError } = await supabase
    .from("terrace_season_date_submissions")
    .select("id, terrace_id, status")
    .eq("undo_token", token)
    .maybeSingle();

  if (fetchError) {
    logError("DELETE /api/season-dates fetch", fetchError, {});
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  if (!submission) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (submission.status === "withdrawn") {
    // Idempotent: re-clicking undo is fine.
    return NextResponse.json({ ok: true });
  }

  const { error: updateError } = await supabase
    .from("terrace_season_date_submissions")
    .update({
      status: "withdrawn",
      decided_at: new Date().toISOString(),
      decided_by: "submitter",
    })
    .eq("id", submission.id);

  if (updateError) {
    logError("DELETE /api/season-dates withdraw", updateError, {
      submissionId: submission.id,
    });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  // If this submission was the one driving the live canonical row, recompute:
  // pick the next-most-recent approved submission for the same terrace, or
  // remove canonical entirely if there's nothing left to fall back on.
  if (submission.status === "approved") {
    const { data: nextApproved } = await supabase
      .from("terrace_season_date_submissions")
      .select("opening_date, closing_date, decided_at")
      .eq("terrace_id", submission.terrace_id)
      .eq("status", "approved")
      .order("decided_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (nextApproved) {
      await supabase.from("terrace_season_dates").upsert(
        {
          terrace_id: submission.terrace_id,
          terrace_name:
            terraces.find((t) => t.id === submission.terrace_id)?.name ??
            submission.terrace_id,
          opening_date: nextApproved.opening_date,
          closing_date: nextApproved.closing_date,
          updated_at: nextApproved.decided_at ?? new Date().toISOString(),
        },
        { onConflict: "terrace_id" },
      );
    } else {
      await supabase
        .from("terrace_season_dates")
        .delete()
        .eq("terrace_id", submission.terrace_id);
    }
  }

  return NextResponse.json({ ok: true });
}
