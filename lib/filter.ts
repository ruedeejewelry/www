import { PRICE_BANDS } from "@/lib/site";
import type { Product } from "@/types/db";

/**
 * Catalogue filtering, kept out of the component so it can be tested on its
 * own. The rules follow how people actually shop for stones (§6): kind of
 * piece, stone, price band, and whether it is still available.
 */

export type Criteria = {
  types: string[];
  stones: string[];
  price: string | null;
  status: string | null;
  query: string;
};

export const EMPTY_CRITERIA: Criteria = {
  types: [],
  stones: [],
  price: null,
  status: null,
  query: "",
};

/** Reads the criteria straight out of the URL, so links stay shareable. */
export function criteriaFromParams(params: URLSearchParams): Criteria {
  return {
    types: params.get("type")?.split(",").filter(Boolean) ?? [],
    stones: params.get("stone")?.split(",").filter(Boolean) ?? [],
    price: params.get("price"),
    status: params.get("status"),
    query: params.get("q") ?? "",
  };
}

export function hasAnyFilter(c: Criteria): boolean {
  return (
    c.types.length > 0 ||
    c.stones.length > 0 ||
    c.price !== null ||
    c.status !== null ||
    c.query.trim() !== ""
  );
}

export function filterProducts(
  products: Product[],
  criteria: Criteria,
): Product[] {
  const raw = criteria.query.trim();
  const q = raw.toLowerCase();

  return products.filter((p) => {
    // Customers arrive from Instagram with a code in their head, so the code
    // has to match as a substring, case-insensitively (§6).
    if (q && !(p.sku.toLowerCase().includes(q) || p.name.includes(raw))) {
      return false;
    }
    if (criteria.types.length && !criteria.types.includes(p.category)) return false;
    if (criteria.stones.length && !criteria.stones.includes(p.stone_type)) {
      return false;
    }
    if (criteria.price) {
      const band = PRICE_BANDS.find((b) => b.key === criteria.price);
      if (band && (p.price < band.min || p.price > band.max)) return false;
    }
    if (criteria.status === "available" && p.sold) return false;
    if (criteria.status === "sold" && !p.sold) return false;
    return true;
  });
}
