/**
 * Row shapes for the storefront tables. Field names deliberately mirror
 * `purchase_items` in the CRM (CLAUDE.md §6) so staff can record a sale by
 * copying a product row instead of retyping the spec.
 */

export type ProductStatus = "draft" | "published";

export type ProductRow = {
  id: string;
  sku: string;
  name: string;
  /** ring | earring | bracelet | brooch | pendant */
  category: string;
  metal_type: string;
  gold_weight_g: number | null;
  /** Stable key (ruby, sapphire, …). Thai label comes from lib/site.ts. */
  stone_type: string;
  stone_carat: number | null;
  /** Free-text setting note, e.g. "เม็ดเล็กที่ตาและขา". */
  stone_carat_note: string | null;
  stone_color: string | null;
  stone_origin: string | null;
  stone_treatment: string | null;
  cert_lab: string | null;
  cert_number: string | null;
  cert_file_path: string | null;
  ring_size_th: number | null;
  price: number;
  description: string | null;
  series_slug: string | null;
  series_episode: string | null;
  series_note: string | null;
  status: ProductStatus;
  /** Sold pieces stay on the site as proof of work (§4). */
  sold_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ProductImageRow = {
  id: string;
  product_id: string;
  storage_path: string;
  alt_th: string | null;
  sort_order: number;
  width: number | null;
  height: number | null;
  blur_data_url: string | null;
};

/** A product image resolved to something renderable. */
export type ProductImage = {
  /** Signed URL, or null when the shop has not uploaded this shot yet. */
  url: string | null;
  alt: string;
  /** Thai description of the photo that belongs here, shown on placeholders. */
  placeholder: string;
  width: number | null;
  height: number | null;
  blurDataUrl: string | null;
};

/** App-level product: row plus derived labels the UI needs everywhere. */
export type Product = ProductRow & {
  sold: boolean;
  type_label: string;
  stone_label: string;
  images: ProductImage[];
};

export type ArticleBlockKind = "text" | "image";

export type ArticleBlockRow = {
  id: string;
  article_id: string;
  sort_order: number;
  kind: ArticleBlockKind;
  text: string | null;
  image_path: string | null;
};

export type ArticleBlock = {
  kind: ArticleBlockKind;
  text: string;
  image: ProductImage | null;
};

export type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  seo_description: string | null;
  cover_image_path: string | null;
  cover_alt: string | null;
  status: ProductStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type Article = ArticleRow & {
  minutes: number;
  cover: ProductImage;
  blocks: ArticleBlock[];
  relatedSkus: string[];
};

export type ReviewRow = {
  id: string;
  sku: string | null;
  customer_name: string;
  body: string;
  image_path: string | null;
  published: boolean;
  created_at: string;
};

export type Review = ReviewRow & {
  image: ProductImage;
};

export type SeriesRow = {
  id: string;
  slug: string;
  title: string;
  episode_label: string | null;
  blurb: string | null;
};

export type StaffRole = "owner" | "staff";

export type StaffRow = {
  id: string;
  full_name: string;
  role: StaffRole;
  active: boolean;
  created_at: string;
};
