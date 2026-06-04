import { uuid } from "./utils";
import { terraces } from "@/data/terraces";

type EventType =
  | "view"
  | "website_click"
  | "directions"
  | "phone_click"
  | "instagram"
  | "share"
  | "card_click"
  | "map_marker_click";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function getSessionId(): string {
  let id = sessionStorage.getItem("ts_session");
  if (!id) {
    id = uuid();
    sessionStorage.setItem("ts_session", id);
  }
  return id;
}

export function trackEvent(terraceId: string, eventType: EventType) {
  const device_type = window.innerWidth < 768 ? "mobile" : "desktop";
  // keepalive so the request survives the page being backgrounded — e.g. when
  // navigator.share() opens the OS share sheet or a same-tab navigation occurs.
  // A plain supabase-js insert (fetch without keepalive) gets cancelled mid-flight
  // in those cases, which silently dropped every "share" event. sendBeacon can't
  // set the apikey/Authorization headers PostgREST needs, so we use fetch.
  fetch(`${SUPABASE_URL}/rest/v1/terrace_events`, {
    method: "POST",
    keepalive: true,
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      terrace_id: terraceId,
      terrace_name: terraces.find((t) => t.id === terraceId)?.name ?? terraceId,
      event_type: eventType,
      session_id: getSessionId(),
      device_type,
    }),
  }).catch((err) => {
    // fire and forget — don't block UI
    console.error("trackEvent failed:", err);
  });
}
