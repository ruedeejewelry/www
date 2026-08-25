"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser client, anon key only. Read access follows the public RLS policies.
 * Never write product or article data through this — every mutation goes
 * through a server action (CLAUDE.md §9).
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase browser client: env vars are not configured");
  }
  return createBrowserClient(url, key);
}
