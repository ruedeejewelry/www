import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Media } from "@/components/ui/Media";
import { getArticle, getArticles } from "@/lib/data/articles";
import { getProducts } from "@/lib/data/products";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.seo_description ?? article.excerpt ?? undefined,
    alternates: { canonical: `/gemstone-guide/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.seo_description ?? article.excerpt ?? undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const products = await getProducts();
  const related = products.filter((p) => article.relatedSkus.includes(p.sku));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.seo_description ?? article.excerpt ?? undefined,
    datePublished: article.published_at ?? undefined,
    dateModified: article.updated_at,
    author: { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name },
  };

  return (
    <article className="px-[18px] pt-5 pb-[130px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="text-[12px] text-muted">
        ความรู้เรื่องพลอย · อ่าน {article.minutes} นาที
      </div>
      <h1 className="mt-2 font-serif text-[23px] leading-[1.5] font-medium text-ink">
        {article.title}
      </h1>

      <Media
        image={article.cover}
        aspect="aspect-[4/3]"
        className="mt-4 rounded-[14px]"
        sizes="(max-width: 430px) 100vw, 430px"
        priority
      />

      {article.blocks.map((block, i) =>
        block.kind === "text" ? (
          <p key={i} className="mt-4 text-[13.5px] leading-[1.95] text-[#4c4640]">
            {block.text}
          </p>
        ) : (
          <figure key={i} className="mt-4">
            <Media
              image={block.image}
              aspect="aspect-video"
              className="rounded-[12px]"
              sizes="(max-width: 430px) 100vw, 430px"
            />
            {block.text ? (
              <figcaption className="mt-2 text-[11.5px] leading-[1.7] text-muted">
                {block.text}
              </figcaption>
            ) : null}
          </figure>
        ),
      )}

      {related.length ? (
        <section className="pt-6">
          <h2 className="mb-3 font-serif text-[16px] text-ink">
            ชิ้นที่เกี่ยวกับเรื่องนี้
          </h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-[14px] md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.sku} product={p} compact />
            ))}
          </div>
        </section>
      ) : null}

      <Link
        href="/jewelry"
        className="mt-6 block rounded-[14px] border border-rule bg-card p-[14px] text-[13.5px] text-ink"
      >
        ดูพลอยที่มีอยู่ตอนนี้ →
      </Link>
    </article>
  );
}
