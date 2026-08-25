import type { Metadata } from "next";
import { NotifyForm } from "@/components/storefront/NotifyForm";

export const metadata: Metadata = {
  title: "แจ้งเตือนของเข้าใหม่",
  description:
    "พลอยดีเข้ามาไม่บ่อยและมักขายภายในสองสามวัน เลือกชนิดพลอยและช่วงราคาที่สนใจไว้ เราส่งรูปให้ทางไลน์ก่อนลงเว็บ",
  alternates: { canonical: "/notify-me" },
};

export default function NotifyPage() {
  return (
    <div className="px-[18px] pt-5 pb-10">
      <h1 className="font-serif text-[24px] leading-[1.5] text-ink">
        แจ้งเตือนของเข้าใหม่
      </h1>
      <p className="mt-[10px] text-[13.5px] leading-[1.9] text-body">
        พลอยดีเข้ามาไม่บ่อยและมักขายภายในสองสามวัน เลือกสิ่งที่สนใจไว้
        เราส่งรูปให้ทางไลน์ก่อนลงเว็บ
      </p>

      <NotifyForm />

      <p className="mt-[22px] text-[11.5px] leading-[1.75] text-muted">
        ส่งเฉพาะเมื่อมีของตรงเงื่อนไข ไม่เกินเดือนละสองสามครั้ง ยกเลิกได้ในแชท
      </p>
    </div>
  );
}
