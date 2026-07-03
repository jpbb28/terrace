import * as Sentry from "@sentry/nextjs";
import type { ErrorEvent, EventHint } from "@sentry/nextjs";
import posthog from "posthog-js";

// Script origins that aren't our code: browser extensions and other injected
// scripts (in-app WebViews, e.g. Facebook/Instagram/Samsung browsers, inject
// their own JS into the page). Errors thrown from these are noise we can't fix
// (e.g. `app:///<hash>/script.js` "Invalid or unexpected token" from extension
// blobs, or a bare `app:///` "Unexpected token 'else'" from a WebView shim).
// Our own client code is always served from https://, so any `app:///` frame on
// the browser is injected — but exclude `_next`/`src` in case Sentry ever
// rewrites our own bundle to that scheme.
const THIRD_PARTY_FRAME =
  /^(chrome|moz|safari|safari-web)-extension:|^webkit-masked-url:|^app:\/\/\/(?!(_next|src)\/)/i;

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
