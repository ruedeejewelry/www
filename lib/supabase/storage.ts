import "server-only";

import { createAdminSupabase } from "@/lib/supabase/admin";
import { hasServiceRole } from "@/lib/supabase/config";
import { SIGNED_URL_TTL_SECONDS } from "@/lib/data/images";

export type Bucket = "product-photos" | "certificates" | "article-images";

/**
 * Turns storage paths into signed URLs for a page that is about to be built.
 *
 * The buckets are private and stay private (CLAUDE.md §9), and the anon role
 * cannot read objects in them — so the signing itself is done with the service
 * role, here on the server. What reaches the browser is only the resulting
 * time-limited URL, never the key.
 *
 * With no service role available (a preview deployment without the secret, or
 * local work without a .env) this returns nothing and every image slot falls
 * back to its labelled placeholder. A missing photo is not worth failing a
 * build over.
 */
export async function signPaths(
  bucket: Bucket,
  paths: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (paths.length === 0 || !hasServiceRole()) return map;

  try {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);

    if (error) {
      console.error(`signPaths(${bucket}) failed`, error.message);
      return map;
    }
    for (const item of data ?? []) {
      if (item.path && item.signedUrl) map.set(item.path, item.signedUrl);
    }
  } catch (error) {
    console.error(`signPaths(${bucket}) threw`, error);
  }

  return map;
}

/** Convenience for the single-image cases: article covers, review photos. */
export async function signPath(
  bucket: Bucket,
  path: string | null,
): Promise<string | null> {
  if (!path) return null;
  const signed = await signPaths(bucket, [path]);
  return signed.get(path) ?? null;
}
