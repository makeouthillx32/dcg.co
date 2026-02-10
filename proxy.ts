// proxy.ts (formerly middleware.ts)
import { type NextRequest, NextResponse } from "next/server";
import { middleware as supabaseMiddleware } from "@/utils/supabase/middleware";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // REPLACING THE MATCHER:
  // Manually skip static files and internal Next.js paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp)$/)
  ) {
    return NextResponse.next();
  }

  // Call your supabase logic
  return await supabaseMiddleware(req);
}