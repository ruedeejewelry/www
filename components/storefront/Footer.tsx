import Link from "next/link";
import { FOOTER_LINKS } from "@/lib/data/content";
import { SITE } from "@/lib/site";

/**
 * Every page ends here. It used to live on the home page only, which left nine
 * of the fifteen pages with no way out but the back button — bad for customers
 * and bad for Google, which follows internal links to decide what matters.
 *
 * The bottom padding clears the floating LINE bar.
 */
export function Footer() {
  return (
    <footer className="flex flex-col gap-0.5 px-[18px] pt-7 pb-[130px]">
      <div className="mb-4 h-px bg-rule" />
      {FOOTER_LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="py-[9px] text-[13.5px] text-body"
        >
          {l.label}
        </Link>
      ))}
      <p className="mt-[14px] text-[11.5px] leading-[1.7] text-faint">
        © 2025 {SITE.name} · ตลาดพลอยจันทบุรี
        <br />
        โทร {SITE.phone} · แชต LINE ตอบเองทุกข้อความ
      </p>
    </footer>
  );
}
