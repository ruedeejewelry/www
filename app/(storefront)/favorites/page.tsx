import type { Metadata } from "next";
import Link from "next/link";
import { FavoritesList } from "@/components/storefront/FavoritesList";
import { getProducts } from "@/lib/data/products";

// Next requires a literal here; tests/revalidate.test.ts keeps them equal.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "ชิ้นที่ถูกใจ",
  description:
    "ชิ้นที่เก็บไว้เทียบกัน บันทึกอยู่ในเครื่องนี้เท่านั้น ส่งทั้งรายการเข้าไลน์ทีเดียวได้",
  robots: { index: false, follow: true },
};

export default async function FavoritesPage() {
  const products = await getProducts();

  return (
    <div className="px-[18px] pt-5 pb-10">
      <h1 className="font-serif text-[24px] text-ink">ชิ้นที่ถูกใจ</h1>
      <FavoritesList products={products} />
      <Link
        href="/notify-me"
        className="mt-5 block rounded-[14px] border border-rule bg-card p-[14px] text-[13.5px] text-ink"
      >
        ให้แจ้งเตือนเมื่อมีของเข้าแบบที่สนใจ →
      </Link>
    </div>
  );
}
