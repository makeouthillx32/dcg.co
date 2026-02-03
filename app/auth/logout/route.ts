import { NextResponse } from "next/server";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  // Create Supabase client
  const supabase = createServerActionClient({ cookies });

  // Log out
  await supabase.auth.signOut();

  // Await the store, then get all cookies from it
  const store = await cookies();
  const allCookies = store.getAll(); // returns an array of { name, value, ... }
  const lastPageCookie = allCookies.find((c) => c.name === "lastPage");

  // Fallback to "/"
  const lastPage = lastPageCookie?.value || "/";

  // Build final redirect
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://schedual-five.vercel.app";
  return NextResponse.redirect(new URL(lastPage, baseUrl));
}
