import "server-only";

import { createAdminSupabase } from "@/lib/supabase/admin";

/**
 * Every staff edit is recorded, same as on the CRM side (CLAUDE.md §9).
 * A failure to write the audit row is logged but never blocks the edit — losing
 * the shop's work to a logging problem would be worse than a gap in the log.
 */
export async function recordAudit(params: {
  actorId: string;
  action: string;
  table: string;
  recordId: string | null;
  before?: unknown;
  after?: unknown;
}) {
  try {
    const supabase = createAdminSupabase();
    await supabase.from("audit_log").insert({
      actor_id: params.actorId,
      action: params.action,
      table_name: params.table,
      record_id: params.recordId,
      before: params.before ?? null,
      after: params.after ?? null,
    });
  } catch (error) {
    console.error("audit write failed", error);
  }
}
