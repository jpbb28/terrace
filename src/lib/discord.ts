// Discord bot API helpers for the approval flow.
// Used by:
//   - /api/season-dates POST → sendApprovalMessage() to post a pending entry with action buttons
//   - /api/discord/interactions POST → verifyInteractionSignature() to authenticate the button click
//
// Required env vars:
//   DISCORD_BOT_TOKEN       — bot user token (Bot Token, NOT a webhook URL)
//   DISCORD_PUBLIC_KEY      — Application Public Key, hex (used to verify Ed25519 signatures)
//   DISCORD_APPROVAL_CHANNEL_ID — channel where approval messages are posted

const DISCORD_API = "https://discord.com/api/v10";

export type ButtonStyle = 1 | 2 | 3 | 4 | 5;

export interface Button {
  type: 2;
  style: ButtonStyle;
  label: string;
  custom_id?: string;
  url?: string;
  emoji?: { name?: string; id?: string };
}

export interface ActionRow {
  type: 1;
  components: Button[];
}

export interface BotMessage {
  content?: string;
  components?: ActionRow[];
}

/** Posts a message via the Bot API. Returns the new message ID, or null on failure. */
export async function sendBotMessage(
  message: BotMessage,
): Promise<string | null> {
  const token = process.env.DISCORD_BOT_TOKEN;
  const channel = process.env.DISCORD_APPROVAL_CHANNEL_ID;
  if (!token || !channel) {
    const missing = [
      !token && "DISCORD_BOT_TOKEN",
      !channel && "DISCORD_APPROVAL_CHANNEL_ID",
    ]
      .filter(Boolean)
      .join(", ");
    console.error(
      JSON.stringify({
        level: "error",
        context: "discord.sendBotMessage",
        message: `Missing env: ${missing}. Bot message not sent.`,
      }),
    );
    return null;
  }

  const res = await fetch(`${DISCORD_API}/channels/${channel}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  if (!res.ok) {
    console.error(
      JSON.stringify({
        level: "error",
        context: "discord.sendBotMessage",
        status: res.status,
        body: await res.text(),
      }),
    );
    return null;
  }

  const data = (await res.json()) as { id?: string };
  return data.id ?? null;
}

/** Verifies an Ed25519 signature on a Discord interaction request. */
export async function verifyInteractionSignature(
  signature: string,
  timestamp: string,
  body: string,
): Promise<boolean> {
  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  if (!publicKey) return false;

  try {
    const sigBytes = hexToBytes(signature);
    const keyBytes = hexToBytes(publicKey);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "Ed25519" },
      false,
      ["verify"],
    );

    const data = new TextEncoder().encode(timestamp + body);
    return await crypto.subtle.verify("Ed25519", cryptoKey, sigBytes, data);
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        context: "discord.verifyInteractionSignature",
        message: error instanceof Error ? error.message : String(error),
      }),
    );
    return false;
  }
}

// Allocates an ArrayBuffer-backed Uint8Array so the result satisfies the
// BufferSource overload that crypto.subtle.{importKey,verify} expect under
// strict TypeScript (which excludes SharedArrayBuffer-backed views).
function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const matches = hex.match(/.{1,2}/g) ?? [];
  const buf = new ArrayBuffer(matches.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < matches.length; i++) {
    view[i] = parseInt(matches[i], 16);
  }
  return view;
}
