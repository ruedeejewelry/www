/** Values that appear in more than one page and must never drift between them. */

export const DEFAULT_SITE_URL = "https://ruedeejewelry.com";
export const DEFAULT_LINE_OA_ID = "@ruedeejewelry";

/**
 * A dashboard field left blank hands us "", not undefined, so `??` is not
 * enough — an empty string sails past it and blows up in `new URL()` at module
 * load, which fails the whole build with a cryptic error. Anything unusable
 * falls back instead, loudly in the log but without stopping a deploy.
 */
export function resolveSiteUrl(raw: string | undefined): string {
  const trimmed = raw?.trim();
  if (!trimmed) return DEFAULT_SITE_URL;

  // Vercel shows hosts without a scheme; accept that spelling too.
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(candidate).origin;
  } catch {
    console.warn(
      `NEXT_PUBLIC_SITE_URL is not a usable URL (${trimmed}); using ${DEFAULT_SITE_URL}`,
    );
    return DEFAULT_SITE_URL;
  }
}

/** Basic id of the shop's LINE OA, always with its leading "@". */
export function resolveLineOaId(raw: string | undefined): string {
  const trimmed = raw?.trim();
  if (!trimmed) return DEFAULT_LINE_OA_ID;
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

export const SITE = {
  name: "Ruedee Jewelry",
  nameTh: "ฤดี จิวเวลรี่",
  url: resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  phone: "095-949-5564",
  /** LINE OA basic id, e.g. "@ruedee". Prefill text is appended per product. */
  lineId: resolveLineOaId(process.env.NEXT_PUBLIC_LINE_OA_ID),
  locality: "จันทบุรี",
  region: "จันทบุรี",
  country: "TH",
  street: "ตลาดพลอย จันทบุรี",
} as const;

/** Ring sizes the shop actually stocks, per CLAUDE-storefront.md §6. */
export const RING_SIZE_MIN = 40;
export const RING_SIZE_MAX = 70;

export const TYPES = [
  { key: "ring", label: "แหวน", prefix: "RG" },
  { key: "earring", label: "ต่างหู", prefix: "ER" },
  { key: "bracelet", label: "สร้อยข้อมือ", prefix: "BR" },
  { key: "brooch", label: "เข็มกลัด", prefix: "BC" },
  { key: "pendant", label: "จี้", prefix: "PD" },
] as const;

export const STONES = [
  { key: "sapphire", label: "ไพลิน" },
  { key: "ruby", label: "ทับทิม" },
  { key: "emerald", label: "มรกต" },
  { key: "diamond", label: "เพชร" },
  { key: "star", label: "พลอยสตาร์" },
] as const;

export const METALS = ["ทอง 90", "ทอง 18K", "ทองคำขาว", "แพลทินัม"] as const;

export const STONE_COLORS = ["น้ำเงิน", "แดง", "เขียว", "ขาว", "เทา"] as const;

export const PRICE_BANDS = [
  { key: "lt50", label: "ต่ำกว่า 50,000", min: 0, max: 49_999 },
  { key: "50to100", label: "50,000–100,000", min: 50_000, max: 100_000 },
  { key: "gt100", label: "เกิน 100,000", min: 100_001, max: Number.MAX_SAFE_INTEGER },
] as const;

export type TypeKey = (typeof TYPES)[number]["key"];
export type StoneKey = (typeof STONES)[number]["key"];
export type PriceBandKey = (typeof PRICE_BANDS)[number]["key"];

export const typeLabel = (key: string) =>
  TYPES.find((t) => t.key === key)?.label ?? key;

export const stoneLabel = (key: string) =>
  STONES.find((s) => s.key === key)?.label ?? key;

export const skuPrefix = (key: string) =>
  TYPES.find((t) => t.key === key)?.prefix ?? "XX";
