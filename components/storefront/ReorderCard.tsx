"use client";

import { openChat } from "@/components/storefront/LineBar";
import { Media } from "@/components/ui/Media";
import { useToast } from "@/components/ui/Toast";
import { lineMessages } from "@/lib/line";
import { metaShort } from "@/lib/format";
import type { Product } from "@/types/db";

/**
 * Portfolio card. A sold piece is not a dead end — it is the menu for ordering
 * the same thing again, so the whole card opens the chat with that SKU (§4).
 */
export function ReorderCard({ product }: { product: Product }) {
  const toast = useToast();

  return (
    <button
      type="button"
      onClick={() => {
        void openChat(lineMessages.reorder(product.sku), product.sku);
        toast.show(`เปิดไลน์พร้อมข้อความ "อยากสั่งทำแบบ ${product.sku} ค่ะ"`);
      }}
      className="flex flex-col gap-[7px] text-left"
    >
      <Media
        image={product.images[0] ?? null}
        aspect="aspect-square"
        className="rounded-[12px]"
        sizes="(max-width: 430px) 50vw, 240px"
        fallbackLabel={`รูป ${product.sku}`}
      />
      <div>
        <div className="text-[13px] leading-[1.5] text-ink">{product.name}</div>
        <div className="mt-0.5 text-[11.5px] text-muted">{metaShort(product)}</div>
        <div className="mt-1 text-[12.5px] text-gold">สั่งทำแบบนี้</div>
      </div>
    </button>
  );
}
