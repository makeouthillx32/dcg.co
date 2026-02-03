// app/api/schedule/businesses/notes/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET - Fetch notes for a specific business
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("business_id");

  if (!businessId) {
    return NextResponse.json({ error: "business_id parameter is required" }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from("Businesses")
      .select("business_notes")
      .eq("id", businessId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      business_id: businessId, 
      notes: data?.business_notes || [] 
    });
  } catch (error) {
    console.error("GET Notes Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Add a new note to a business
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { business_id, type, title, content } = body;

    if (!business_id || !content) {
      return NextResponse.json({ 
        error: "Missing required fields: business_id and content" 
      }, { status: 400 });
    }

    // First, get current notes
    const { data: currentData, error: fetchError } = await supabase
      .from("Businesses")
      .select("business_notes")
      .eq("id", business_id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Prepare new note
    const newNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type || "general",
      title: title || "",
      content: content,
      created_at: new Date().toISOString()
    };

    // Add new note to existing notes
    const updatedNotes = [...(currentData?.business_notes || []), newNote];

    // Update the business with new notes
    const { data, error } = await supabase
      .from("Businesses")
      .update({ business_notes: updatedNotes })
      .eq("id", business_id)
      .select("business_notes")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      note: newNote,
      all_notes: data.business_notes 
    });
  } catch (error) {
    console.error("POST Note Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Update an existing note
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { business_id, note_id, type, title, content } = body;

    if (!business_id || !note_id) {
      return NextResponse.json({ 
        error: "Missing required fields: business_id and note_id" 
      }, { status: 400 });
    }

    // Get current notes
    const { data: currentData, error: fetchError } = await supabase
      .from("Businesses")
      .select("business_notes")
      .eq("id", business_id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const currentNotes = currentData?.business_notes || [];
    
    // Find and update the specific note
    const updatedNotes = currentNotes.map((note: any) => {
      if (note.id === note_id) {
        return {
          ...note,
          type: type !== undefined ? type : note.type,
          title: title !== undefined ? title : note.title,
          content: content !== undefined ? content : note.content,
          updated_at: new Date().toISOString()
        };
      }
      return note;
    });

    // Check if note was found
    const noteFound = updatedNotes.some((note: any) => note.id === note_id);
    if (!noteFound) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Update the business
    const { data, error } = await supabase
      .from("Businesses")
      .update({ business_notes: updatedNotes })
      .eq("id", business_id)
      .select("business_notes")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      notes: data.business_notes 
    });
  } catch (error) {
    console.error("PATCH Note Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Remove a specific note
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { business_id, note_id } = body;

    if (!business_id || !note_id) {
      return NextResponse.json({ 
        error: "Missing required fields: business_id and note_id" 
      }, { status: 400 });
    }

    // Get current notes
    const { data: currentData, error: fetchError } = await supabase
      .from("Businesses")
      .select("business_notes")
      .eq("id", business_id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const currentNotes = currentData?.business_notes || [];
    
    // Remove the specific note
    const updatedNotes = currentNotes.filter((note: any) => note.id !== note_id);

    // Check if note was found and removed
    if (currentNotes.length === updatedNotes.length) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Update the business
    const { data, error } = await supabase
      .from("Businesses")
      .update({ business_notes: updatedNotes })
      .eq("id", business_id)
      .select("business_notes")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      notes: data.business_notes 
    });
  } catch (error) {
    console.error("DELETE Note Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}