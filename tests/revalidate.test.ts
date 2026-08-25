import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/*
  A deploy failed with "Invalid segment configuration export detected" because
  revalidate was imported from a shared module. Next reads segment config
  statically at compile time, so it has to be a literal in each file — which
  means the only thing stopping eleven copies from drifting apart is a test.

  One minute, not an hour: anything written straight to the database has no way
  to tell Next.js that something changed, and staff should not have to redeploy
  to see it. Publishing through /admin calls revalidatePath and is live in
  seconds regardless.
*/

const EXPECTED = 60;
const appDir = join(import.meta.dirname, "..", "app");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return entry.endsWith(".ts") || entry.endsWith(".tsx") ? [full] : [];
  });
}

const declaring = walk(appDir)
  .map((path) => ({ path, source: readFileSync(path, "utf8") }))
  .filter(({ source }) => /export const revalidate/.test(source));

describe("revalidate windows", () => {
  it("are declared on the pages that read the database", () => {
    // Guards against a page quietly losing its window and caching forever.
    expect(declaring.length).toBeGreaterThanOrEqual(11);
  });

  it.each(declaring.map(({ path }) => path))(
    "%s uses the shared value as a literal",
    (path) => {
      const source = readFileSync(path, "utf8");
      const match = /export const revalidate = (\d+);/.exec(source);
      // A non-literal — an imported constant, an expression — fails the build,
      // and it fails at "collecting page data", long after tsc has passed.
      expect(match, "revalidate must be a plain number literal").not.toBeNull();
      expect(Number(match?.[1])).toBe(EXPECTED);
    },
  );
});
