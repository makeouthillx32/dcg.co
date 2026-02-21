// utils/supabase/middleware.ts
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  // ✅ CRITICAL: Start with next() to preserve existing response
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // Handle invite codes
  const invite = req.nextUrl.searchParams.get("invite");
  if (invite) {
    res.cookies.set("invite", invite, {
      path: "/",
      maxAge: 60 * 10,
    });
  }

  // ✅ CRITICAL FIX: Create Supabase client with proper cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          // ✅ Set cookies on BOTH request and response
          cookiesToSet.forEach(({ name, value, options }) => {
            // Set on response so they're sent to client
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // ✅ CRITICAL: This call triggers cookie refresh via setAll above
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error("[Middleware] Auth error:", error.message);
  }

  // Log session state for debugging
  if (session) {
    console.log("[Middleware] ✅ Session active for user:", session.user.email);
  } else {
    console.log("[Middleware] ❌ No active session");
  }

  // Check if route is protected
  const protectedPrefixes = ["/protected", "/settings", "/api/messages"];
  const isProtected = protectedPrefixes.some(
    (prefix) =>
      req.nextUrl.pathname === prefix ||
      req.nextUrl.pathname.startsWith(`${prefix}/`)
  );

  // Redirect to sign-in if accessing protected route without session
  if (isProtected && !session) {
    const target = req.nextUrl.pathname + (req.nextUrl.search || "");
    console.log("[Middleware] 🔒 Protected route without session, redirecting to sign-in");
    return NextResponse.redirect(
      new URL(`/sign-in?redirect_to=${encodeURIComponent(target)}`, req.url)
    );
  }

  // ✅ Return the response with updated cookies
  return res;
}