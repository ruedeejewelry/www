"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { ProductCard } from "@/components/storefront/ProductCard";
import { openChat } from "@/components/storefront/LineBar";
import { useToast } from "@/components/ui/Toast";
import { criteriaFromParams, filterProducts, hasAnyFilter } from "@/lib/filter";
import { lineMessages } from "@/lib/line";
import { PRICE_BANDS, STONES, TYPES } from "@/lib/site";
import type { Product } from "@/types/db";

/*
  Filters live in the URL as query params so a link can be shared, the back
  button works, and staff can send a customer a link to exactly the result set
  they described (§6). The whole catalogue is handed over once by the server and
  filtered here — no fetch, no reload.
*/

const STATUSES = [
  { key: "available", label: "มีของ" },
  { key: "sold", label: "ขายแล้ว" },
] as const;

function chipClass(active: boolean) {
  return [
    "shrink-0 rounded-full border px-[13px] py-[7px] text-[12.5px]",
    active
      ? "border-ink bg-ink text-[#f5f1ea]"
      : "border-border bg-card text-[#3a332c]",
  ].join(" ");
}

export function Catalog({
  products,
  title,
}: {
  products: Product[];
  title: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const toast = useToast();

  const search = params.toString();
  const criteria = useMemo(
    () => criteriaFromParams(new URLSearchParams(search)),
    [search],
  );
  const { types, stones, price, status, query } = criteria;

  const apply = useCallback(
    (next: URLSearchParams) => {
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const toggleList = (key: string, value: string, current: string[]) => {
    const next = new URLSearchParams(params.toString());
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    if (updated.length) next.set(key, updated.join(","));
    else next.delete(key);
    apply(next);
  };

  const toggleOne = (key: string, value: string, current: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (current === value) next.delete(key);
    else next.set(key, value);
    apply(next);
  };

  const setQuery = (value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value.trim()) next.set("q", value.trim());
    else next.delete("q");
    apply(next);
  };

  const results = useMemo(
    () => filterProducts(products, criteria),
    [products, criteria],
  );

  const hasFilters = hasAnyFilter(criteria);

  return (
    <div>
      <div className="px-[18px] pt-4">
        <h1 className="font-serif text-[21px] text-ink">{title}</h1>
        <div className="relative mt-3">
          <label htmlFor="sku-search" className="sr-only">
            ค้นด้วยรหัสสินค้า
          </label>
          <input
            id="sku-search"
            type="search"
            defaultValue={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นด้วยรหัสสินค้า เช่น RG126"
            className="h-11 w-full rounded-[11px] border border-border bg-card px-[14px] text-[13.5px] text-ink outline-none"
          />
        </div>
      </div>

      <div className="sticky top-[52px] z-15 mt-3 border-b border-rule bg-paper/95 pt-3 pb-[10px] backdrop-blur-[8px]">
        <div className="no-scrollbar flex gap-[7px] overflow-x-auto px-[18px] pb-2">
          {TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              aria-pressed={types.includes(t.key)}
              onClick={() => toggleList("type", t.key, types)}
              className={chipClass(types.includes(t.key))}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="no-scrollbar flex gap-[7px] overflow-x-auto px-[18px]">
          {STONES.map((s) => (
            <button
              key={s.key}
              type="button"
              aria-pressed={stones.includes(s.key)}
              onClick={() => toggleList("stone", s.key, stones)}
              className={chipClass(stones.includes(s.key))}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="no-scrollbar flex gap-[7px] overflow-x-auto px-[18px] pt-2">
          {PRICE_BANDS.map((b) => (
            <button
              key={b.key}
              type="button"
              aria-pressed={price === b.key}
              onClick={() => toggleOne("price", b.key, price)}
              className={chipClass(price === b.key)}
            >
              {b.label}
            </button>
          ))}
          {STATUSES.map((s) => (
            <button
              key={s.key}
              type="button"
              aria-pressed={status === s.key}
              onClick={() => toggleOne("status", s.key, status)}
              className={chipClass(status === s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between px-[18px] pt-3 pb-[10px]">
        <div className="text-[12.5px] text-body-soft">
          {results.length} ชิ้น
          {hasFilters ? " · ตัวกรองอยู่ใน URL แชร์ลิงก์ได้" : ""}
        </div>
        {hasFilters ? (
          <button
            type="button"
            onClick={() => router.replace(pathname, { scroll: false })}
            className="text-[12.5px] text-gold"
          >
            ล้างตัวกรอง
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-[14px] px-[18px] md:grid-cols-3">
        {results.map((p, i) => (
          <ProductCard key={p.sku} product={p} priority={i < 2} />
        ))}
      </div>

      {results.length === 0 ? (
        <div className="mx-[18px] my-2 rounded-[14px] border border-dashed border-[#ded6c8] px-[18px] py-[26px] text-center">
          <p className="text-[13.5px] leading-[1.8] text-body">
            ไม่มีชิ้นที่ตรงเงื่อนไขนี้ตอนนี้
            <br />
            ทักบอกสิ่งที่อยากได้ เราหาพลอยให้ได้
          </p>
          <button
            type="button"
            onClick={() => {
              void openChat(lineMessages.custom(), null);
              toast.show('เปิดไลน์พร้อมข้อความ "อยากได้งานสั่งทำค่ะ"');
            }}
            className="mt-[14px] rounded-full bg-line px-5 py-[11px] text-[13.5px] text-white"
          >
            ทักบอกแบบที่อยากได้
          </button>
        </div>
      ) : null}

      <div className="h-[130px]" />
    </div>
  );
}
