import type { Metadata } from "next";
import { CARE_ITEMS, FREE_SERVICES } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "ดูแลเครื่องประดับ — ล้างเอง เก็บอย่างไร บริการฟรีของร้าน",
  description:
    "วิธีดูแลพลอยและทอง ล้างเองที่บ้านอย่างไรให้ปลอดภัย พลอยชนิดไหนต้องระวังเป็นพิเศษ และบริการหลังการขายที่ร้านทำให้ฟรี",
  alternates: { canonical: "/care" },
};

export default function CarePage() {
  return (
    <div className="px-[18px] pt-5 pb-10">
      <h1 className="font-serif text-[24px] leading-[1.5] text-ink">
        ดูแลเครื่องประดับ
      </h1>

      {CARE_ITEMS.map((c) => (
        <section key={c.title} className="mt-5">
          <h2 className="text-[14px] text-ink">{c.title}</h2>
          <p className="mt-1.5 text-[13px] leading-[1.9] text-body">{c.body}</p>
        </section>
      ))}

      <div className="mt-[26px] rounded-[14px] bg-panel p-4">
        <h2 className="font-serif text-[16px] text-ink">บริการที่ร้านทำให้ฟรี</h2>
        {FREE_SERVICES.map((f) => (
          <p key={f} className="mt-[7px] text-[13px] leading-[1.85] text-body">
            {f}
          </p>
        ))}
      </div>
    </div>
  );
}
