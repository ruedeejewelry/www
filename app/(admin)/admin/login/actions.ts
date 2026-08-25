"use server";

import { redirect } from "next/navigation";
import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";

export type LoginResult = { ok: false; error: string };

/**
 * Staff sign-in. CLAUDE.md §12 leaves "LINE or email/password for staff"
 * undecided; this is the email/password path. Swapping it for LINE later means
 * replacing this action and nothing else — requireStaff() only cares that a
 * session maps to an active row in `staff`.
 */
export async function signIn(
  email: string,
  password: string,
): Promise<LoginResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "ยังไม่ได้ตั้งค่าการเชื่อมต่อฐานข้อมูล" };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("staff sign-in failed", error.message);
    return { ok: false, error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
  }

  redirect("/admin");
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabase();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
