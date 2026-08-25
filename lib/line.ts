import { SITE } from "@/lib/site";

/**
 * Every path into the chat has to say which piece the customer is looking at
 * (CLAUDE-storefront.md §5). There is no context-free "chat with us" button
 * anywhere on this site — build links through these helpers only.
 */

function oaMessageUrl(text: string): string {
  // SITE.lineId is normalised in lib/site.ts and always carries its "@".
  return `https://line.me/R/oaMessage/${encodeURIComponent(SITE.lineId)}/?${encodeURIComponent(text)}`;
}

export const lineMessages = {
  product: (sku: string) => `สนใจ ${sku} ค่ะ`,
  resize: (sku: string) => `สนใจ ${sku} แต่อยากได้ไซซ์อื่นค่ะ`,
  reorder: (sku: string) => `อยากสั่งทำแบบ ${sku} ค่ะ`,
  custom: () => "อยากได้งานสั่งทำค่ะ",
  shop: () => "สอบถามค่ะ",
  wishlist: (skus: string[]) =>
    `สนใจชิ้นเหล่านี้ค่ะ ${skus.join(" ")}`,
};

export function lineUrl(text: string): string {
  return oaMessageUrl(text);
}

/** Phone stays a secondary channel; the CTA is always LINE (§5). */
export const telHref = `tel:${SITE.phone.replace(/-/g, "")}`;
