import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_specializations")
      .select(`
        specialization_id,
        specializations (
          id, 
          name, 
          description, 
          role_id,
          roles(role)
        )
      `)
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user specializations:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform data to include specialization details
    const transformedData = data.map(entry => ({
      id: entry.specialization_id,
      name: entry.specializations?.name,
      description: entry.specializations?.description,
      role: entry.specializations?.roles?.role || entry.specializations?.role_id,
    }));

    console.log("User Specializations:", transformedData);

    return NextResponse.json(transformedData);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}