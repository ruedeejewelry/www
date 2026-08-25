import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server client carrying the caller's session — for the admin app and for
 * sign-in, where who is asking is the whole point.
 *
 * Do NOT use this for storefront data. It reads cookies, and the public pages
 * are built by `generateStaticParams` where no request exists; use
 * `createPublicSupabase()` there instead.
 */
export async function createServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase server client: env vars are not configured");
  }

  const store = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(list) {
        try {
          for (const { name, value, options } of list) {
            store.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Session refresh happens in middleware instead.
        }
      },
    },
  });
}
