import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Two jobs:
 *
 * 1. Serve the admin app on admin.ruedeejewelry.com by rewriting that host onto
 *    /admin, so staff keep one login and one deployment (CLAUDE.md §4).
 * 2. Refresh the Supabase session cookie, since Server Components cannot write
 *    cookies themselves.
 *
 * Access control is NOT done here — every admin page and every server action
 * calls requireStaff() itself. Hiding a route is not security (§5 "กฎเหล็ก").
 */
export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const url = request.nextUrl;

  if (host.startsWith("admin.") && !url.pathname.startsWith("/admin")) {
    const rewritten = url.clone();
    rewritten.pathname = `/admin${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.rewrite(rewritten);
  }

  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return response;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(list) {
        for (const { name, value } of list) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: [
    // Everything except static assets and image optimiser output.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)",
  ],
};
