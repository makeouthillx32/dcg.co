import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("specializations")
      .select(`
        id, 
        name, 
        description, 
        role_id,
        roles(role)
      `);

    if (error) {
      console.error("Error fetching specializations:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform data to include role name
    const transformedData = data.map(spec => ({
      id: spec.id,
      name: spec.name,
      description: spec.description,
      role: spec.roles?.role || 'Unassigned',
    }));

    console.log("Fetched Specializations:", transformedData);

    return NextResponse.json(transformedData);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}