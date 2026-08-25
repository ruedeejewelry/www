import Image from "next/image";
import type { ProductImage } from "@/types/db";

type Props = {
  image: ProductImage | null;
  /** Tailwind aspect class, e.g. "aspect-square". Space is always reserved. */
  aspect: string;
  className?: string;
  sizes: string;
  /** Only the first above-the-fold image on a page should set this. */
  priority?: boolean;
  /** Overrides the placeholder caption when there is no photo yet. */
  fallbackLabel?: string;
};

/**
 * One image slot. Renders the photo when the shop has uploaded one, and the
 * hatched placeholder carrying a Thai description of the missing shot when it
 * has not. The box is the same size either way, so nothing shifts when photos
 * land later — this is what keeps CLS inside the budget (§7).
 */
export function Media({
  image,
  aspect,
  className = "",
  sizes,
  priority = false,
  fallbackLabel,
}: Props) {
  const label = image?.placeholder ?? fallbackLabel ?? "รูปสินค้า";

  if (!image?.url) {
    return (
      <div
        className={`dc-placeholder relative flex items-end overflow-hidden ${aspect} ${className}`}
      >
        <span className="p-2 font-mono text-[9.5px] leading-[1.3] text-muted">
          {label}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${aspect} ${className}`}>
      <Image
        src={image.url}
        alt={image.alt}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        placeholder={image.blurDataUrl ? "blur" : "empty"}
        blurDataURL={image.blurDataUrl ?? undefined}
        className="object-cover"
      />
    </div>
  );
}
