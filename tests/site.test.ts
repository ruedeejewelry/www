import { describe, expect, it } from "vitest";
import {
  DEFAULT_LINE_OA_ID,
  DEFAULT_SITE_URL,
  resolveLineOaId,
  resolveSiteUrl,
} from "@/lib/site";

/*
  A deploy once failed because NEXT_PUBLIC_SITE_URL existed on Vercel with an
  empty value: `??` only catches undefined, so "" reached new URL() at module
  load and took the whole build down. These cover every shape a dashboard field
  can actually hand us.
*/

describe("resolveSiteUrl", () => {
  it("falls back when the variable is missing", () => {
    expect(resolveSiteUrl(undefined)).toBe(DEFAULT_SITE_URL);
  });

  it("falls back when the field was saved blank", () => {
    expect(resolveSiteUrl("")).toBe(DEFAULT_SITE_URL);
    expect(resolveSiteUrl("   ")).toBe(DEFAULT_SITE_URL);
  });

  it("falls back rather than throwing on a malformed value", () => {
    expect(resolveSiteUrl("http://")).toBe(DEFAULT_SITE_URL);
  });

  it("keeps a proper URL, dropping any trailing path", () => {
    expect(resolveSiteUrl("https://ruedeejewelry.com")).toBe(
      "https://ruedeejewelry.com",
    );
    expect(resolveSiteUrl("https://ruedeejewelry.com/")).toBe(
      "https://ruedeejewelry.com",
    );
  });

  it("accepts a bare host, the way Vercel displays deployment URLs", () => {
    expect(resolveSiteUrl("www-abc123.vercel.app")).toBe(
      "https://www-abc123.vercel.app",
    );
  });

  it("trims stray whitespace from a pasted value", () => {
    expect(resolveSiteUrl("  https://ruedeejewelry.com  ")).toBe(
      "https://ruedeejewelry.com",
    );
  });
});

describe("resolveLineOaId", () => {
  it("falls back when missing or blank", () => {
    expect(resolveLineOaId(undefined)).toBe(DEFAULT_LINE_OA_ID);
    expect(resolveLineOaId("")).toBe(DEFAULT_LINE_OA_ID);
  });

  it("adds the leading @ when the shop leaves it off", () => {
    expect(resolveLineOaId("ruedee")).toBe("@ruedee");
  });

  it("leaves a correctly written id alone", () => {
    expect(resolveLineOaId("@ruedee")).toBe("@ruedee");
    expect(resolveLineOaId("  @ruedee  ")).toBe("@ruedee");
  });
});
