import { z } from "zod";
import { METALS, PRICE_BANDS, RING_SIZE_MAX, RING_SIZE_MIN, STONES, TYPES } from "@/lib/site";

/*
  One schema per payload, used by both the client form and the server action
  (CLAUDE.md §9). User-facing messages are Thai; internal logs stay English.
*/

const typeKeys = TYPES.map((t) => t.key) as [string, ...string[]];
const stoneKeys = STONES.map((s) => s.key) as [string, ...string[]];
const bandKeys = PRICE_BANDS.map((b) => b.key) as [string, ...string[]];

export const notifySchema = z.object({
  contact: z
    .string()
    .trim()
    .min(3, "กรอกไลน์ไอดีหรือเบอร์โทรที่ติดต่อได้")
    .max(120, "ยาวเกินไป"),
  contact_kind: z.enum(["line", "phone", "email"]),
  stone_types: z.array(z.enum(stoneKeys)).max(STONES.length),
  price_bands: z.array(z.enum(bandKeys)).max(PRICE_BANDS.length),
  consent: z.literal(true, {
    message: "ต้องยินยอมให้เก็บข้อมูลติดต่อก่อนจึงจะแจ้งเตือนได้",
  }),
});

export type NotifyInput = z.infer<typeof notifySchema>;

/**
 * Only three fields are required to get a piece onto the site: one photo, the
 * kind of piece, and the price. Everything else can be filled in later (§9).
 */
export const productSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(2, "รหัสสินค้าสั้นเกินไป")
    .max(20, "รหัสสินค้ายาวเกินไป")
    .regex(/^[A-Za-z0-9-]+$/, "รหัสสินค้าใช้ตัวอักษรอังกฤษ ตัวเลข และขีดกลางเท่านั้น"),
  name: z.string().trim().max(120).optional().or(z.literal("")),
  category: z.enum(typeKeys, { message: "เลือกประเภทก่อน" }),
  price: z
    .number({ message: "กรอกราคา" })
    .int("ราคาเป็นจำนวนเต็ม")
    .min(1, "กรอกราคา")
    .max(100_000_000, "ราคาสูงผิดปกติ ตรวจอีกครั้ง"),
  metal_type: z.enum(METALS).optional().nullable(),
  gold_weight_g: z.number().min(0).max(500).optional().nullable(),
  stone_type: z.enum(stoneKeys).optional().nullable(),
  stone_carat: z.number().min(0).max(500).optional().nullable(),
  stone_carat_note: z.string().trim().max(200).optional().nullable(),
  stone_color: z.string().trim().max(60).optional().nullable(),
  ring_size_th: z
    .number()
    .min(RING_SIZE_MIN, `ไซซ์แหวนอยู่ระหว่าง ${RING_SIZE_MIN}–${RING_SIZE_MAX}`)
    .max(RING_SIZE_MAX, `ไซซ์แหวนอยู่ระหว่าง ${RING_SIZE_MIN}–${RING_SIZE_MAX}`)
    .optional()
    .nullable(),
  cert_lab: z.string().trim().max(40).optional().nullable(),
  cert_number: z.string().trim().max(80).optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  series_slug: z.string().trim().max(60).optional().nullable(),
  /** Storage paths of photos already uploaded by the form. */
  photos: z
    .array(
      z.object({
        path: z.string().min(1),
        alt: z.string().max(200).optional(),
        width: z.number().int().positive().optional(),
        height: z.number().int().positive().optional(),
      }),
    )
    .min(1, "ต้องมีรูปอย่างน้อย 1 รูป"),
  status: z.enum(["draft", "published"]),
});

export type ProductInput = z.infer<typeof productSchema>;

/** A draft may be saved with almost nothing filled in — that is the point. */
export const productDraftSchema = productSchema.partial({
  price: true,
  photos: true,
  category: true,
});

export const articleSchema = z.object({
  slug: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1, "ยังไม่ได้ตั้งหัวข้อ").max(200),
  excerpt: z.string().trim().max(300).optional().nullable(),
  seo_description: z
    .string()
    .trim()
    .max(300, "คำอธิบายยาวเกินไป")
    .optional()
    .nullable(),
  cover_image_path: z.string().max(400).optional().nullable(),
  cover_alt: z.string().trim().max(200).optional().nullable(),
  blocks: z.array(
    z.object({
      kind: z.enum(["text", "image"]),
      text: z.string().max(20_000).optional().nullable(),
      image_path: z.string().max(400).optional().nullable(),
    }),
  ),
  related_skus: z.array(z.string().max(20)).max(20),
  status: z.enum(["draft", "published"]),
});

export type ArticleInput = z.infer<typeof articleSchema>;
