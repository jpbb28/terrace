import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
  ignoreErrors: [/Invalid LatLng object/],
});

if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    defaults: "2026-01-30",
    disable_surveys: true,
  });
}
