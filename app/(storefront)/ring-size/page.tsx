import type { Metadata } from "next";
import { Media } from "@/components/ui/Media";
import { RING_STEPS } from "@/lib/data/content";
import { placeholderImage } from "@/lib/data/images";
import { RING_SIZE_MAX, RING_SIZE_MIN } from "@/lib/site";

export const metadata: Metadata = {
  title: "วัดไซซ์นิ้วเองที่บ้าน — เบอร์ไทย 40–70",
  description:
    "วิธีวัดไซซ์แหวนด้วยตัวเองที่บ้านด้วยกระดาษกับไม้บรรทัด อ่านค่าเป็นมิลลิเมตรแล้วได้เบอร์ไทยเลย พร้อมวิธีดูไซซ์ที่เคยวัดไว้ที่ร้าน",
  alternates: { canonical: "/ring-size" },
};

export default function RingSizePage() {
  return (
    <div className="px-[18px] pt-5 pb-[130px]">
      <h1 className="font-serif text-[24px] leading-[1.5] text-ink">
        วัดไซซ์นิ้วเองที่บ้าน
      </h1>
      <p className="mt-[10px] text-[13.5px] leading-[1.9] text-body">
        ร้านใช้เบอร์ไทย {RING_SIZE_MIN}–{RING_SIZE_MAX}{" "}
        ซึ่งอ้างอิงเส้นรอบวงนิ้วเป็นมิลลิเมตร วัดตอนเย็นจะแม่นกว่าตอนเช้าเพราะนิ้วขยายเต็มที่แล้ว
      </p>

      <ol>
        {RING_STEPS.map((s) => (
          <li key={s.n} className="mt-[18px] flex gap-3">
            <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-ink text-[12.5px] text-[#f5f1ea]">
              {s.n}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] text-ink">{s.title}</div>
              <p className="mt-1 text-[13px] leading-[1.85] text-body">{s.body}</p>
              <Media
                image={placeholderImage(s.shot, `${s.title} — ${s.body}`)}
                aspect="aspect-video"
                className="mt-[10px] rounded-[12px]"
                sizes="(max-width: 430px) 100vw, 400px"
              />
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 rounded-[14px] bg-panel p-4">
        <div className="text-[14px] text-ink">เคยวัดที่ร้านแล้ว</div>
        <p className="mt-1.5 text-[13px] leading-[1.8] text-body">
          ไซซ์ที่วัดไว้ทุกครั้งเก็บอยู่ในบัญชีลูกค้า เปิดดูได้ผ่านไลน์ของร้าน
        </p>
        {/* The customer portal is the separate CRM app (CLAUDE.md), not this site. */}
        <a
          href="https://app.ruedeejewelry.com/sizes"
          className="mt-3 inline-block rounded-full border border-[#ddd4c5] bg-card px-4 py-[10px] text-[13px] text-[#3a332c]"
        >
          เปิดประวัติไซซ์นิ้วของฉัน
        </a>
      </div>
    </div>
  );
}
