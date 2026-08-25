"use client";

import { useState } from "react";
import { Media } from "@/components/ui/Media";
import type { ProductImage } from "@/types/db";

/**
 * Main shot plus the thumbnail strip. Tapping the main shot zooms it in place —
 * no carousel, no instruction text; the strip is visibly a strip (§2).
 */
export function ProductGallery({
  images,
  sku,
  sold,
}: {
  images: ProductImage[];
  sku: string;
  sold: boolean;
}) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const current = images[active] ?? images[0] ?? null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setZoomed((z) => !z)}
        aria-label={zoomed ? "ย่อรูป" : "ขยายรูป"}
        className="relative block w-full overflow-hidden"
      >
        <Media
          image={current}
          aspect="aspect-square"
          sizes="(max-width: 430px) 100vw, 430px"
          priority
          fallbackLabel={`รูปหลัก ${sku} — มุมตรง ซูมได้`}
          className={
            zoomed
              ? "scale-150 transition-transform duration-200"
              : "transition-transform duration-200"
          }
        />
        {sold ? (
          <span className="absolute top-3 left-3 rounded-full bg-ink/[.82] px-[11px] py-1 text-[11.5px] text-[#f5f1ea]">
            ขายแล้ว
          </span>
        ) : null}
      </button>

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-[14px] pt-[10px]">
        {images.map((img, i) => (
          <button
            key={`${img.placeholder}-${i}`}
            type="button"
            onClick={() => {
              setActive(i);
              setZoomed(false);
            }}
            aria-label={`ดู${img.placeholder}`}
            aria-current={i === active}
            className={`h-[68px] w-[68px] shrink-0 overflow-hidden rounded-[9px] ${
              i === active ? "ring-1 ring-ink" : ""
            }`}
          >
            {img.url ? (
              <Media
                image={img}
                aspect="aspect-square"
                sizes="68px"
                className="h-full w-full"
              />
            ) : (
              <span className="dc-placeholder flex h-full w-full items-center justify-center p-1 text-center font-mono text-[8.5px] leading-[1.3] text-muted">
                {img.placeholder}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
