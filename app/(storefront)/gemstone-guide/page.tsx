import type { Metadata } from "next";
import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { getArticles } from "@/lib/data/articles";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "ความรู้เรื่องพลอย — เขียนจากตลาดพลอยจันทบุรี",
  description:
    "ไพลินเผากับไม่เผา อ่านใบเซอร์ GIA และ HRD สีไพลินแบบไหนราคาสูง ทอง 90 กับ 18K และการไปตลาดพลอยจันทบุรีครั้งแรก",
  alternates: { canonical: "/gemstone-guide" },
};

export default async function GuideIndexPage() {
  const articles = await getArticles();

  return (
    <div className="px-[18px] pt-5 pb-[130px]">
      <h1 className="font-serif text-[24px] leading-[1.5] text-ink">
        ความรู้เรื่องพลอย
      </h1>
      <p className="mt-[10px] text-[13.5px] leading-[1.9] text-body">
        เขียนจากประสบการณ์ที่ตลาดพลอยจันทบุรี ไม่ได้ลอกจากที่อื่น
      </p>

      <div className="mt-4">
        {articles.map((a) => (
          <Link
            key={a.slug}
            href={`/gemstone-guide/${a.slug}`}
            className="flex items-center gap-3 border-b border-rule py-[14px]"
          >
            <Media
              image={a.cover}
              aspect="aspect-square"
              className="h-16 w-16 shrink-0 rounded-[10px]"
              sizes="64px"
            />
            <div className="flex-1">
              <div className="text-[13.5px] leading-[1.55] text-ink">{a.title}</div>
              <div className="mt-1 text-[12px] leading-[1.6] text-muted">
                {a.excerpt}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
