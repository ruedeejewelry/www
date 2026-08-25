"use client";

import Link from "next/link";
import { openChat } from "@/components/storefront/LineBar";
import { Media } from "@/components/ui/Media";
import { useToast } from "@/components/ui/Toast";
import { baht } from "@/lib/format";
import { useFavorites } from "@/lib/favorites";
import { lineMessages } from "@/lib/line";
import type { Product } from "@/types/db";

export function FavoritesList({ products }: { products: Product[] }) {
  const { skus, ready, remove } = useFavorites();
  const toast = useToast();

  const items = skus
    .map((sku) => products.find((p) => p.sku === sku))
    .filter((p): p is Product => Boolean(p));

  // Nothing renders until localStorage has been read, so the list never flashes
  // "empty" for someone who has saved pieces.
  if (!ready) return <div className="h-40" />;

  if (items.length === 0) {
    return (
      <div className="mt-4 rounded-[14px] border border-dashed border-[#ded6c8] px-[18px] py-[26px] text-center text-[13.5px] leading-[1.85] text-body">
        ยังไม่มีชิ้นที่ถูกใจ
        <br />
        กดรูปหัวใจในหน้าสินค้าเพื่อเก็บไว้เทียบกัน
      </div>
    );
  }

  const total = items.reduce((t, p) => t + p.price, 0);

  return (
    <div>
      <p className="mt-2 text-[12.5px] text-muted">
        เก็บไว้ในเครื่องนี้ ส่งทั้งรายการเข้าไลน์ทีเดียวได้
      </p>

      {items.map((p) => (
        <div
          key={p.sku}
          className="mt-[14px] flex items-center gap-[11px] rounded-[14px] border border-rule bg-card p-[11px]"
        >
          <Link
            href={`/jewelry/${p.sku.toLowerCase()}`}
            className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[10px]"
          >
            <Media
              image={p.images[0] ?? null}
              aspect="aspect-square"
              sizes="72px"
              fallbackLabel={`รูป ${p.sku}`}
            />
          </Link>
          <Link href={`/jewelry/${p.sku.toLowerCase()}`} className="flex-1">
            <div className="font-mono text-[10.5px] text-muted">{p.sku}</div>
            <div className="mt-0.5 text-[13px] leading-[1.5] text-ink">{p.name}</div>
            <div className="mt-0.5 text-[13.5px] font-semibold text-ink">
              {baht(p.price)}
            </div>
          </Link>
          <button
            type="button"
            aria-label={`เอา ${p.sku} ออก`}
            onClick={() => remove(p.sku)}
            className="h-11 w-11 shrink-0 rounded-full border border-border bg-card text-[15px] text-muted"
          >
            ×
          </button>
        </div>
      ))}

      <div className="mt-4 text-[13px] text-body">รวม {baht(total)}</div>

      <button
        type="button"
        onClick={() => {
          const list = items.map((p) => p.sku);
          void openChat(lineMessages.wishlist(list), list.join(" "));
          toast.show(`คัดลอกรหัส ${list.length} ชิ้นแล้ว วางในแชทได้เลย`);
        }}
        className="mt-4 min-h-[50px] w-full rounded-[13px] bg-line text-[15px] font-semibold text-white"
      >
        ส่งรายการนี้เข้าไลน์
      </button>
    </div>
  );
}
