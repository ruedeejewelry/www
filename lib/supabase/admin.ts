import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * ⚠️  SERVICE ROLE — BYPASSES ROW LEVEL SECURITY.
 *
 * Import this only from server actions and route handlers, and only after
 * requireStaff() has established who is asking and what their role allows.
 * Never answer a customer request with this client (CLAUDE.md §5, "กฎเหล็ก").
 * The key must never reach the browser bundle; the "server-only" import above
 * makes the build fail if this file is ever pulled into a client component.
 */
export function createAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase admin client: service role env vars are not configured");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
