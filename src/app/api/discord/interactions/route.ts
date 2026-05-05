// Discord Interactions endpoint for the opening-date approval flow.
// Configure this URL in the Discord Developer Portal:
//   Application → General Information → Interactions Endpoint URL =
//   https://terrasseseason.com/api/discord/interactions
//
// Discord verifies the URL by sending a signed PING (type 1); we respond with
// `{ type: 1 }`. After verification, button clicks (type 3) flow through here.
//
// Custom ID format: "<action>_seasondatesub_<submission_uuid>".
// Approve flips the submission row to status='approved' and upserts the
// canonical terrace_season_dates row from the submission's data. Reject just
// flips status='rejected'. Either way the original Discord message is edited
// to remove buttons and show the verdict.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logError } from "@/lib/logger";
import { verifyInteractionSignature } from "@/lib/discord";
import { terraces } from "@/data/terraces";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

interface DiscordInteraction {
  type: number;
  data?: { custom_id?: string };
  member?: { user?: { username?: string } };
  user?: { username?: string };
  message?: { content?: string };
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-signature-ed25519");
  const timestamp = req.headers.get("x-signature-timestamp");
  const rawBody = await req.text();

  if (!signature || !timestamp) {
    return new NextResponse("Missing signature", { status: 401 });
  }

  const valid = await verifyInteractionSignature(signature, timestamp, rawBody);
  if (!valid) {
    return new NextResponse("Bad signature", { status: 401 });
  }

  let interaction: DiscordInteraction;
  try {
    interaction = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Bad body", { status: 400 });
  }

  // PING — Discord verifies the endpoint with this on save.
  if (interaction.type === 1) {
    return NextResponse.json({ type: 1 });
  }

  // MESSAGE_COMPONENT (button click)
  if (interaction.type === 3) {
    return handleButton(interaction);
  }

  return NextResponse.json({ error: "Unknown interaction" }, { status: 400 });
}

async function handleButton(interaction: DiscordInteraction) {
  const customId = interaction.data?.custom_id ?? "";
  const actor =
    interaction.member?.user?.username ??
    interaction.user?.username ??
    "unknown";

  const parts = customId.split("_");
  if (parts.length < 3 || parts[1] !== "seasondatesub") {
    return ephemeral(`Unknown button: \`${customId}\``);
  }
  const action = parts[0];
  const submissionId = parts.slice(2).join("_");

  if (action !== "approve" && action !== "reject") {
    return ephemeral(`Unknown action: \`${action}\``);
  }

  // Pull the submission first so we can sanity-check state and (on approve)
  // copy its data to canonical.
  const { data: submission, error: fetchError } = await supabase
    .from("terrace_season_date_submissions")
    .select("id, terrace_id, opening_date, closing_date, status")
    .eq("id", submissionId)
    .maybeSingle();

  if (fetchError) {
    logError("discord/interactions fetch", fetchError, { submissionId });
    return ephemeral(`Database error: ${fetchError.message}`);
  }
  if (!submission) {
    return ephemeral(`Submission not found: \`${submissionId}\``);
  }
  if (submission.status !== "pending") {
    return ephemeral(
      `Already ${submission.status}. The buttons on the original message should already be gone — refresh Discord.`,
    );
  }

  const decidedAt = new Date().toISOString();
  const newStatus = action === "approve" ? "approved" : "rejected";

  const { error: updateError } = await supabase
    .from("terrace_season_date_submissions")
    .update({
      status: newStatus,
      decided_at: decidedAt,
      decided_by: actor,
    })
    .eq("id", submission.id);

  if (updateError) {
    logError("discord/interactions update", updateError, {
      submissionId,
      action,
    });
    return ephemeral(`Database error: ${updateError.message}`);
  }

  if (action === "approve") {
    const { error: upsertError } = await supabase
      .from("terrace_season_dates")
      .upsert(
        {
          terrace_id: submission.terrace_id,
          opening_date: submission.opening_date,
          closing_date: submission.closing_date,
          updated_at: decidedAt,
        },
        { onConflict: "terrace_id" },
      );

    if (upsertError) {
      logError("discord/interactions canonical upsert", upsertError, {
        submissionId,
      });
      return ephemeral(
        `Approved but failed to publish: ${upsertError.message}`,
      );
    }
  }

  const terraceName =
    terraces.find((t) => t.id === submission.terrace_id)?.name ??
    submission.terrace_id;
  const verb = action === "approve" ? "Approved" : "Rejected";
  const icon = action === "approve" ? "✅" : "❌";
  const stamp = decidedAt.replace("T", " ").slice(0, 16);
  const original = interaction.message?.content ?? "";
  const updatedContent = `${original}\n\n${icon} **${verb}** by ${actor} — ${terraceName} _(${stamp} UTC)_`;

  // Type 7 = UPDATE_MESSAGE: Discord replaces the original message with this.
  return NextResponse.json({
    type: 7,
    data: {
      content: updatedContent,
      components: [],
    },
  });
}

function ephemeral(message: string) {
  return NextResponse.json({
    type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
    data: { content: message, flags: 64 }, // 64 = EPHEMERAL (only visible to clicker)
  });
}
