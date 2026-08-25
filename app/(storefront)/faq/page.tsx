import type { Metadata } from "next";
import Link from "next/link";
import { Accordion } from "@/components/ui/Accordion";
import { FAQ } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "คำถามที่พบบ่อย — ใบเซอร์ ทอง 90 การรับประกัน งานสั่งทำ",
  description:
    "เพชรพลอยแท้ไหม ทอง 90 กับ 18K ต่างกันอย่างไร ปรับไซซ์และรับประกันอย่างไร สั่งทำใช้เวลานานแค่ไหน รวมคำถามที่ลูกค้าถามบ่อยที่สุด",
  alternates: { canonical: "/faq" },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function FaqPage() {
  return (
    <div className="px-[18px] pt-5 pb-[130px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <h1 className="font-serif text-[24px] text-ink">คำถามที่พบบ่อย</h1>
      <div className="mt-[14px]">
        <Accordion items={FAQ} />
      </div>
      <Link
        href="/ring-size"
        className="mt-5 block rounded-[14px] border border-rule bg-card p-[14px] text-[13.5px] text-ink"
      >
        วิธีวัดไซซ์นิ้วด้วยตัวเอง →
      </Link>
    </div>
  );
}
