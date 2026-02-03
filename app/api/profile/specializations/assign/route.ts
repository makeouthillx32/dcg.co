import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, specializationId } = await req.json();

    if (!userId || !specializationId) {
      return NextResponse.json({ error: "User ID and Specialization ID are required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Check if the specialization already exists for the user
    const { count, error: checkError } = await supabase
      .from("user_specializations")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .eq("specialization_id", specializationId);

    if (checkError) {
      console.error("Error checking existing specialization:", checkError);
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (count && count > 0) {
      return NextResponse.json({ error: "Specialization already assigned" }, { status: 400 });
    }

    // Insert the new specialization
    const { error } = await supabase
      .from("user_specializations")
      .insert({
        user_id: userId,
        specialization_id: specializationId,
        assigned_by: userId // You might want to get the admin's ID instead
      });

    if (error) {
      console.error("Error assigning specialization:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Specialization assigned successfully" });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}