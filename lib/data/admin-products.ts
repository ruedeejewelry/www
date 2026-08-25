import "server-only";

import { createServerSupabase } from "@/lib/supabase/server";
import type { ProductImageRow, ProductRow } from "@/types/db";

export type AdminProduct = ProductRow & { photoCount: number };

/**
 * The staff list, including drafts. Runs under the caller's session, so RLS is
 * what actually permits drafts to be seen — requireStaff() has already
 * confirmed who is asking.
 */
export async function getAdminProducts(): Promise<AdminProduct[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(id)")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("getAdminProducts failed", error.message);
    return [];
  }

  return (data ?? []).map((raw) => {
    const { product_images: images, ...row } = raw as ProductRow & {
      product_images: Pick<ProductImageRow, "id">[];
    };
    return { ...row, photoCount: images?.length ?? 0 };
  });
}

/** Next free code for a category, e.g. RG127. Staff can type over it (§9). */
export async function nextSku(prefix: string): Promise<string> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("products")
    .select("sku")
    .ilike("sku", `${prefix}%`);

  const highest = (data ?? []).reduce((max, row) => {
    const digits = Number.parseInt(row.sku.replace(/^[A-Za-z]+/, ""), 10);
    return Number.isFinite(digits) && digits > max ? digits : max;
  }, 0);

  return `${prefix}${highest + 1}`;
}
