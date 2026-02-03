// app/api/profile/[id]/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient("service");

    console.log("Fetching profile for user ID:", params.id);

    // Simplified select without complex joins
    const { data: profileData, error } = await supabase
      .from("profiles")
      .select(`
        id, 
        role,
        avatar_url
      `)
      .eq("id", params.id)
      .single();

    // Detailed logging for debugging
    if (error) {
      console.error("Profile fetch error:", {
        message: error.message,
        details: error,
        userId: params.id
      });
      
      return NextResponse.json({ 
        error: "Failed to fetch user profile", 
        details: error.message 
      }, { status: 404 });
    }

    // If no profile found
    if (!profileData) {
      console.error("No profile found for user ID:", params.id);
      return NextResponse.json({ 
        error: "User profile not found" 
      }, { status: 404 });
    }

    // Normalize the profile data
    const normalizedProfile = {
      id: profileData.id,
      role: profileData.role,
      avatar_url: profileData.avatar_url
    };

    console.log("Normalized profile:", normalizedProfile);

    return NextResponse.json(normalizedProfile);
  } catch (err) {
    console.error("Unexpected error in profile route:", err);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}