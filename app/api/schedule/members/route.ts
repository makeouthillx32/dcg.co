import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Fetch all members
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("Members")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching members:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.error("Unexpected error in GET /api/members:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST - Add a new member
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, monday, tuesday, wednesday, thursday, friday } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("Members")
      .insert([
        { 
          name, 
          monday: monday || false, 
          tuesday: tuesday || false, 
          wednesday: wednesday || false, 
          thursday: thursday || false, 
          friday: friday || false 
        }
      ])
      .select();

    if (error) {
      console.error("Error creating member:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (err) {
    console.error("Unexpected error in POST /api/members:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT - Update an existing member
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, monday, tuesday, wednesday, thursday, friday } = body;

    if (!id) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("Members")
      .update({ 
        name, 
        monday: monday || false, 
        tuesday: tuesday || false, 
        wednesday: wednesday || false, 
        thursday: thursday || false, 
        friday: friday || false 
      })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating member:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0]);
  } catch (err) {
    console.error("Unexpected error in PUT /api/members:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE - Remove a member
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("Members")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting member:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unexpected error in DELETE /api/members:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}