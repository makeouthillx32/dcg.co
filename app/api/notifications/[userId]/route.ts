import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const supabase = createServerSupabaseClient({ req });

  // 1️⃣ who’s calling?
  const {
    data: { user: me },
    error: meError,
  } = await supabase.auth.getUser();
  if (meError || !me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2️⃣ only allow “me” or an admin to fetch another user’s feed
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", me.id)
    .single();

  if (params.userId !== me.id && myProfile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3️⃣ figure out the *target* user’s role flags
  const { data: targetProfile, error: tpErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", params.userId)
    .single();
  if (tpErr || !targetProfile?.role) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const roleColumnMap = {
    admin:    "role_admin",
    jobcoach: "role_jobcoach",
    client:   "role_client",
    user:     "role_user",
  } as const;
  const targetCol = roleColumnMap[targetProfile.role];
  if (!targetCol) {
    return NextResponse.json({ error: "Unknown role" }, { status: 400 });
  }

  // 4️⃣ pull the last 10 notifications for that user:
  //   • ones sent directly to them (receiver_id)
  //   • OR ones flagged for their role
  const { data: notifications, error } = await supabase
    .from("notifications")
    .select(
      "id, title, subtitle, image_url, action_url, created_at"
    )
    .or(`receiver_id.eq.${params.userId},${targetCol}.eq.true`)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ notifications });
}