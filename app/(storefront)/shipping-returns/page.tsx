import type { Metadata } from "next";
import { POLICY_ITEMS } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "การจัดส่ง เปลี่ยนคืน และรับประกัน",
  description:
    "เงื่อนไขการจัดส่ง เปลี่ยนคืน การปรับขนาดและซ่อมแซม การรับประกันงานช่าง และการตีเทิร์นทอง 90 ตามราคาตลาด",
  alternates: { canonical: "/shipping-returns" },
};

export default function PolicyPage() {
  return (
    <div className="px-[18px] pt-5 pb-10">
      <h1 className="font-serif text-[24px] leading-[1.5] text-ink">
        การจัดส่ง เปลี่ยนคืน และรับประกัน
      </h1>
      {POLICY_ITEMS.map((p) => (
        <section key={p.title} className="mt-[22px]">
          <h2 className="text-[14px] text-ink">{p.title}</h2>
          <p className="mt-1.5 text-[13px] leading-[1.9] text-body">{p.body}</p>
        </section>
      ))}
    </div>
  );
}
