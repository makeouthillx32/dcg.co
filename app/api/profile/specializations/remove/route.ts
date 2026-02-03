import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, specializationId } = await req.json();

    if (!userId || !specializationId) {
      return NextResponse.json({ error: "User ID and Specialization ID are required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Remove the specialization
    const { error } = await supabase
      .from("user_specializations")
      .delete()
      .eq("user_id", userId)
      .eq("specialization_id", specializationId);

    if (error) {
      console.error("Error removing specialization:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Specialization removed successfully" });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}