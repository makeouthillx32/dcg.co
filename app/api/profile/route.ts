
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

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("role, avatar_url")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const fullProfile = {
    ...user,
    ...profileData,
  };

  return NextResponse.json(fullProfile);
}
