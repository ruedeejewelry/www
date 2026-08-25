import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChatTarget } from "@/components/storefront/ChatContext";
import { FavoriteButton } from "@/components/storefront/FavoriteButton";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ProductGallery } from "@/components/storefront/ProductGallery";
import { Accordion } from "@/components/ui/Accordion";
import { Media } from "@/components/ui/Media";
import { getReviews } from "@/lib/data/articles";
import { PRODUCT_ASSURANCES, productFaq } from "@/lib/data/content";
import { getProduct, getProducts, relatedTo } from "@/lib/data/products";
import { baht, formatGold, productAlt, productTitle } from "@/lib/format";
import { SITE } from "@/lib/site";
import type { Product } from "@/types/db";

export const revalidate = 3600;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ sku: p.sku.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sku: string }>;
}): Promise<Metadata> {
  const { sku } = await params;
  const product = await getProduct(sku);
  if (!product) return {};

  const description = `${productTitle(product)} ราคา ${baht(product.price)} ${
    product.sold ? "ขายแล้ว สั่งทำแบบเดียวกันได้" : "มีของพร้อมส่ง"
  } งานทำมือจากตลาดพลอยจันทบุรี ทักไลน์ถามเรื่องชิ้นนี้ได้เลย`;

  /*
    When an admin drops a product link into a LINE chat, the preview should be
    the piece itself. Signed photo URLs outlive the page's revalidate window, so
    a live one is always in the freshly built HTML; with no photo yet the shop
    logo stands in via app/opengraph-image.png.
  */
  const photo = product.images.find((image) => image.url)?.url;

  return {
    title: productTitle(product),
    description,
    alternates: { canonical: `/jewelry/${product.sku.toLowerCase()}` },
    openGraph: {
      title: productTitle(product),
      description,
      type: "website",
      ...(photo ? { images: [{ url: photo, alt: productAlt(product) }] } : {}),
    },
  };
}

