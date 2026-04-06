import { supabase } from "./supabase";

type EventType =
  | "view"
  | "website_click"
  | "directions"
  | "phone_click"
  | "instagram"
  | "share"
  | "card_click"
  | "map_marker_click";

function getSessionId(): string {
  let id = sessionStorage.getItem("ts_session");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("ts_session", id);
  }
  return id;
}

export function trackEvent(terraceId: string, eventType: EventType) {
  const device_type = window.innerWidth < 768 ? "mobile" : "desktop";
  // fire and forget — don't block UI
  supabase
    .from("terrace_events")
    .insert({
      terrace_id: terraceId,
      event_type: eventType,
      session_id: getSessionId(),
      device_type,
    })
    .then(({ error }) => {
      if (error && Object.keys(error).length > 0)
        console.error("trackEvent failed:", error);
    });
}
