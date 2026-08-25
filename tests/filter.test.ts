import { describe, expect, it } from "vitest";
import {
  criteriaFromParams,
  EMPTY_CRITERIA,
  filterProducts,
  hasAnyFilter,
} from "@/lib/filter";
import type { Product } from "@/types/db";

function product(overrides: Partial<Product>): Product {
  return {
    id: overrides.sku ?? "X1",
    sku: "RG126",
    name: "ปูกระดองทอง",
    category: "ring",
    metal_type: "ทอง 90",
    gold_weight_g: 5.2,
    stone_type: "ruby",
    stone_carat: null,
    stone_carat_note: null,
    stone_color: "แดง",
    stone_origin: null,
    stone_treatment: null,
    cert_lab: null,
    cert_number: null,
    cert_file_path: null,
    ring_size_th: 49,
    price: 43_100,
    description: null,
    series_slug: null,
    series_episode: null,
    series_note: null,
    status: "published",
    sold_at: null,
    published_at: null,
    created_at: "",
    updated_at: "",
    deleted_at: null,
    sold: false,
    type_label: "แหวน",
    stone_label: "ทับทิม",
    images: [],
    ...overrides,
  };
}

const CATALOGUE = [
  product({ sku: "RG126", price: 43_100 }),
  product({ sku: "RG59", price: 64_600, stone_type: "star", sold: true, sold_at: "x" }),
  product({ sku: "PD22", price: 76_000, category: "pendant", stone_type: "diamond" }),
  product({ sku: "ER18", price: 152_000, category: "earring", stone_type: "diamond" }),
];

describe("filterProducts", () => {
  it("returns everything when nothing is selected", () => {
    expect(filterProducts(CATALOGUE, EMPTY_CRITERIA)).toHaveLength(4);
  });

  it("matches a product code case-insensitively and partially", () => {
    const found = filterProducts(CATALOGUE, { ...EMPTY_CRITERIA, query: "rg12" });
    expect(found.map((p) => p.sku)).toEqual(["RG126"]);
  });

  it("matches a Thai name", () => {
    const found = filterProducts(CATALOGUE, { ...EMPTY_CRITERIA, query: "ปูกระดอง" });
    expect(found.length).toBeGreaterThan(0);
  });

  it("treats several types as OR, and types and stones as AND", () => {
    const found = filterProducts(CATALOGUE, {
      ...EMPTY_CRITERIA,
      types: ["pendant", "earring"],
      stones: ["diamond"],
    });
    expect(found.map((p) => p.sku)).toEqual(["PD22", "ER18"]);
  });

  it("applies price bands inclusively at their edges", () => {
    // 50,000–100,000 must include a piece priced at exactly 100,000.
    const edge = [product({ sku: "EDGE", price: 100_000 })];
    expect(
      filterProducts(edge, { ...EMPTY_CRITERIA, price: "50to100" }),
    ).toHaveLength(1);
    expect(
      filterProducts(edge, { ...EMPTY_CRITERIA, price: "gt100" }),
    ).toHaveLength(0);
  });

  it("keeps sold pieces unless the customer asks for available only", () => {
    expect(
      filterProducts(CATALOGUE, { ...EMPTY_CRITERIA, status: "available" }).map(
        (p) => p.sku,
      ),
    ).not.toContain("RG59");
    expect(
      filterProducts(CATALOGUE, { ...EMPTY_CRITERIA, status: "sold" }).map(
        (p) => p.sku,
      ),
    ).toEqual(["RG59"]);
  });
});

describe("criteriaFromParams", () => {
  it("round-trips the shareable URL form", () => {
    const params = new URLSearchParams("type=ring,pendant&stone=ruby&price=lt50&q=RG1");
    expect(criteriaFromParams(params)).toEqual({
      types: ["ring", "pendant"],
      stones: ["ruby"],
      price: "lt50",
      status: null,
      query: "RG1",
    });
  });

  it("reports an empty query string as no filters", () => {
    expect(hasAnyFilter(criteriaFromParams(new URLSearchParams()))).toBe(false);
  });
});
