import { describe, expect, it, vi } from "vitest";
import { PRODUCT_SHOTS, resolveProductImages } from "@/lib/data/images";
import type { ProductImageRow } from "@/types/db";

vi.mock("server-only", () => ({}));

const { isSelfHosted } = await import("@/lib/supabase/storage");

function row(overrides: Partial<ProductImageRow>): ProductImageRow {
  return {
    id: "1",
    product_id: "p1",
    storage_path: "2026/abc.webp",
    alt_th: null,
    sort_order: 0,
    width: null,
    height: null,
    blur_data_url: null,
    ...overrides,
  };
}

describe("isSelfHosted", () => {
  it("recognises a file the site serves from public/", () => {
    expect(isSelfHosted("/test-photo.jpg")).toBe(true);
  });

  it("recognises a full URL", () => {
    expect(isSelfHosted("https://cdn.example.com/a.jpg")).toBe(true);
  });

  it("treats a plain storage key as private, needing a signature", () => {
    expect(isSelfHosted("2026/abc-photo.webp")).toBe(false);
  });
});

describe("resolveProductImages", () => {
  const urlFor = (path: string) =>
    path === "2026/first.webp" ? "https://signed/first" : null;

  it("orders photos by sort_order, not by the order rows arrive", () => {
    const images = resolveProductImages(
      "RG126",
      [
        row({ id: "b", storage_path: "2026/second.webp", sort_order: 1 }),
        row({ id: "a", storage_path: "2026/first.webp", sort_order: 0 }),
      ],
      urlFor,
    );
    expect(images[0].url).toBe("https://signed/first");
  });

  it("pads the remaining slots with the shots the shop still owes", () => {
    const images = resolveProductImages("RG126", [], () => null);
    // Main shot plus every angle the product page asks for.
    expect(images).toHaveLength(1 + PRODUCT_SHOTS.length);
    expect(images.every((image) => image.url === null)).toBe(true);
    expect(images[0].placeholder).toContain("RG126");
    expect(images[1].placeholder).toBe(PRODUCT_SHOTS[0]);
  });

  it("keeps a slot rather than dropping a photo whose URL could not be made", () => {
    // A failed signature must not shift the layout — the box stays, showing
    // its placeholder, so nothing on the page moves.
    const images = resolveProductImages(
      "RG126",
      [row({ storage_path: "2026/missing.webp" })],
      () => null,
    );
    expect(images[0].url).toBeNull();
    expect(images).toHaveLength(1 + PRODUCT_SHOTS.length);
  });

  it("uses the shop's own alt text when there is one", () => {
    const images = resolveProductImages(
      "RG126",
      [row({ storage_path: "2026/first.webp", alt_th: "แหวนไพลินมุมตรง" })],
      urlFor,
    );
    expect(images[0].alt).toBe("แหวนไพลินมุมตรง");
  });
});
