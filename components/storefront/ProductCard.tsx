import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { baht, metaShort } from "@/lib/format";
import type { Product } from "@/types/db";

/**
 * One card is always exactly one piece (§4). Price is on the card — the
 * customer never has to open the page to find out what something costs.
 */
export function ProductCard({
  product,
  priority = false,
  compact = false,
}: {
  product: Product;
  priority?: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={`/jewelry/${product.sku.toLowerCase()}`}
      className="flex flex-col gap-[7px] text-left"
    >
      <div className="relative">
        <Media
          image={product.images[0] ?? null}
          aspect="aspect-square"
          className="rounded-[12px]"
          sizes="(max-width: 430px) 50vw, 240px"
          priority={priority}
          fallbackLabel={`รูป ${product.sku}`}
        />
        {product.sold ? (
          <span className="absolute top-2 left-2 rounded-full bg-ink/[.82] px-[9px] py-[3px] text-[10.5px] text-[#f5f1ea]">
            ขายแล้ว
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-[2px]">
        {!compact ? (
          <div className="font-mono text-[11px] tracking-[.03em] text-muted">
            {product.sku}
          </div>
        ) : null}
        <div
          className={`leading-[1.5] text-ink ${compact ? "text-[12.5px]" : "text-[13px]"}`}
        >
          {product.name}
        </div>
        <div
          className={`font-semibold text-ink ${compact ? "text-[13.5px]" : "mt-px text-[14px]"}`}
        >
          {baht(product.price)}
        </div>
        {!compact ? (
          <div className="text-[11.5px] text-muted">{metaShort(product)}</div>
        ) : null}
      </div>
    </Link>
  );
}
