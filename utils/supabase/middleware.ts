import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const AUTH_ROUTES = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password"];

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  // ── Invite capture ──────────────────────────────────────────
  const invite = req.nextUrl.searchParams.get("invite");
  if (invite) {
    res.cookies.set("invite", invite, { path: "/", maxAge: 60 * 10 });
  }

  // ── Guest key ───────────────────────────────────────────────
  // Stable anonymous identity for guest checkout + order history.
  // Set once, lives for 1 year, never changes unless cleared.
  // Passed to upsert_guest_customer() at checkout time.
  if (!req.cookies.get("dcg_guest_key")) {
    res.cookies.set("dcg_guest_key", crypto.randomUUID(), {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  const pathname = req.nextUrl.pathname;

  // ── Skip auth logic on auth pages ───────────────────────────
  if (AUTH_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return res;
  }

  // ── Supabase session ─────────────────────────────────────────
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

  // ── Protect pages (not API routes) ──────────────────────────
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