import { cache } from "react";
import seed from "@/lib/data/seed.json";
import { resolveProductImages, type UrlFor } from "@/lib/data/images";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createPublicSupabase } from "@/lib/supabase/public";
import { signPaths } from "@/lib/supabase/storage";
import { stoneLabel, typeLabel } from "@/lib/site";
import type { Product, ProductImageRow, ProductRow, SeriesRow } from "@/types/db";

/*
  Every page that shows products is static or ISR — nothing here runs in the
  browser (CLAUDE-storefront.md §7). Reads go through the anonymous client, not
  a session-bound one: these functions run inside generateStaticParams too,
  where there is no request and no cookie jar to read.

  With no Supabase configured the site falls back to the sample catalogue in
  seed.json so the design can be reviewed before the database exists.
*/

type SeedProduct = (typeof seed.products)[number];

function fromSeed(p: SeedProduct): ProductRow {
  return {
    id: p.sku,
    sku: p.sku,
    name: p.name,
    category: p.category,
    metal_type: p.metal_type,
    gold_weight_g: p.gold_weight_g,
    stone_type: p.stone_type,
    stone_carat: "stone_carat" in p ? (p.stone_carat as number) : null,
    stone_carat_note: p.stone_carat_note,
    stone_color: p.stone_color,
    stone_origin: null,
    stone_treatment: null,
    cert_lab: p.cert_lab,
    cert_number: null,
    cert_file_path: null,
    ring_size_th: p.ring_size_th,
    price: p.price,
    description: null,
    series_slug: p.series_slug,
    series_episode: p.series_episode,
    series_note: p.series_note,
    status: "published",
    sold_at: p.sold ? "2025-01-01T00:00:00Z" : null,
    published_at: "2025-01-01T00:00:00Z",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    deleted_at: null,
  };
}

function decorate(
  row: ProductRow,
  images: ProductImageRow[],
  urlFor: UrlFor,
): Product {
  return {
    ...row,
    sold: row.sold_at !== null,
    type_label: typeLabel(row.category),
    stone_label: stoneLabel(row.stone_type),
    images: resolveProductImages(row.sku, images, urlFor),
  };
}

const noPhotos: UrlFor = () => null;

/**
 * All published pieces, newest first. Sold items stay in the list (§4).
 *
 * Wrapped in cache() because a single product page asks for the catalogue
 * three times over — once in generateMetadata, twice in the page itself. The
 * database sits in Singapore and the build runs in whatever region Vercel
 * picked, so every avoided round trip is real time.
 */
export const getProducts = cache(async function getProducts(): Promise<
  Product[]
> {
  if (!isSupabaseConfigured()) {
    return seed.products.map((p) => decorate(fromSeed(p), [], noPhotos));
  }

  const supabase = createPublicSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("getProducts failed", error.message);
    return [];
  }

  const rows = (data ?? []).map((row) => {
    const { product_images: images, ...rest } = row as ProductRow & {
      product_images: ProductImageRow[];
    };
    return { row: rest, images: images ?? [] };
  });

  /*
    One signing call for the whole catalogue rather than one per piece. With
    fifty products that was fifty round trips to Singapore for what the storage
    API will happily answer in a single request.
  */
  const urls = await signPaths(
    "product-photos",
    rows.flatMap((r) => r.images.map((i) => i.storage_path)),
  );

  return rows.map(({ row, images }) =>
    decorate(row, images, (path) => urls.get(path) ?? null),
  );
});

export async function getProduct(sku: string): Promise<Product | null> {
  const wanted = sku.toUpperCase();
  const all = await getProducts();
  return all.find((p) => p.sku.toUpperCase() === wanted) ?? null;
}

/** Four neighbours: same stone or same kind of piece (§4). */
export function relatedTo(product: Product, all: Product[]): Product[] {
  return all
    .filter(
      (p) =>
        p.sku !== product.sku &&
        (p.stone_type === product.stone_type || p.category === product.category),
    )
    .slice(0, 4);
}

export const getSeries = cache(async function getSeries(
  slug: string,
): Promise<SeriesRow | null> {
  if (!isSupabaseConfigured()) {
    const s = seed.series.find((x) => x.slug === slug);
    return s
      ? { id: s.slug, slug: s.slug, title: s.title, episode_label: s.episode_label, blurb: s.blurb }
      : null;
  }
  const supabase = createPublicSupabase();
  const { data } = await supabase
    .from("series")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return (data as SeriesRow) ?? null;
});

export const getAllSeries = cache(async function getAllSeries(): Promise<
  SeriesRow[]
> {
  if (!isSupabaseConfigured()) {
    return seed.series.map((s) => ({
      id: s.slug,
      slug: s.slug,
      title: s.title,
      episode_label: s.episode_label,
      blurb: s.blurb,
    }));
  }
  const supabase = createPublicSupabase();
  const { data } = await supabase.from("series").select("*").order("slug");
  return (data as SeriesRow[]) ?? [];
});
