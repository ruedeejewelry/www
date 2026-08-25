"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useFavorites } from "@/lib/favorites";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { skus, ready } = useFavorites();
  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-20 border-b border-rule bg-paper/95 backdrop-blur-[8px]">
      <div className="mx-auto flex h-[52px] w-full max-w-[430px] items-center gap-[10px] px-[14px] md:max-w-[768px]">
        {!isHome ? (
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="ย้อนกลับ"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-[16px] leading-none text-ink"
          >
            ←
          </button>
        ) : null}
        <Link
          href="/"
          className="font-serif text-[19px] tracking-[.02em] text-ink"
        >
          Ruedee
        </Link>
        <div className="flex-1" />
        <Link
          href="/jewelry"
          className="rounded-full border border-border bg-card px-[13px] py-[7px] text-[12.5px] text-[#3a332c]"
        >
          ดูสินค้าทั้งหมด
        </Link>
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
