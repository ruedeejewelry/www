import type { Metadata } from "next";
import { Media } from "@/components/ui/Media";
import { placeholderImage } from "@/lib/data/images";
import { ABOUT_PARAGRAPHS, SHOP_INFO } from "@/lib/data/content";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "เรื่องของร้าน — บ้านนี้ทำอัญมณีกันสามรุ่น",
  description:
    "Ruedee Jewelry มาจากชื่อคุณแม่ฤดี บ้านนี้ทำอัญมณีกันมาตั้งแต่รุ่นปู่ย่า ออกแบบเองและให้ช่างมือดีของบ้านเป็นคนทำ ร้านอยู่ที่ตลาดพลอยจันทบุรี",
  alternates: { canonical: "/about" },
};

/** LocalBusiness data — the shop is in Chanthaburi and says so plainly (§8). */
const localBusiness = {
  "@context": "https://schema.org",
  "@type": "JewelryStore",
  name: SITE.name,
  alternateName: SITE.nameTh,
  url: SITE.url,
  telephone: SITE.phone,
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.street,
    addressLocality: SITE.locality,
    addressRegion: SITE.region,
    addressCountry: SITE.country,
  },
  description:
    "ร้านเพชรพลอยและงานสั่งทำ ที่ตลาดพลอยจันทบุรี ออกแบบเองและทำโดยช่างของบ้าน",
};

export default function AboutPage() {
  return (
    <div className="px-[18px] pt-5 pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />
      <h1 className="font-serif text-[24px] leading-[1.5] text-ink">
        บ้านนี้ทำอัญมณีกันสามรุ่น
      </h1>

      <Media
        image={placeholderImage(
          "รูปคุณแม่ฤดีกับจันที่หน้าร้าน",
          "คุณแม่ฤดีและคุณจันที่หน้าร้านในตลาดพลอยจันทบุรี",
        )}
        aspect="aspect-[4/3]"
        className="mt-4 rounded-[14px]"
        sizes="(max-width: 430px) 100vw, 430px"
        priority
      />

      {ABOUT_PARAGRAPHS.map((p) => (
        <p key={p} className="mt-4 text-[13.5px] leading-[1.95] text-body">
          {p}
        </p>
      ))}

      <div className="mt-[22px] overflow-hidden rounded-[14px] border border-rule bg-card">
        {SHOP_INFO.map((row) => (
          <div
            key={row.label}
            className="flex justify-between gap-[14px] border-b border-rule-soft px-[14px] py-[11px] text-[13px]"
          >
            <span className="text-muted">{row.label}</span>
            <span className="text-right text-ink">{row.value}</span>
          </div>
        ))}
      </div>

      <Media
        image={placeholderImage(
          "แผนที่ร้าน / รูปหน้าร้าน",
          "แผนที่และหน้าร้าน Ruedee Jewelry ที่ตลาดพลอยจันทบุรี",
        )}
        aspect="aspect-video"
        className="mt-[14px] rounded-[14px]"
        sizes="(max-width: 430px) 100vw, 430px"
      />
    </div>
  );
}
