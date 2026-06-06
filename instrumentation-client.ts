import * as Sentry from "@sentry/nextjs";
import type { ErrorEvent, EventHint } from "@sentry/nextjs";
import posthog from "posthog-js";

// Script origins that aren't our code: browser extensions and other injected
// scripts. Errors thrown from these are noise we can't fix (e.g. the
// `app:///<hash>/script.js` "Invalid or unexpected token" from extension blobs).
const THIRD_PARTY_FRAME =
  /^(chrome|moz|safari|safari-web)-extension:|^webkit-masked-url:|^app:\/\/\/[a-f0-9]+\/script\.js/i;

function isThirdPartyError(event: ErrorEvent): boolean {
  const frames = event.exception?.values?.flatMap(
    (v) => v.stacktrace?.frames ?? [],
  );
  // No frames at all -> can't attribute it, keep it.
  if (!frames || frames.length === 0) return false;
  // Drop only when every frame is third-party (don't mask our own bugs that
  // happen to pass through an extension shim).
  return frames.every(
    (f) => !!f.filename && THIRD_PARTY_FRAME.test(f.filename),
  );
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
  ignoreErrors: [/Invalid LatLng object/],
  beforeSend(event: ErrorEvent, _hint: EventHint) {
    return isThirdPartyError(event) ? null : event;
  },
});

if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    defaults: "2026-01-30",
    disable_surveys: true,
  });
}
