import Link from "next/link";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Media } from "@/components/ui/Media";
import { getArticles, getReviews } from "@/lib/data/articles";
import { FOOTER_LINKS, HOME_STORY } from "@/lib/data/content";
import { getAllSeries, getProducts } from "@/lib/data/products";
import { SITE, TYPES } from "@/lib/site";

/** Rebuilt on a short cycle, and immediately when staff publish. */
// Next requires a literal here; tests/revalidate.test.ts keeps them equal.
export const revalidate = 60;

export default async function HomePage() {
  const [products, articles, reviews, series] = await Promise.all([
    getProducts(),
    getArticles(),
    getReviews(),
    getAllSeries(),
  ]);

  const latest = products.slice(0, 8);
  const crab = series[0];
  const crabCount = products.filter((p) => p.series_slug === crab?.slug).length;

  return (
    <div>
      <section className="px-[18px] pt-5 pb-[14px]">
        <h1 className="font-serif text-[26px] leading-[1.45] text-ink">
          ใส่ก็สวย
          <br />
          เก็บก็มีค่า
        </h1>
        <p className="mt-[10px] text-[13.5px] leading-[1.8] text-body-soft">
          เพชร พลอย แท้ จากตลาดพลอยจันทบุรี ในราคาต้นน้ำ คุณแม่ออกแบบเอง
          ช่างมือดีของบ้านเป็นคนทำ
        </p>
      </section>

      <nav
        aria-label="หมวดสินค้า"
        className="no-scrollbar flex gap-2 overflow-x-auto px-[18px] pt-0.5 pb-4"
      >
        {TYPES.map((t) => (
          <Link
            key={t.key}
            href={`/jewelry?type=${t.key}`}
            className="shrink-0 rounded-full border border-border bg-card px-[14px] py-2 text-[13px] text-[#3a332c]"
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <section>
        <div className="flex items-baseline justify-between px-[18px] pt-1 pb-3">
          <h2 className="font-serif text-[17px] text-ink">เข้าใหม่ล่าสุด</h2>
          <Link href="/jewelry" className="text-[12.5px] text-gold">
            ดูทั้งหมด
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-[14px] px-[18px] md:grid-cols-3">
          {latest.map((p, i) => (
            <ProductCard key={p.sku} product={p} priority={i < 2} />
          ))}
        </div>
      </section>

      <section className="mt-7 rounded-[16px] bg-panel px-[18px] py-5 mx-[18px]">
        <h2 className="font-serif text-[16px] leading-[1.6] text-ink">
          Ruedee มาจากชื่อคุณแม่ฤดี
        </h2>
        <p className="mt-2 text-[13px] leading-[1.85] text-body">{HOME_STORY}</p>
        <Link
          href="/about"
          className="mt-3 inline-block rounded-full border border-[#ddd4c5] px-[15px] py-2 text-[12.5px] text-[#3a332c]"
        >
          อ่านเรื่องของร้าน
        </Link>
      </section>

      <section className="pt-[26px]">
        <div className="flex items-baseline justify-between px-[18px] pb-3">
          <h2 className="font-serif text-[17px] text-ink">ลูกค้าใส่จริง</h2>
          <Link href="/reviews" className="text-[12.5px] text-gold">
            อ่านรีวิวทั้งหมด
          </Link>
        </div>
        <div className="no-scrollbar flex gap-[10px] overflow-x-auto px-[18px] pb-1">
          {reviews.slice(0, 3).map((r) => (
            <article
              key={r.id}
              className="w-[236px] shrink-0 rounded-[14px] border border-rule bg-card p-3"
            >
              <Media
                image={r.image}
                aspect="aspect-[4/3]"
                className="rounded-[10px]"
                sizes="236px"
              />
              <p className="mt-[9px] text-[12.5px] leading-[1.8] text-body">
                {r.body}
              </p>
              <div className="mt-[7px] text-[11.5px] text-muted">
                {r.customer_name} · {r.sku}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-[18px] pt-[26px]">
        <Link
          href="/custom-order"
          className="block rounded-[16px] bg-ink p-[18px] text-[#f0e9dc]"
        >
          <div className="font-serif text-[17px] leading-[1.5]">
            อยากได้แบบที่ยังไม่มีในเว็บ
          </div>
          <div className="mt-[7px] text-[12.5px] leading-[1.8] text-[#b7ad9d]">
            บอกงบและแบบที่ชอบ เราหาพลอยให้เลือกก่อนเริ่มงาน 2–4 สัปดาห์ได้ของ
          </div>
          <div className="mt-[11px] text-[13px] text-gold-bright">
            ดูขั้นตอนงานสั่งทำ →
          </div>
        </Link>
      </section>

      <section className="pt-[26px]">
        <div className="flex items-baseline justify-between px-[18px] pb-3">
          <h2 className="font-serif text-[17px] text-ink">ก่อนซื้อพลอย ควรรู้</h2>
          <Link href="/gemstone-guide" className="text-[12.5px] text-gold">
            ทั้งหมด
          </Link>
        </div>
        <div className="px-[18px]">
          {articles.slice(0, 3).map((a) => (
            <Link
              key={a.slug}
              href={`/gemstone-guide/${a.slug}`}
              className="flex items-center gap-3 border-b border-rule py-3"
            >
              <div className="flex-1">
                <div className="text-[13.5px] leading-[1.55] text-ink">
                  {a.title}
                </div>
                <div className="mt-[3px] text-[11.5px] text-muted">
                  อ่าน {a.minutes} นาที
                </div>
              </div>
              <span className="text-[14px] text-gold" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {crab ? (
        <section className="px-[18px] pt-[26px]">
          <h2 className="font-serif text-[17px] text-ink">ซีรี่ย์</h2>
          <p className="mt-1 text-[12.5px] text-muted">
            งานชุดที่ทำต่อเนื่องกันเป็นตอน
          </p>
          <Link
            href={`/series/${crab.slug}`}
            className="mt-3 flex items-center gap-3 rounded-[14px] border border-rule bg-card p-3"
          >
            <div className="dc-placeholder h-16 w-16 shrink-0 rounded-[10px]" />
            <div>
              <div className="text-[14px] text-ink">{crab.title}</div>
              <div className="mt-[3px] text-[12px] text-muted">
                {crab.episode_label} · {crabCount} ชิ้น · งานทำมือทั้งชุด
              </div>
            </div>
          </Link>
        </section>
      ) : null}

      <footer className="flex flex-col gap-0.5 px-[18px] pt-7 pb-[130px]">
        <div className="mb-4 h-px bg-rule" />
        {FOOTER_LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="py-[9px] text-[13.5px] text-body">
            {l.label}
          </Link>
        ))}
        <p className="mt-[14px] text-[11.5px] leading-[1.7] text-faint">
          © 2025 {SITE.name} · ตลาดพลอยจันทบุรี
          <br />
          โทร {SITE.phone} · แชต LINE ตอบเองทุกข้อความ
        </p>
      </footer>
    </div>
  );
}
