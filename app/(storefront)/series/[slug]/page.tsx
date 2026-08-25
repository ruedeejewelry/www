import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Catalog } from "@/components/storefront/Catalog";
import { getAllSeries, getProducts, getSeries } from "@/lib/data/products";

// Next requires a literal here; tests/revalidate.test.ts keeps them equal.
export const revalidate = 60;

/*
  A series is a layer over the catalogue, not a separate set of data (§3): the
  pieces come from the same query, filtered by series_slug.
*/
export async function generateStaticParams() {
  const series = await getAllSeries();
  return series.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const series = await getSeries(slug);
  if (!series) return {};
  return {
    title: `${series.title} ${series.episode_label ?? ""}`.trim(),
    description: series.blurb ?? undefined,
  };
}

export default async function SeriesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [series, products] = await Promise.all([getSeries(slug), getProducts()]);
  if (!series) notFound();

  const inSeries = products.filter((p) => p.series_slug === slug);
  const title = series.episode_label
    ? `${series.title} · ${series.episode_label}`
    : series.title;

  return (
    <Suspense fallback={<div className="h-screen" />}>
      <Catalog products={inSeries} title={title} />
    </Suspense>
  );
}
