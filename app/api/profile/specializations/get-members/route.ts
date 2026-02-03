import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Role ID is required" }, { status: 400 });
    }

    const supabase = await createClient("service");

    console.log(`API: Fetching members for role ID: ${id}`);

    // First get the specialization to verify it exists
    const { data: specialization, error: specError } = await supabase
      .from("specializations")
      .select("id, name")
      .eq("id", id)
      .single();

    if (specError) {
      console.error("Error fetching specialization:", specError);
      return NextResponse.json({ 
        error: "Specialization not found", 
        details: specError.message 
      }, { status: 404 });
    }

    console.log(`API: Found specialization: ${specialization.name}`);

    // Fetch all users who have this specialization
    const { data: usersWithSpec, error: usersError } = await supabase
      .from("user_specializations")
      .select(`
        user_id,
        assigned_at,
        assigned_by
      `)
      .eq("specialization_id", id);

    if (usersError) {
      console.error("Error fetching user specializations:", usersError);
      return NextResponse.json({ 
        error: "Failed to fetch user specializations", 
        details: usersError.message 
      }, { status: 500 });
    }

    // If no users have this specialization, return empty array
    if (!usersWithSpec || usersWithSpec.length === 0) {
      console.log(`API: No users have specialization ${id}`);
      return NextResponse.json([]);
    }

    // Extract user IDs
    const userIds = usersWithSpec.map(item => item.user_id);
    console.log(`API: Found ${userIds.length} users with specialization`);

    // Now fetch the profiles based on the fields that exist in your table
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select(`
        id,
        role,
        avatar_url
      `)
      .in("id", userIds);

    if (profilesError) {
      console.error("Error fetching user profiles:", profilesError);
      return NextResponse.json({ 
        error: "Failed to fetch user profiles", 
        details: profilesError.message 
      }, { status: 500 });
    }

    // Now we need to get the email from auth.users since it's not in profiles
    const { data: authUsers, error: authError } = await supabase.auth.admin
      .listUsers();

    if (authError) {
      console.error("Error fetching auth users:", authError);
      return NextResponse.json({ 
        error: "Failed to fetch auth users", 
        details: authError.message 
      }, { status: 500 });
    }

    // Create a lookup map for emails by user ID
    const emailMap = new Map();
    authUsers?.users.forEach(user => {
      emailMap.set(user.id, user.email);
    });

    // Create a metadata lookup map for display names by user ID (if available)
    const metadataMap = new Map();
    authUsers?.users.forEach(user => {
      if (user.user_metadata && typeof user.user_metadata === 'object') {
        const displayName = user.user_metadata.display_name || 
                           user.user_metadata.full_name ||
                           user.user_metadata.name;
        if (displayName) {
          metadataMap.set(user.id, displayName);
        }
      }
    });

    // Transform data to a more usable format
    const members = profiles.map(profile => {
      const userId = profile.id;
      const email = emailMap.get(userId) || 'No email';
      const displayName = metadataMap.get(userId) || email.split('@')[0] || userId.substring(0, 8);
      
      return {
        id: userId,
        name: displayName,
        email: email,
        avatar_url: profile.avatar_url || null
      };
    });

    console.log(`API: Successfully returning ${members.length} members`);
    return NextResponse.json(members);

  } catch (err) {
    console.error("Unexpected error in get-members API:", err);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}