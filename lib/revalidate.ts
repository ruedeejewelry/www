/**
 * How long a built page may serve before it checks the database again.
 *
 * One minute, not an hour: stock changes during a working day — a piece sells,
 * gold moves and prices are corrected — and anything written straight to the
 * database (a SQL import, or the CRM later on) has no way to tell Next.js that
 * something changed. A short window means those show up on their own instead of
 * waiting for someone to redeploy.
 *
 * This is a ceiling, not a delay. Publishing through /admin calls
 * revalidatePath() and the change is live in seconds.
 */
export const REVALIDATE_SECONDS = 60;
