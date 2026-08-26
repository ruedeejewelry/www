"use client";

import Image from "next/image";
import Link from "next/link";
import { useFavorites } from "@/lib/favorites";

/*
  Two things only: home, and the saved pieces.

  There is no back button. It came from the prototype, which drew a phone with
  no browser around it, so a screen had to supply its own way back. On the real
  web the phone already has one — Android's gesture, Safari's edge swipe, and
  the arrow in LINE's in-app browser.

  Worse, it broke in the case that matters most here. router.back() walks
  browser history, not the site's structure, and almost every visitor arrives on
  a single link from LINE or Instagram with no history behind it. The button
  would have done nothing at all, or thrown them out of the site. Going up a
  level is the tab row's job, and it names where it is taking you.
*/
export function Header() {
  const { skus, ready } = useFavorites();

  return (
    <header className="sticky top-0 z-20 border-b border-rule bg-paper/95 backdrop-blur-[8px]">
      <div className="mx-auto flex h-[52px] w-full max-w-[430px] items-center px-[18px] md:max-w-[768px]">
        {/*
          The monogram alone, not the full lockup: the header is 52px tall and
          the stacked wordmark would be unreadable at that size. Fixed
          dimensions keep the row from shifting while it loads.
        */}
        <Link
          href="/"
          aria-label="Ruedee Jewelry หน้าแรก"
          className="flex items-center"
        >
          <Image
            src="/ruedee-mark.webp"
            alt="Ruedee Jewelry"
            width={38}
            height={30}
            priority
            className="h-[30px] w-auto"
          />
        </Link>
        <div className="flex-1" />
        <Link
          href="/favorites"
          aria-label="ชิ้นที่ถูกใจ"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-[15px] leading-none text-gold"
        >
          ♥
          {ready && skus.length > 0 ? (
            <span className="absolute -top-1 -right-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-ink px-1 text-[10px] text-[#f5f1ea]">
              {skus.length}
            </span>
          ) : null}
        </Link>
      </div>
    </header>
  );
}
