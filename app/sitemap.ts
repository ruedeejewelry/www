import type { MetadataRoute } from "next";
import { getArticles } from "@/lib/data/articles";
import { getAllSeries, getProducts } from "@/lib/data/products";
import { SITE } from "@/lib/site";
import { REVALIDATE_SECONDS } from "@/lib/revalidate";

export const revalidate = REVALIDATE_SECONDS;

const STATIC_PATHS = [
  "/",
  "/jewelry",
  "/series",
  "/portfolio",
  "/custom-order",
  "/gemstone-guide",
  "/reviews",
  "/about",
  "/care",
  "/shipping-returns",
  "/faq",
  "/ring-size",
  "/notify-me",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, articles, series] = await Promise.all([
    getProducts(),
    getArticles(),
    getAllSeries(),
  ]);

  return [
    ...STATIC_PATHS.map((path) => ({
      url: `${SITE.url}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.6,
    })),
    ...products.map((p) => ({
      url: `${SITE.url}/jewelry/${p.sku.toLowerCase()}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...series.map((s) => ({
      url: `${SITE.url}/series/${s.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...articles.map((a) => ({
      url: `${SITE.url}/gemstone-guide/${a.slug}`,
      lastModified: new Date(a.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