/** Product structured data, so the piece can surface in search (§8). */
function productJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productTitle(product),
    sku: product.sku,
    description: product.description ?? product.series_note ?? undefined,
    brand: { "@type": "Brand", name: SITE.name },
    material: product.metal_type,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "THB",
      availability: product.sold
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      url: `${SITE.url}/jewelry/${product.sku.toLowerCase()}`,
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE.name },
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ sku: string }>;
}) {
  const { sku } = await params;
  const product = await getProduct(sku);
  if (!product) notFound();

  const [all, reviews] = await Promise.all([getProducts(), getReviews()]);
  const related = relatedTo(product, all);

  const specs = [
    { label: "ชนิดทอง", value: product.metal_type },
    { label: "น้ำหนักทอง", value: formatGold(product.gold_weight_g) },
    { label: "พลอยที่ฝัง", value: product.stone_label },
    { label: "การฝัง", value: product.stone_carat_note ?? "—" },
    { label: "สี", value: product.stone_color ?? "—" },
    {
      label: "ไซซ์",
      value: product.ring_size_th ? `เบอร์ ${product.ring_size_th}` : "ไม่ระบุ",
    },
    {
      label: "ซีรี่ย์",
      value: product.series_episode ?? "งานเดี่ยว ไม่อยู่ในซีรี่ย์",
    },
    {
      label: "สถานะ",
      value: product.sold ? "ขายแล้ว — สั่งทำแบบเดียวกันได้" : "มีของ พร้อมส่ง",
    },
  ];

  const certLabel =
    product.cert_lab === "GIA" || product.cert_lab === "HRD"
      ? `ใบเซอร์ ${product.cert_lab} แนบไปกับชิ้นงาน`
      : "ใบตรวจพลอยจากแล็บที่เชื่อถือได้";

  const blurb = `${product.description ?? product.series_note ?? ""} คุณแม่ออกแบบ ช่างมือดีของบ้านทำทุกขั้นตอน ชิ้นนี้มีชิ้นเดียว หากไซซ์ไม่พอดี ปรับให้ฟรีครั้งแรกภายใน 30 วัน`.trim();

  return (
    <div>
      <ChatTarget sku={product.sku} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }}
      />

      <ProductGallery
        images={product.images}
        sku={product.sku}
        sold={product.sold}
      />

      <div className="px-[18px] pt-[18px]">
        <div className="font-mono text-[12px] tracking-[.04em] text-muted">
          {product.sku}
        </div>
        <h1 className="mt-1.5 font-serif text-[21px] leading-[1.5] font-medium text-ink">
          {product.name}
        </h1>
        <div className="mt-[10px] flex items-center justify-between gap-[14px]">
          <div>
            <div className="text-[23px] font-semibold text-ink">
              {baht(product.price)}
            </div>
            <div className="mt-1 text-[12.5px] text-muted">
              ราคานี้รวมค่าเรือนและงานฝังแล้ว
            </div>
          </div>
          <FavoriteButton sku={product.sku} />
        </div>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-[18px] pt-[14px]">
        {PRODUCT_ASSURANCES.map((a) => (
          <div
            key={a}
            className="shrink-0 rounded-full border border-rule bg-card px-[13px] py-2 text-[12px] text-[#3a332c]"
          >
            {a}
          </div>
        ))}
      </div>

      <div className="mx-[18px] mt-[18px] overflow-hidden rounded-[14px] border border-rule bg-card">
        {specs.map((row) => (
          <div
            key={row.label}
            className="flex justify-between gap-4 border-b border-rule-soft px-[14px] py-[11px] text-[13px]"
          >
            <span className="text-muted">{row.label}</span>
            <span className="text-right text-ink">{row.value}</span>
          </div>
        ))}
        <div className="flex items-center gap-[10px] px-[14px] py-3">
          <div className="dc-placeholder h-14 w-11 shrink-0 rounded-md" />
          <div className="text-[12.5px] leading-[1.7] text-body">
            {certLabel}
            {product.cert_number ? (
              <>
                <br />
                <span className="font-mono text-[11.5px]">
                  เลขที่ {product.cert_number}
                </span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <p className="mx-[18px] mt-4 rounded-[14px] bg-panel px-4 py-[14px] text-[12.5px] leading-[1.8] text-body">
        {blurb}
      </p>

      <section className="px-[18px] pt-5">
        <h2 className="mb-2 font-serif text-[16px] text-ink">
          คำถามที่ถามบ่อยเรื่องชิ้นนี้
        </h2>
        <Accordion items={productFaq(product)} />
      </section>

      {reviews.length ? (
        <section className="pt-[22px]">
          <h2 className="px-[18px] pb-3 font-serif text-[16px] text-ink">
            รีวิวงานแบบเดียวกัน
          </h2>
          <div className="no-scrollbar flex gap-[10px] overflow-x-auto px-[18px]">
            {reviews.slice(0, 3).map((r) => (
              <article
                key={r.id}
                className="w-[230px] shrink-0 rounded-[14px] border border-rule bg-card p-3"
              >
                <Media
                  image={r.image}
                  aspect="aspect-square"
                  className="rounded-[10px]"
                  sizes="230px"
                />
                <p className="mt-[9px] text-[12.5px] leading-[1.8] text-body">
                  {r.body}
                </p>
                <div className="mt-[7px] text-[11.5px] text-muted">
                  {r.customer_name}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <div className="px-[18px] pt-[22px]">
        <Link
          href="/care"
          className="flex justify-between gap-3 rounded-[14px] border border-rule bg-card px-[14px] py-[13px] text-[13.5px] text-ink"
        >
          <span>วิธีดูแลพลอยเม็ดนี้ · บริการล้างทองฟรี</span>
          <span className="text-gold" aria-hidden="true">
            →
          </span>
        </Link>
      </div>

      {related.length ? (
        <section className="px-[18px] pt-[22px]">
          <h2 className="mb-3 font-serif text-[16px] text-ink">ชิ้นใกล้เคียง</h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-[14px] md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.sku} product={p} compact />
            ))}
          </div>
        </section>
      ) : null}

      <div className="h-[150px]" />
    </div>
  );
}
