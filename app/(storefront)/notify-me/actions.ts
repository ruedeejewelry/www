"use server";

import { createAdminSupabase } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { notifySchema } from "@/lib/validation/schemas";

export type NotifyResult = { ok: true } | { ok: false; error: string };

/**
 * Sign-ups are written with the service role because `notify_subscriptions` is
 * closed to anonymous readers and writers — a subscriber list should not be
 * enumerable. The payload is validated here as well as in the form.
 */
export async function subscribeToNewArrivals(
  raw: unknown,
): Promise<NotifyResult> {
  const parsed = notifySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ครบ ลองใหม่อีกครั้ง",
    };
  }

  if (!isSupabaseConfigured()) {
    console.warn("notify signup dropped: Supabase is not configured");
    return { ok: false, error: "ระบบยังไม่พร้อมรับแจ้งเตือน ทักไลน์ร้านได้เลย" };
  }

  // Consent is a gate on the request, not a column here — PDPA consent records
  // live in the CRM's `consents` table (CLAUDE.md §10).
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("notify_subscriptions").insert({
    contact: parsed.data.contact,
    contact_kind: parsed.data.contact_kind,
    stone_types: parsed.data.stone_types,
    price_bands: parsed.data.price_bands,
  });

  if (error) {
    console.error("notify signup failed", error.message);
    return { ok: false, error: "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง" };
  }

  return { ok: true };
}
