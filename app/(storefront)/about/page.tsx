import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ABOUT_PILLARS,
  ABOUT_QUOTE,
  ABOUT_SECTIONS,
  type Run,
  SHOP_INFO,
} from "@/lib/data/content";
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
  image: `${SITE.url}/hero.jpg`,
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

/** Lead paragraph, with the phrases that carry the trust lifted into gold. */
function Lead({ runs }: { runs: Run[] }) {
  return (
    <p className="mt-3 text-[14px] leading-[1.95] text-body">
      {runs.map((run, i) =>
        run.em ? (
          <em key={i} className="text-gold not-italic">
            {run.t}
          </em>
        ) : (
          <span key={i}>{run.t}</span>
        ),
      )}
    </p>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-serif text-[22px] leading-[1.5] text-ink italic">
      {children}
    </h2>
  );
}

/** Photos carry this page, so they get a soft lift off the paper. */
const frame =
  "overflow-hidden rounded-[14px] shadow-[0_2px_18px_rgba(36,31,26,.08)]";

export default function AboutPage() {
  const [named, chanthaburi, shop] = ABOUT_SECTIONS;

  return (
    <div className="pt-6 pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />

      <h1 className="px-[18px] font-serif text-[26px] leading-[1.45] text-ink italic">
        บ้านนี้ทำอัญมณีกันสามรุ่น
      </h1>

      <section className="mt-9 px-[18px]">
        <Heading>{named.heading}</Heading>
        <Lead runs={named.lead} />
        <div className={`mt-6 ${frame}`}>
          <Image
            src="/hero.jpg"
            alt="คุณแม่ฤดีและคุณจันที่โต๊ะทำงานในร้าน มีเครื่องประดับวางอยู่ตรงหน้า"
            width={1400}
            height={933}
            sizes="(max-width: 430px) 100vw, 768px"
            priority
            className="h-auto w-full"
          />
        </div>
      </section>

      <section className="mt-12 px-[18px]">
        <Heading>{chanthaburi.heading}</Heading>
        <Lead runs={chanthaburi.lead} />
        <div className="mt-6 grid gap-4 md:grid-cols-2 md:items-stretch">
          <div className={frame}>
            <Image
              src="/pair.jpg"
              alt="คุณจันกับคุณแม่ฤดีคัดพลอยจากถาดทับทิมด้วยกัน"
              width={700}
              height={817}
              sizes="(max-width: 430px) 100vw, 380px"
              className="h-auto w-full"
            />
          </div>
          <blockquote className="flex flex-col items-center justify-center rounded-[14px] border border-rule bg-card px-6 py-10 text-center">
            <p className="font-serif text-[21px] leading-[1.6] text-ink italic">
              {ABOUT_QUOTE.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
            <footer className="mt-4 text-[13px] leading-[1.8] text-body">
              {ABOUT_QUOTE.note.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </footer>
          </blockquote>
        </div>
      </section>

      <section className="mt-12 px-[18px]">
        <Heading>{shop.heading}</Heading>
        <Lead runs={shop.lead} />
        <div className="mt-6 grid grid-cols-3 gap-3">
          {ABOUT_PILLARS.map((pillar) => (
            <figure key={pillar.src}>
              <div className={frame}>
                <Image
                  src={pillar.src}
                  alt={pillar.alt}
                  width={700}
                  height={700}
                  sizes="(max-width: 430px) 33vw, 240px"
                  className="h-auto w-full"
                />
              </div>
              <figcaption className="mt-3 text-center font-serif text-[12px] leading-[1.75] text-body italic">
                {pillar.caption.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mt-12 px-[18px]">
        <div className="overflow-hidden rounded-[14px] border border-rule bg-card">
          {SHOP_INFO.map((row) => (
            <div
              key={row.label}
              className="flex justify-between gap-[14px] border-b border-rule-soft px-[14px] py-[11px] text-[13px] last:border-b-0"
            >
              <span className="text-muted">{row.label}</span>
              <span className="text-right text-ink">{row.value}</span>
            </div>
          ))}
        </div>
        <Link
          href="/custom-order"
          className="mt-4 block rounded-[14px] bg-ink p-[18px] text-[#f0e9dc]"
        >
          <span className="font-serif text-[17px] leading-[1.5] italic">
            อยากได้แบบที่ยังไม่มีในเว็บ
          </span>
          <span className="mt-[7px] block text-[12.5px] leading-[1.8] text-[#b7ad9d]">
            งานสั่งทำคืองานหลักของร้าน คุยกับคุณจันได้โดยตรง
          </span>
          <span className="mt-[11px] block text-[13px] text-gold-bright">
            ดูขั้นตอนงานสั่งทำ →
          </span>
        </Link>
      </section>
    </div>
  );
}
