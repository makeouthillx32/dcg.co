
// app/api/profile/role-label/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const roleId = searchParams.get("role_id");

  if (!roleId) {
    return NextResponse.json({ error: "Missing role ID" }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    // Find the role details in the roles table
    const { data: roleData, error: roleError } = await supabase
      .from("roles")
      .select("*")
      .eq("id", roleId)
      .single();

    if (roleError || !roleData) {
      return NextResponse.json({ 
        error: "Role not found", 
        role: roleId,
        specializations: []
      }, { status: 404 });
    }

    // Fetch specializations for this role (if applicable)
    const { data: specializations, error: specError } = await supabase
      .from("specializations")
      .select("id, name, description")
      .eq("role", roleData.role);

    if (specError) {
      console.error("Specializations fetch error:", specError);
    }

    return NextResponse.json({
      role: roleData.role, // This is the human-readable role name
      specializations: specializations || []
    });
  } catch (err) {
    console.error("Unexpected error in role label route:", err);
    return NextResponse.json({ 
      role: roleId, 
      specializations: [],
      error: "Error processing role information" 
    }, { status: 500 });
  }
}