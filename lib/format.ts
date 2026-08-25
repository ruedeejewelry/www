import type { Product } from "@/types/db";

/** "48,800 บาท" — the price format used everywhere in the design. */
export function baht(n: number): string {
  return n.toLocaleString("en-US") + " บาท";
}

/**
 * The one-line spec under a product card: metal + gold weight, plus ring size
 * when the piece has one. Matches `decorate()` in the prototype.
 */
export function metaShort(p: Product): string {
  const size = p.ring_size_th ? ` · ไซซ์ ${p.ring_size_th}` : "";
  return `${p.metal_type} ${formatGold(p.gold_weight_g)}${size}`;
}

export function formatGold(grams: number | null): string {
  if (grams === null) return "—";
  return `${grams.toFixed(2)} กรัม`;
}

/** Thai alt text describing the actual piece, never a filename (SEO §8). */
export function productAlt(p: Product, angle = "มุมตรง"): string {
  const parts = [p.name, p.stone_label, p.metal_type];
  if (p.ring_size_th) parts.push(`ไซซ์ ${p.ring_size_th}`);
  return `${parts.join(" ")} ${angle} — ${p.sku}`;
}

/** "แหวนไพลินล้อมเพชร ทอง 18K ไซซ์ 52 — RG126" (SEO §8 title format). */
export function productTitle(p: Product): string {
  const size = p.ring_size_th ? ` ไซซ์ ${p.ring_size_th}` : "";
  return `${p.name} ${p.stone_label} ${p.metal_type}${size} — ${p.sku}`;
}

export function readingMinutes(chars: number): number {
  return Math.max(1, Math.round(chars / 400));
}

/** Latin-safe slug that keeps Thai characters, used for article URLs. */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
}
