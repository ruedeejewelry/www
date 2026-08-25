import "server-only";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabase } from "@/lib/supabase/server";
import type { StaffRow } from "@/types/db";

export type Staff = Pick<StaffRow, "id" | "full_name" | "role">;

/**
 * Establishes who is asking before anything in the admin app runs. Called at
 * the top of every admin page AND at the top of every server action — a hidden
 * button is not a permission check (CLAUDE.md §5).
 *
 * Redirects to the login page when there is no active staff session.
 */
export async function requireStaff(): Promise<Staff> {
  if (!isSupabaseConfigured()) {
    redirect("/admin/login?reason=unconfigured");
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data, error } = await supabase
    .from("staff")
    .select("id, full_name, role, active")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("staff lookup failed", error.message);
    redirect("/admin/login?reason=error");
  }
  if (!data || !data.active) {
    redirect("/admin/login?reason=inactive");
  }

  return { id: data.id, full_name: data.full_name, role: data.role };
}

/** Owner-only actions: permanent deletes and staff management (§9). */
export async function requireOwner(): Promise<Staff> {
  const staff = await requireStaff();
  if (staff.role !== "owner") {
    throw new Error("เฉพาะเจ้าของร้านเท่านั้นที่ทำรายการนี้ได้");
  }
  return staff;
}
