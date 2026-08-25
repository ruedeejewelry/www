import { cache } from "react";
import seed from "@/lib/data/seed.json";
import { placeholderImage } from "@/lib/data/images";
import { readingMinutes } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createPublicSupabase } from "@/lib/supabase/public";
import { signPath } from "@/lib/supabase/storage";
import type {
  Article,
  ArticleBlock,
  ArticleBlockRow,
  ArticleRow,
  Review,
  ReviewRow,
} from "@/types/db";

type SeedArticle = (typeof seed.articles)[number];

function seedToArticle(a: SeedArticle): Article {
  const blocks: ArticleBlock[] = a.blocks.map((text) => ({
    kind: "text",
    text,
    image: null,
  }));
  const chars = blocks.reduce((t, b) => t + b.text.length, 0);
  return {
    id: a.slug,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    seo_description: a.seo_description,
    cover_image_path: null,
    cover_alt: a.cover_alt,
    status: "published",
    published_at: "2025-01-01T00:00:00Z",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    deleted_at: null,
    minutes: readingMinutes(chars),
    cover: placeholderImage(`ภาพปก: ${a.cover_alt}`, a.cover_alt),
    blocks,
    relatedSkus: [],
  };
}

const signArticleImage = (path: string | null) =>
  signPath("article-images", path);

/** cache(): generateMetadata and the article body both ask for this. */
export const getArticles = cache(async function getArticles(): Promise<
  Article[]
> {
  if (!isSupabaseConfigured()) return seed.articles.map(seedToArticle);

  const supabase = createPublicSupabase();
  const { data, error } = await supabase
    .from("articles")
    .select("*, article_blocks(*), article_products(products(sku))")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("getArticles failed", error.message);
    return [];
  }

  return Promise.all(
    (data ?? []).map(async (raw) => {
      const row = raw as ArticleRow & {
        article_blocks: ArticleBlockRow[];
        article_products: { products: { sku: string } | null }[];
      };
      const blockRows = [...(row.article_blocks ?? [])].sort(
        (a, b) => a.sort_order - b.sort_order,
      );
      const blocks: ArticleBlock[] = await Promise.all(
        blockRows.map(async (b) => ({
          kind: b.kind,
          text: b.text ?? "",
          image:
            b.kind === "image"
              ? {
                  url: await signArticleImage(b.image_path),
                  alt: b.text ?? "",
                  placeholder: b.text || "รูปในเนื้อหา",
                  width: null,
                  height: null,
                  blurDataUrl: null,
                }
              : null,
        })),
      );
      const chars = blocks
        .filter((b) => b.kind === "text")
        .reduce((t, b) => t + b.text.length, 0);
      const coverUrl = await signArticleImage(row.cover_image_path);

      return {
        ...row,
        minutes: readingMinutes(chars),
        cover: {
          url: coverUrl,
          alt: row.cover_alt ?? row.title,
          placeholder: `ภาพปก: ${row.cover_alt ?? row.title}`,
          width: null,
          height: null,
          blurDataUrl: null,
        },
        blocks,
        relatedSkus: (row.article_products ?? [])
          .map((ap) => ap.products?.sku)
          .filter((s): s is string => Boolean(s)),
      } satisfies Article;
    }),
  );
});

export async function getArticle(slug: string): Promise<Article | null> {
  const all = await getArticles();
  return all.find((a) => a.slug === slug) ?? null;
}

/** cache(): the home page, every product page and /reviews all want these. */
export const getReviews = cache(async function getReviews(): Promise<Review[]> {
  const decorate = (r: ReviewRow, url: string | null): Review => ({
    ...r,
    image: {
      url,
      alt: r.sku ? `ลูกค้าใส่ ${r.sku}` : `รีวิวจาก${r.customer_name}`,
      placeholder: r.sku ? `รูปลูกค้าใส่ ${r.sku}` : "รูปลูกค้าใส่",
      width: null,
      height: null,
      blurDataUrl: null,
    },
  });

  if (!isSupabaseConfigured()) {
    return seed.reviews.map((r, i) =>
      decorate(
        {
          id: String(i),
          sku: r.sku,
          customer_name: r.customer_name,
          body: r.body,
          image_path: null,
          published: true,
          created_at: "2025-01-01T00:00:00Z",
        },
        null,
      ),
    );
  }

  const supabase = createPublicSupabase();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getReviews failed", error.message);
    return [];
  }

  return Promise.all(
    (data as ReviewRow[]).map(async (r) =>
      decorate(r, await signPath("product-photos", r.image_path)),
    ),
  );
});
