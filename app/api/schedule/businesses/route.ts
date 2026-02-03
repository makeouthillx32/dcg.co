// app/api/schedule/businesses/route.ts - FIXED DELETE method

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    if (id) {
      // Get specific business by ID
      const { data, error } = await supabase
        .from("Businesses")
        .select("id, business_name, address, before_open, business_notes")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching business:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!data) {
        return NextResponse.json({ error: "Business not found" }, { status: 404 });
      }

      return NextResponse.json(data);
    } else {
      // Get all businesses
      const { data, error } = await supabase
        .from("Businesses")
        .select("id, business_name, address, before_open, business_notes")
        .order("business_name");

      if (error) {
        console.error("Error fetching businesses:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data || []);
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { business_name, address, before_open, business_notes } = body;

  if (!business_name || !address) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const insertData: any = { 
      business_name, 
      address, 
      before_open: before_open || false 
    };

    if (business_notes) {
      insertData.business_notes = business_notes;
    }

    const { error, data } = await supabase
      .from("Businesses")
      .insert([insertData])
      .select();

    if (error) {
      console.error("Error adding business:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing business ID" }, { status: 400 });
    }

    console.log("🗑️ Attempting to delete business ID:", id);

    // Step 1: Check if business exists
    const { data: business, error: fetchError } = await supabase
      .from("Businesses")
      .select("id, business_name")
      .eq("id", id)
      .single();

    if (fetchError || !business) {
      console.error("Business not found:", fetchError);
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    console.log("🏢 Found business:", business.business_name);

    // Step 2: Delete from daily_clean_items first (if any exist)
    console.log("🧹 Cleaning up daily_clean_items...");
    const { error: itemsError } = await supabase
      .from("daily_clean_items")
      .delete()
      .eq("business_id", id);

    if (itemsError) {
      console.error("Error deleting daily_clean_items:", itemsError);
      // Continue anyway - might not exist
    }

    // Step 3: Delete from Schedule table (if any exist)
    console.log("📅 Cleaning up Schedule entries...");
    const { error: scheduleError } = await supabase
      .from("Schedule")
      .delete()
      .eq("business_id", id);

    if (scheduleError) {
      console.error("Error deleting Schedule entries:", scheduleError);
      // Continue anyway - might not exist
    }

    // Step 4: Finally delete the business itself
    console.log("🏢 Deleting business...");
    const { error: deleteError } = await supabase
      .from("Businesses")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting business:", deleteError);
      return NextResponse.json({ 
        error: `Failed to delete business: ${deleteError.message}` 
      }, { status: 500 });
    }

    console.log("✅ Successfully deleted business:", business.business_name);
    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${business.business_name}` 
    });

  } catch (error) {
    console.error("Unexpected error during deletion:", error);
    return NextResponse.json({ 
      error: "Internal server error during deletion" 
    }, { status: 500 });
  }
}