import { createClient } from "@supabase/supabase-js";

/**
 * Anonymous read-only client with no session attached.
 *
 * Storefront pages are static: they are rendered at build time, where there is
 * no HTTP request and therefore no cookies to read. Reading them through the
 * cookie-bound client crashes `generateStaticParams` outright.
 *
 * Reading as the anon role is also the safer default — the published HTML is
 * built with exactly the privileges a stranger has, so a draft cannot end up
 * baked into a public page even if a staff session were somehow in scope.
 */
export function createPublicSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) {
    throw new Error("Supabase public client: env vars are not configured");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
