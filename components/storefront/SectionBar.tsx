"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/*
  The pages that earn trust, one tap from anywhere. Before this, a customer
  arriving from LINE onto a product page could not reach the custom-order page
  at all without going back to the home page and scrolling to the bottom — and
  custom work is the shop's main business.

  Deliberately not sticky: the catalogue's filter row already pins itself under
  the header, and two stacked sticky bars would eat a third of a phone screen.
*/
const SECTIONS = [
  { href: "/custom-order", label: "งานสั่งทำ" },
  { href: "/portfolio", label: "ผลงานที่ทำมา" },
  { href: "/gemstone-guide", label: "ความรู้พลอย" },
  { href: "/reviews", label: "รีวิวลูกค้า" },
  { href: "/about", label: "เรื่องของร้าน" },
];

export function SectionBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="หมวดหลัก"
      className="no-scrollbar flex gap-[7px] overflow-x-auto border-b border-rule px-[18px] py-[10px]"
    >
      {SECTIONS.map((s) => {
        const active = pathname === s.href || pathname.startsWith(`${s.href}/`);
        return (
          <Link
            key={s.href}
            href={s.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 rounded-full border px-[13px] py-[7px] text-[12.5px] ${
              active
                ? "border-ink bg-ink text-[#f5f1ea]"
                : "border-border bg-card text-[#3a332c]"
            }`}
          >
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}
