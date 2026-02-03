import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient("service");

  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error("Failed to fetch users:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const simplifiedUsers = data.users.map((user) => ({
    id: user.id,
    display_name: user.user_metadata?.display_name || null,
  }));

  return NextResponse.json(simplifiedUsers);
}
