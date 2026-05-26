import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client using the service key. Bypasses RLS.
// NEVER import this from a client component — it would leak SUPABASE_SERVICE_KEY
// into the browser bundle. Used by API routes and server components only.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);
