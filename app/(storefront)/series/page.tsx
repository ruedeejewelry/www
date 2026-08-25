import type { Metadata } from "next";
import Link from "next/link";
import { getAllSeries, getProducts } from "@/lib/data/products";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "ซีรี่ย์ — งานชุดที่ทำต่อเนื่องกันเป็นตอน",
  description:
    "งานชุดของร้านที่ทำต่อเนื่องกันเป็นตอน เช่น Crab ซีรี่ย์แหวนปู ทุกชิ้นอยู่ในแคตตาล็อกรวมด้วยเสมอ",
  alternates: { canonical: "/series" },
};

export default async function SeriesIndexPage() {
  const [series, products] = await Promise.all([getAllSeries(), getProducts()]);

  return (
    <div className="px-[18px] pt-5 pb-[130px]">
      <h1 className="font-serif text-[24px] leading-[1.5] text-ink">ซีรี่ย์</h1>
      <p className="mt-[10px] text-[13.5px] leading-[1.9] text-body">
        งานชุดที่ทำต่อเนื่องกันเป็นตอน ชิ้นในซีรี่ย์อยู่ในแคตตาล็อกรวมด้วยเสมอ
      </p>

      {series.map((s) => {
        const count = products.filter((p) => p.series_slug === s.slug).length;
        return (
          <Link
            key={s.slug}
            href={`/series/${s.slug}`}
            className="mt-3 flex items-center gap-3 rounded-[14px] border border-rule bg-card p-3"
          >
            <div className="dc-placeholder h-16 w-16 shrink-0 rounded-[10px]" />
            <div>
              <div className="text-[14px] text-ink">{s.title}</div>
              <div className="mt-[3px] text-[12px] text-muted">
                {s.episode_label} · {count} ชิ้น · งานทำมือทั้งชุด
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
