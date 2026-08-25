import { beforeEach, describe, expect, it, vi } from "vitest";

/*
  requireStaff() is the gate in front of every admin page and every mutation, so
  it gets tested directly (CLAUDE.md §9 asks for tests on access checks).
  A redirect here means the caller never reaches the action body.
*/

const redirect = vi.fn((path: string) => {
  throw new Error(`REDIRECT:${path}`);
});

vi.mock("next/navigation", () => ({ redirect }));
vi.mock("server-only", () => ({}));

const state = {
  user: null as { id: string } | null,
  staff: null as { id: string; full_name: string; role: string; active: boolean } | null,
  error: null as { message: string } | null,
};

vi.mock("@/lib/supabase/config", () => ({
  isSupabaseConfigured: () => true,
  hasServiceRole: () => true,
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: async () => ({
    auth: { getUser: async () => ({ data: { user: state.user } }) },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: state.staff, error: state.error }),
        }),
      }),
    }),
  }),
}));

const { requireOwner, requireStaff } = await import("@/lib/auth");

const expectRedirect = async (fn: () => Promise<unknown>, path: string) => {
  await expect(fn()).rejects.toThrow(`REDIRECT:${path}`);
};

describe("requireStaff", () => {
  beforeEach(() => {
    state.user = null;
    state.staff = null;
    state.error = null;
    redirect.mockClear();
  });

  it("sends an anonymous visitor to the login page", async () => {
    await expectRedirect(requireStaff, "/admin/login");
  });

  it("refuses a signed-in user with no staff row", async () => {
    state.user = { id: "u1" };
    await expectRedirect(requireStaff, "/admin/login?reason=inactive");
  });

  it("refuses a deactivated staff member", async () => {
    state.user = { id: "u1" };
    state.staff = { id: "u1", full_name: "จัน", role: "staff", active: false };
    await expectRedirect(requireStaff, "/admin/login?reason=inactive");
  });

  it("refuses when the staff lookup itself fails, rather than letting it through", async () => {
    state.user = { id: "u1" };
    state.error = { message: "boom" };
    await expectRedirect(requireStaff, "/admin/login?reason=error");
  });

  it("admits an active staff member", async () => {
    state.user = { id: "u1" };
    state.staff = { id: "u1", full_name: "จัน", role: "staff", active: true };
    await expect(requireStaff()).resolves.toEqual({
      id: "u1",
      full_name: "จัน",
      role: "staff",
    });
  });
});

describe("requireOwner", () => {
  beforeEach(() => {
    state.user = { id: "u1" };
    state.error = null;
    redirect.mockClear();
  });

  it("rejects staff who are not the owner", async () => {
    state.staff = { id: "u1", full_name: "พนักงาน", role: "staff", active: true };
    await expect(requireOwner()).rejects.toThrow(/เจ้าของร้าน/);
  });

  it("admits the owner", async () => {
    state.staff = { id: "u1", full_name: "แม่ฤดี", role: "owner", active: true };
    await expect(requireOwner()).resolves.toMatchObject({ role: "owner" });
  });
});
