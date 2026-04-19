const ADMIN_EMAIL = "hello@terrasseseason.com";

function toHtml(markdown: string): string {
  return markdown
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");
}

function toSubject(markdown: string): string {
  const firstLine = markdown.split("\n")[0];
  return firstLine.replace(/\*\*/g, "").trim();
}

export async function notify(message: string): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  const resendKey = process.env.RESEND_API_KEY;

  await Promise.all([
    webhookUrl
      ? fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: message }),
        })
      : Promise.resolve(),

    resendKey
      ? fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: ADMIN_EMAIL,
            to: [ADMIN_EMAIL],
            subject: toSubject(message),
            html: `<p style="font-family:sans-serif;line-height:1.6">${toHtml(message)}</p>`,
          }),
        })
      : Promise.resolve(),
  ]);
}
