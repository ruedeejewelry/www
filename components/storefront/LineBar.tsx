"use client";

import { useChatTarget } from "@/components/storefront/ChatContext";
import { useToast } from "@/components/ui/Toast";
import { lineMessages, lineUrl } from "@/lib/line";

/**
 * Copy the SKU before opening LINE. Prefilled text does not survive every
 * in-app browser, so the code is on the clipboard either way and the toast
 * tells the customer it is there (§5).
 */
export async function openChat(text: string, copy: string | null) {
  if (copy && typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(copy);
    } catch {
      /* clipboard blocked — the prefilled link still carries the code */
    }
  }
  window.open(lineUrl(text), "_blank", "noopener,noreferrer");
}

export function LineBar() {
  const { sku } = useChatTarget();
  const toast = useToast();

  const label = sku ? `ทักถามเรื่อง ${sku}` : "ทักแชทร้าน";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center">
      <div className="pointer-events-auto flex w-full max-w-[430px] gap-[9px] bg-gradient-to-t from-paper from-[62%] to-transparent px-4 pt-3 pb-[22px] md:max-w-[768px]">
        <button
          type="button"
          onClick={() => {
            void openChat(
              sku ? lineMessages.product(sku) : lineMessages.shop(),
              sku,
            );
            toast.show(
              sku
                ? `คัดลอกรหัส ${sku} แล้ว วางในแชทได้เลย`
                : "เปิดไลน์ร้านฤดีจิวเวลรี่",
            );
          }}
          className="min-h-[50px] flex-1 rounded-[13px] bg-line text-[15px] font-semibold text-white"
        >
          {label}
        </button>
        {sku ? (
          <button
            type="button"
            onClick={() => {
              void openChat(lineMessages.resize(sku), sku);
              toast.show(`เปิดไลน์พร้อมข้อความ "สนใจ ${sku} แต่อยากได้ไซซ์อื่นค่ะ"`);
            }}
            className="min-h-[50px] shrink-0 rounded-[13px] border border-[#d9d0c2] bg-card px-[14px] text-left text-[12.5px] leading-[1.35] text-[#3a332c]"
          >
            อยากได้
            <br />
            ไซซ์อื่น
          </button>
        ) : null}
      </div>
    </div>
  );
}
