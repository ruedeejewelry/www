"use client";

import { useToast } from "@/components/ui/Toast";
import { useFavorites } from "@/lib/favorites";

export function FavoriteButton({ sku }: { sku: string }) {
  const { skus, toggle } = useFavorites();
  const toast = useToast();
  const saved = skus.includes(sku);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `เอา ${sku} ออกจากชิ้นที่ถูกใจ` : `เก็บ ${sku} ไว้ในชิ้นที่ถูกใจ`}
      onClick={() => {
        const added = toggle(sku);
        toast.show(
          added
            ? `เก็บ ${sku} ไว้ในชิ้นที่ถูกใจ`
            : `เอา ${sku} ออกจากรายการที่ถูกใจ`,
        );
      }}
      className={`h-[46px] w-[46px] shrink-0 rounded-full border text-[18px] leading-none ${
        saved
          ? "border-ink bg-ink text-[#e8bf76]"
          : "border-border bg-card text-[#c9bda9]"
      }`}
    >
      ♥
    </button>
  );
}
