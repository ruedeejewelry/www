import type { Metadata } from "next";
import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { getReviews } from "@/lib/data/articles";

// Next requires a literal here; tests/revalidate.test.ts keeps them equal.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "รีวิวจากลูกค้า — พร้อมรหัสสินค้าที่ซื้อจริง",
  description:
    "รีวิวจากลูกค้าที่ซื้อจริง ระบุรหัสสินค้าไว้ทุกอัน กดดูหน้าชิ้นนั้นได้เลย",
  alternates: { canonical: "/reviews" },
};

export default async function ReviewsPage() {
  const reviews = await getReviews();

  return (
    <div className="px-[18px] pt-5 pb-[130px]">
      <h1 className="font-serif text-[24px] text-ink">รีวิวจากลูกค้า</h1>
      <p className="mt-2 text-[13px] text-muted">
        ทุกรีวิวมาจากลูกค้าที่ซื้อจริง ระบุรหัสสินค้าที่ซื้อไว้ทุกอัน
      </p>

      {reviews.map((r) => (
        <article
          key={r.id}
          className="mt-[14px] rounded-[14px] border border-rule bg-card p-3"
        >
          <Media
            image={r.image}
            aspect="aspect-[4/3]"
            className="rounded-[10px]"
            sizes="(max-width: 430px) 100vw, 400px"
          />
          <p className="mt-[10px] text-[13px] leading-[1.85] text-body">{r.body}</p>
          <div className="mt-2 flex justify-between gap-3">
            <span className="text-[11.5px] text-muted">{r.customer_name}</span>
            {r.sku ? (
              <Link
                href={`/jewelry/${r.sku.toLowerCase()}`}
                className="font-mono text-[11.5px] text-gold"
              >
                {r.sku}
              </Link>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
