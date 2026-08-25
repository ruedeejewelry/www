import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/*
  A deploy failed with "used cookies() inside generateStaticParams" because the
  storefront data layer read through the session-bound Supabase client. Static
  pages are built without a request, so there are no cookies to read — and the
  failure is invisible locally, since without Supabase configured the code never
  reaches that client at all.

  This guards the boundary structurally: public reads use the anon client, and
  only code that genuinely cares who is asking may touch the cookie one.
*/

const root = join(import.meta.dirname, "..");
const read = (path: string) => readFileSync(join(root, path), "utf8");

/** Matches a real import, so a module named in a comment does not count. */
function imports(source: string, module: string): boolean {
  const escaped = module.replace(/[/\\^$*+?.()|[\]{}]/g, "\\$&");
  return new RegExp(`from\\s+["']${escaped}["']`).test(source);
}

const PUBLIC_DATA_MODULES = ["lib/data/products.ts", "lib/data/articles.ts"];

const SESSION_ONLY_MODULES = [
  "lib/auth.ts",
  "lib/data/admin-products.ts",
  "lib/data/product-form.ts",
];

describe("storefront data layer", () => {
  it.each(PUBLIC_DATA_MODULES)(
    "%s reads without a session, so it works at build time",
    (path) => {
      const source = read(path);
      expect(imports(source, "@/lib/supabase/server")).toBe(false);
      expect(imports(source, "@/lib/supabase/public")).toBe(true);
    },
  );

  it.each(PUBLIC_DATA_MODULES)("%s never reads cookies", (path) => {
    expect(imports(read(path), "next/headers")).toBe(false);
  });

  it("the config helpers stay free of next/headers", () => {
    // Importing the cookie module just to ask "is Supabase set up?" would drag
    // request-only APIs back into build-time code paths.
    expect(imports(read("lib/supabase/config.ts"), "next/headers")).toBe(false);
  });
});

describe("admin data layer", () => {
  it.each(SESSION_ONLY_MODULES)(
    "%s still runs under the caller's session",
    (path) => {
      expect(imports(read(path), "@/lib/supabase/server")).toBe(true);
    },
  );
});

describe("service role", () => {
  it("is only ever reachable from server-only modules", () => {
    const source = read("lib/supabase/admin.ts");
    expect(source).toContain('import "server-only"');
    expect(source).toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("is not exposed through a NEXT_PUBLIC_ variable anywhere", () => {
    for (const path of [
      "lib/supabase/admin.ts",
      "lib/supabase/public.ts",
      "lib/supabase/client.ts",
      "lib/supabase/storage.ts",
      ".env.example",
    ]) {
      expect(read(path)).not.toMatch(/NEXT_PUBLIC_[A-Z_]*SERVICE/);
    }
  });
});
