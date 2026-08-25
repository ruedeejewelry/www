import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalog } from "@/components/storefront/Catalog";
import { getProducts } from "@/lib/data/products";

// Next requires a literal here; tests/revalidate.test.ts keeps them equal.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "เครื่องประดับทั้งหมด — แหวน ต่างหู สร้อย เข็มกลัด จี้",
  description:
    "เครื่องประดับพลอยแท้ทุกชิ้นของร้าน กรองตามชนิดพลอย ประเภท ช่วงราคา และไซซ์แหวน ราคาบอกไว้ทุกชิ้น ทักไลน์ถามได้ทันที",
};

export default async function CatalogPage() {
  const products = await getProducts();
  return (
    <Suspense fallback={<div className="h-screen" />}>
      <Catalog products={products} title="เครื่องประดับทั้งหมด" />
    </Suspense>
  );
}
