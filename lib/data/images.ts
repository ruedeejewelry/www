import type { ProductImage, ProductImageRow } from "@/types/db";

/**
 * How long a signed storage URL stays valid. Pages are static/ISR, so this has
 * to comfortably outlive the page's revalidate window or a cached page would
 * start serving dead image links.
 */
export const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 7;

/** The shots a product page asks for, in the order the design shows them. */
export const PRODUCT_SHOTS = [
  "มุมด้านข้าง",
  "ใส่บนมือ",
  "ก้นเรือน",
  "ใบเซอร์",
] as const;

/** Looks up an already-resolved URL for a stored path. */
export type UrlFor = (path: string) => string | null;

export function placeholderImage(
  label: string,
  alt = label,
): ProductImage {
  return {
    url: null,
    alt,
    placeholder: label,
    width: null,
    height: null,
    blurDataUrl: null,
  };
}

/**
 * Product image slots. Real uploads come first; any remaining slot renders as a
 * labelled placeholder naming the shot the shop still owes, so gaps are
 * obvious on the live site instead of silently missing.
 */
export function resolveProductImages(
  sku: string,
  rows: ProductImageRow[],
  urlFor: UrlFor,
): ProductImage[] {
  const sorted = [...rows].sort((a, b) => a.sort_order - b.sort_order);

  const real: ProductImage[] = sorted.map((row, i) => ({
    url: urlFor(row.storage_path),
    alt: row.alt_th ?? `${sku} รูปที่ ${i + 1}`,
    placeholder: i === 0 ? `รูปหลัก ${sku}` : `รูป ${sku}`,
    width: row.width,
    height: row.height,
    blurDataUrl: row.blur_data_url,
  }));

  const wanted = 1 + PRODUCT_SHOTS.length;
  const gaps: ProductImage[] = [];
  for (let i = real.length; i < wanted; i += 1) {
    gaps.push(
      placeholderImage(
        i === 0 ? `รูปหลัก ${sku} — มุมตรง ซูมได้` : PRODUCT_SHOTS[i - 1],
      ),
    );
  }

  return [...real, ...gaps];
}
