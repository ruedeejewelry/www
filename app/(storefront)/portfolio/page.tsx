import type { Metadata } from "next";
import { ReorderCard } from "@/components/storefront/ReorderCard";
import { getProducts } from "@/lib/data/products";

// Next requires a literal here; tests/revalidate.test.ts keeps them equal.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "ผลงานที่ทำมา — งานที่ขายไปแล้ว สั่งทำแบบเดียวกันได้",
  description:
    "งานที่ขายไปแล้วของร้าน เก็บไว้ให้ดูเป็นตัวอย่าง ชอบแบบไหนสั่งทำแบบเดียวกันได้ แต่พลอยแท้ไม่มีเม็ดซ้ำกัน",
  alternates: { canonical: "/portfolio" },
};

export default async function PortfolioPage() {
  const products = await getProducts();
  /* Sold pieces first — they are the proof — then recent work for context. */
  const sold = products.filter((p) => p.sold);
  const items = [...sold, ...products.filter((p) => !p.sold).slice(0, 4)];

  return (
    <div className="pt-5 pb-[130px]">
      <div className="px-[18px]">
        <h1 className="font-serif text-[24px] leading-[1.5] text-ink">
          ผลงานที่ทำมา
        </h1>
        <p className="mt-[10px] text-[13.5px] leading-[1.9] text-body">
          งานที่ขายไปแล้วสองร้อยกว่าชิ้น เก็บไว้ให้ดูเป็นตัวอย่าง ชอบแบบไหนบอกได้
          ทำซ้ำได้ทุกชิ้นแต่พลอยจะไม่เหมือนเม็ดเดิมเพราะพลอยแท้ไม่มีเม็ดซ้ำกัน
        </p>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-[14px] px-[18px] pt-[18px] md:grid-cols-3">
        {items.map((p) => (
          <ReorderCard key={p.sku} product={p} />
        ))}
      </div>
    </div>
  );
}
