import "server-only";

import type { ProductFormValues } from "@/components/admin/ProductForm";
import { SIGNED_URL_TTL_SECONDS } from "@/lib/data/images";
import { createServerSupabase } from "@/lib/supabase/server";
import type { ProductImageRow, ProductRow } from "@/types/db";

/** Loads a saved product back into the shape the admin form edits. */
export async function loadProductForForm(
  sku: string,
): Promise<ProductFormValues | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .ilike("sku", sku)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return null;

  const { product_images: images, ...row } = data as ProductRow & {
    product_images: ProductImageRow[];
  };

  const sorted = [...(images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const signed = sorted.length
    ? await supabase.storage
        .from("product-photos")
        .createSignedUrls(
          sorted.map((i) => i.storage_path),
          SIGNED_URL_TTL_SECONDS,
        )
    : { data: null };

  const urls = new Map<string, string>();
  for (const item of signed.data ?? []) {
    if (item.path && item.signedUrl) urls.set(item.path, item.signedUrl);
  }

  return {
    sku: row.sku,
    name: row.name,
    category: row.category,
    price: String(row.price),
    metal_type: row.metal_type,
    gold_weight_g: row.gold_weight_g ? String(row.gold_weight_g) : "",
    stone_type: row.stone_type,
    stone_color: row.stone_color ?? "",
    stone_carat_note: row.stone_carat_note ?? "",
    ring_size_th: row.ring_size_th ? String(row.ring_size_th) : "",
    cert_lab: row.cert_lab ?? "",
    cert_number: row.cert_number ?? "",
    description: row.description ?? "",
    photos: sorted
      .filter((image) => urls.has(image.storage_path))
      .map((image) => ({
        path: image.storage_path,
        previewUrl: urls.get(image.storage_path) as string,
        width: image.width ?? 0,
        height: image.height ?? 0,
        alt: image.alt_th ?? "",
      })),
  };
}
