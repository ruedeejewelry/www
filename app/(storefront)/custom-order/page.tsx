import type { Metadata } from "next";
import { CUSTOM_CASES, CUSTOM_STEPS } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "งานสั่งทำ — ออกแบบเอง ช่างของบ้านเป็นคนทำ",
  description:
    "งานสั่งทำคืองานหลักของร้าน ส่งภาพอ้างอิงหรือบอกไอเดียมาได้ เราหาพลอยให้เลือกก่อนเริ่มงาน ใช้เวลา 3–6 สัปดาห์",
  alternates: { canonical: "/custom-order" },
};

export default function CustomOrderPage() {
  return (
    <div className="px-[18px] pt-5 pb-[140px]">
      <h1 className="font-serif text-[24px] leading-[1.5] text-ink">งานสั่งทำ</h1>
      <p className="mt-[10px] text-[13.5px] leading-[1.9] text-body">
        งานสั่งทำคืองานหลักของร้าน ส่งภาพอ้างอิงมาหรือบอกไอเดียในใจได้เลย
        จันคุยกับช่างให้ ราคาขึ้นกับแบบ พลอย และน้ำหนักทอง — ทักถามได้ก่อนตัดสินใจ
      </p>

      <ol>
        {CUSTOM_STEPS.map((s) => (
          <li key={s.n} className="mt-[18px] flex gap-3">
            <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-ink text-[12.5px] text-[#f5f1ea]">
              {s.n}
            </div>
            <div>
              <div className="text-[14px] text-ink">{s.title}</div>
              <div className="mt-[3px] text-[12px] text-gold">{s.when}</div>
              <p className="mt-[5px] text-[13px] leading-[1.85] text-body">
                {s.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="mt-7 font-serif text-[17px] text-ink">งานสั่งทำที่ผ่านมา</h2>
      {CUSTOM_CASES.map((c) => (
        <article
          key={c.text}
          className="mt-3 rounded-[14px] border border-rule bg-card p-3"
        >
          <div className="flex gap-[9px]">
            <div className="dc-placeholder flex flex-1 items-end rounded-[10px] p-1.5 aspect-square">
              <span className="font-mono text-[9px] text-muted">ก่อน</span>
            </div>
            <div className="dc-placeholder flex flex-1 items-end rounded-[10px] p-1.5 aspect-square">
              <span className="font-mono text-[9px] text-muted">หลัง</span>
            </div>
          </div>
          <p className="mt-[10px] text-[13px] leading-[1.8] text-body">{c.text}</p>
          <div className="mt-1.5 text-[11.5px] text-muted">{c.meta}</div>
        </article>
      ))}
    </div>
  );
}
