import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Prefer the view if it exists; fallback to profiles table (id OR user_id)
  let profile: any = null;

  const viewRes = await supabase
    .from("profiles_with_auth")
    .select("id,email,role,avatar_url,display_name,full_name,username")
    .eq("id", user.id)
    .maybeSingle();

  if (!viewRes.error && viewRes.data) {
    profile = viewRes.data;
  } else {
    const byId = await supabase
      .from("profiles")
      .select("id,user_id,role,avatar_url,display_name,full_name,username")
      .eq("id", user.id)
      .maybeSingle();

    if (!byId.error && byId.data) {
      profile = byId.data;
    } else {
      const byUserId = await supabase
        .from("profiles")
        .select("id,user_id,role,avatar_url,display_name,full_name,username")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!byUserId.error && byUserId.data) {
        profile = byUserId.data;
      }
    }
  }

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Stable, safe response shape for the UI
  return NextResponse.json({
    id: user.id,
    email: user.email ?? profile.email ?? null,
    role: profile.role ?? null,
    avatar_url: profile.avatar_url ?? null,
    display_name: profile.display_name ?? profile.full_name ?? profile.username ?? null,
  });
}
