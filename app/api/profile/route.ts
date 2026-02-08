import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userRes.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const userId = userRes.user.id;
    const { data: profileData, error: profileErr } = await supabase.from("profiles").select("id,role,avatar_url,display_name").eq("id", userId).single();
    if (profileErr || !profileData?.id) return NextResponse.json({ error: "profile_not_found" }, { status: 404 });
    return NextResponse.json({ id: profileData.id, role: profileData.role ?? null, avatar_url: profileData.avatar_url ?? null, display_name: profileData.display_name ?? null });
  } catch (e) {
    return NextResponse.json({ error: "internal_server_error" }, { status: 500 });
  }
}
