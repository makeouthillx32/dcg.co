import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const AUTH_ROUTES = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password"];

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  // Keep invite capture (fine)
  const invite = req.nextUrl.searchParams.get("invite");
  if (invite) {
    res.cookies.set("invite", invite, { path: "/", maxAge: 60 * 10 });
  }

  const pathname = req.nextUrl.pathname;

  // Never auth-guard auth pages themselves (prevents weird loops)
  if (AUTH_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return res;
  }

  // Create Supabase server client (fine)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // ✅ Protect PAGES only (NOT API routes)
  // Add/remove prefixes here as your contract evolves.
  const protectedPrefixes = ["/protected", "/settings", "/dashboard", "/profile"];

  const isProtectedPage = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtectedPage && !session) {
    const target = pathname + (req.nextUrl.search || "");
    const url = new URL(`/sign-in?next=${encodeURIComponent(target)}`, req.url);
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};