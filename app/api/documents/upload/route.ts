// app/api/documents/upload/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    // FIXED: Add await here - this was the issue!
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folderPath = formData.get("folderPath") as string || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 50MB." }, { status: 400 });
    }

    // Generate unique storage path
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const storagePath = folderPath 
      ? `${folderPath}${timestamp}-${safeFileName}`
      : `${timestamp}-${safeFileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload file to storage" }, { status: 500 });
    }

    // Create document record in database
    const documentPath = folderPath ? `${folderPath}${file.name}` : file.name;
    const parentPath = folderPath || null;

    const { data: document, error: dbError } = await supabase
      .from("documents")
      .insert([{
        name: file.name,
        path: documentPath,
        parent_path: parentPath,
        type: "file",
        mime_type: file.type || "application/octet-stream",
        size_bytes: file.size,
        storage_path: uploadData.path,
        bucket_name: "documents",
        uploaded_by: user.id,
        is_favorite: false,
        is_shared: false,
        visibility: "private",
        tags: []
      }])
      .select("*")
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
      
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from("documents")
        .remove([uploadData.path]);
      
      return NextResponse.json({ error: "Failed to create document record" }, { status: 500 });
    }

    // Log upload activity
    await supabase
      .from("document_activity")
      .insert([{
        document_id: document.id,
        user_id: user.id,
        activity_type: "uploaded",
        details: {
          file_size: file.size,
          mime_type: file.type
        },
        ip_address: req.headers.get("x-forwarded-for")?.split(',')[0] || 
                   req.headers.get("x-real-ip") || null,
        user_agent: req.headers.get("user-agent") || ""
      }]);

    console.log(`📤 Uploaded file: ${file.name} (${file.size} bytes) to ${folderPath || 'root'}`);

    // Transform the response to match expected format
    const transformedDocument = {
      id: document.id,
      name: document.name,
      path: document.path,
      type: document.type,
      mime_type: document.mime_type,
      size_bytes: document.size_bytes,
      uploaded_by: document.uploaded_by,
      created_at: document.created_at,
      updated_at: document.updated_at,
      is_favorite: document.is_favorite,
      is_shared: document.is_shared,
      tags: document.tags || [],
      storage_path: document.storage_path,
      bucket_name: document.bucket_name
    };

    return NextResponse.json(transformedDocument);

  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Handle multiple file uploads
export async function PUT(req: NextRequest) {
  try {
    // FIXED: Add await here too!
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the form data
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const folderPath = formData.get("folderPath") as string || "";

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const results = [];
    const errors = [];

    // Process each file
    for (const file of files) {
      try {
        // Validate file size
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
          errors.push({
            filename: file.name,
            error: "File too large. Maximum size is 50MB."
          });
          continue;
        }

        // Generate unique storage path
        const timestamp = Date.now();
        const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const storagePath = folderPath 
          ? `${folderPath}${timestamp}-${safeFileName}`
          : `${timestamp}-${safeFileName}`;

        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("documents")
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          errors.push({
            filename: file.name,
            error: "Failed to upload to storage"
          });
          continue;
        }

        // Create document record in database
        const documentPath = folderPath ? `${folderPath}${file.name}` : file.name;
        const parentPath = folderPath || null;

        const { data: document, error: dbError } = await supabase
          .from("documents")
          .insert([{
            name: file.name,
            path: documentPath,
            parent_path: parentPath,
            type: "file",
            mime_type: file.type || "application/octet-stream",
            size_bytes: file.size,
            storage_path: uploadData.path,
            bucket_name: "documents",
            uploaded_by: user.id,
            is_favorite: false,
            is_shared: false,
            visibility: "private",
            tags: []
          }])
          .select("*")
          .single();

        if (dbError) {
          console.error("Database insert error:", dbError);
          
          // Clean up uploaded file if database insert fails
          await supabase.storage
            .from("documents")
            .remove([uploadData.path]);
            
          errors.push({
            filename: file.name,
            error: "Failed to create document record"
          });
          continue;
        }

        // Log upload activity
        await supabase
          .from("document_activity")
          .insert([{
            document_id: document.id,
            user_id: user.id,
            activity_type: "uploaded",
            details: {
              file_size: file.size,
              mime_type: file.type
            },
            ip_address: req.headers.get("x-forwarded-for")?.split(',')[0] || 
                       req.headers.get("x-real-ip") || null,
            user_agent: req.headers.get("user-agent") || ""
          }]);

        console.log(`📤 Uploaded file: ${file.name} (${file.size} bytes) to ${folderPath || 'root'}`);

        // Transform the response to match expected format
        const transformedDocument = {
          id: document.id,
          name: document.name,
          path: document.path,
          type: document.type,
          mime_type: document.mime_type,
          size_bytes: document.size_bytes,
          uploaded_by: document.uploaded_by,
          created_at: document.created_at,
          updated_at: document.updated_at,
          is_favorite: document.is_favorite,
          is_shared: document.is_shared,
          tags: document.tags || [],
          storage_path: document.storage_path,
          bucket_name: document.bucket_name
        };

        results.push(transformedDocument);

      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError);
        errors.push({
          filename: file.name,
          error: "Processing error"
        });
      }
    }

    return NextResponse.json({
      success: true,
      uploaded: results,
      errors: errors,
      summary: {
        total: files.length,
        successful: results.length,
        failed: errors.length
      }
    });

  } catch (error) {
    console.error("Bulk Upload API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}