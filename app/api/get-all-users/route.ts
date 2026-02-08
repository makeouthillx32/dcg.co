import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient("service");

  const { data: authData, error: authError } =
    await supabase.auth.admin.listUsers();

  if (authError) {
    return NextResponse.json(
      { error: authError.message },
      { status: 500 }
    );
  }

  const userIds = authData.users.map(u => u.id);

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id,role,display_name,avatar_url")
    .in("id", userIds);

  if (profileError) {
    return NextResponse.json(
      { error: profileError.message },
      { status: 500 }
    );
  }

  const profileMap = new Map(
    profiles.map(p => [p.id, p])
  );

  const users = authData.users.map(user => {
    const profile = profileMap.get(user.id);

    return {
      id: user.id,
      display_name: profile?.display_name ?? null,
      avatar_url: profile?.avatar_url ?? null,
      role: profile?.role ?? "member",
      email: user.email ?? null,
      created_at: user.created_at ?? null,
      last_sign_in_at: user.last_sign_in_at ?? null,
      email_confirmed_at: user.email_confirmed_at ?? null,
      auth_providers:
        user.app_metadata?.providers ??
        (user.app_metadata?.provider ? [user.app_metadata.provider] : [])
    };
  });

  return NextResponse.json(users);
}
