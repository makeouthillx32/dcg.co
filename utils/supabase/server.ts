// utils/supabase/server.ts
import { createServerClient as createSsrClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

type ClientMode = "regular" | "service";

export const createClient = async (mode: ClientMode = "regular") => {
  // Service role client (server-only). Never expose this key to the browser.
  if (mode === "service") {
    return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  // Next.js 15: cookies() is async
  const cookieStore = await cookies();

  return createSsrClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // no-op (can throw in some edge/runtime situations)
          }
        },
      },
    }
  );
};

// ✅ Backwards-compatible alias for older code that imports:
// import { createServerClient } from "@/utils/supabase/server";
export const createServerClient = async (mode: ClientMode = "regular") => {
  return createClient(mode);
};
