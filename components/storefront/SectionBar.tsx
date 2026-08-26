"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/*
  The few destinations worth one tap from anywhere. Text tabs with an underline,
  deliberately NOT the pill shape used by the catalogue's filters — those are
  toggles that change what you are looking at, these move you somewhere else.
  Giving both jobs the same shape put four rows of identical pills on /jewelry
  and made neither read as what it is.

  Not sticky: the filter row already pins under the header, and two stacked
  bars would eat a third of a phone screen for chrome.
*/
const SECTIONS = [
  { href: "/jewelry", label: "เครื่องประดับ" },
  { href: "/custom-order", label: "งานสั่งทำ" },
  { href: "/portfolio", label: "ผลงาน" },
  { href: "/gemstone-guide", label: "ความรู้พลอย" },
  { href: "/about", label: "เรื่องของร้าน" },
];

/** Breathing room left beside the active tab when it is scrolled into view. */
const EDGE_GAP = 18;

export function SectionBar() {
  const pathname = usePathname();
  const bar = useRef<HTMLElement>(null);
  const activeTab = useRef<HTMLAnchorElement>(null);

  /*
    Five tabs do not fit across 390px, so the one you are on can start off
    screen and the bar looks like nothing is selected.

    Done by hand rather than with scrollIntoView, which moves the minimum
    distance and leaves the tab flush against the screen edge — and which would
    also scroll the page vertically, pushing the heading out of sight.
  */
  useEffect(() => {
    const nav = bar.current;
    const tab = activeTab.current;
    if (!nav || !tab) return;

    const left = tab.offsetLeft - EDGE_GAP;
    const right = tab.offsetLeft + tab.offsetWidth + EDGE_GAP;

    if (right > nav.scrollLeft + nav.clientWidth) {
      nav.scrollLeft = right - nav.clientWidth;
    } else if (left < nav.scrollLeft) {
      nav.scrollLeft = left;
    }
  }, [pathname]);

  return (
    <nav
      ref={bar}
      aria-label="หมวดหลัก"
      className="no-scrollbar flex gap-6 overflow-x-auto border-b border-rule pl-[18px]"
    >
      {SECTIONS.map((s) => {
        const active = pathname === s.href || pathname.startsWith(`${s.href}/`);
        return (
          <Link
            key={s.href}
            href={s.href}
            ref={active ? activeTab : undefined}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 border-b-2 py-[11px] text-[13px] whitespace-nowrap ${
              active
                ? "border-gold text-ink"
                : "border-transparent text-body-soft"
            }`}
          >
            {s.label}
          </Link>
        );
      })}
      {/*
        A flex scroll container collapses its right padding, so the last tab
        ends flush against the screen edge. This holds the gap open.
      */}
      <span aria-hidden="true" className="w-[18px] shrink-0" />
    </nav>
  );
}
