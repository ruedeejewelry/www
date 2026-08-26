import Image from "next/image";
import Link from "next/link";
import { FOOTER_GROUPS, FOOTER_TAGLINE } from "@/lib/data/content";
import { telHref } from "@/lib/line";
import { SITE } from "@/lib/site";

/**
 * The close of every page: who the shop is, then its map, then how to reach a
 * person. Sits on the panel tone so it reads as a distinct region rather than
 * as more page content — links stacked in one flat column are a list, not a
 * footer.
 *
 * Two columns at 390px because the labels are short Thai phrases; the group
 * headings carry the structure, so the eye can skip to the right one instead of
 * reading eleven links in a row.
 */
export function Footer() {
  return (
    <footer className="mt-12 bg-panel px-[18px] pt-8 pb-[130px]">
      <div className="flex items-center gap-[10px]">
        <Image
          src="/ruedee-mark.webp"
          alt=""
          width={34}
          height={27}
          className="h-[27px] w-auto"
        />
        <span className="font-serif text-[17px] tracking-[.02em] text-ink">
          {SITE.name}
        </span>
      </div>
      <p className="mt-2.5 max-w-[300px] text-[12.5px] leading-[1.8] text-body">
        {FOOTER_TAGLINE}
      </p>

      <nav
        aria-label="แผนผังเว็บไซต์"
        className="mt-7 grid grid-cols-2 gap-x-4 gap-y-7 md:grid-cols-4"
      >
        {FOOTER_GROUPS.map((group) => (
          <div key={group.title}>
            <h2 className="text-[11.5px] tracking-[.06em] text-muted">
              {group.title}
            </h2>
            <ul className="mt-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block py-[6px] text-[13px] leading-[1.5] text-body hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-8 border-t border-[#e2dacc] pt-5">
        <div className="text-[13px] leading-[1.9] text-body">
          {SITE.street}
          <br />
          <a href={telHref} className="text-ink">
            โทร {SITE.phone}
          </a>
          <span className="text-muted"> · แชต LINE คุณจันตอบเองทุกข้อความ</span>
        </div>
        <p className="mt-4 text-[11px] text-faint">
          © 2025 {SITE.name}
        </p>
      </div>
    </footer>
  );
}
