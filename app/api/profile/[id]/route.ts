// app/api/profile/[id]/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

type Ctx = { params: { id: string } };

const ALLOWED_ROLES = new Set(["admin", "member", "guest"]);

export async function GET(_req: Request, { params }: Ctx) {
  const userId = params.id;

  try {
    const supabase = await createClient("service");

    // Prefer view if it exists
    const viewRes = await supabase
      .from("profiles_with_auth")
      .select(
        "id,email,role,avatar_url,display_name,full_name,username,created_at,last_sign_in_at,email_confirmed_at,app_metadata"
      )
      .eq("id", userId)
      .maybeSingle();

    if (!viewRes.error && viewRes.data) {
      const p: any = viewRes.data;
      return NextResponse.json({
        id: p.id,
        email: p.email ?? null,
        role: p.role ?? null,
        avatar_url: p.avatar_url ?? null,
        display_name: p.display_name ?? p.full_name ?? p.username ?? null,
        created_at: p.created_at ?? null,
        last_sign_in_at: p.last_sign_in_at ?? null,
        email_confirmed_at: p.email_confirmed_at ?? null,
        app_metadata: p.app_metadata ?? null,
      });
    }

    // Fallback: profiles table (support either id OR user_id keying)
    const byId = await supabase
      .from("profiles")
      .select(
        "id,user_id,role,avatar_url,display_name,full_name,username,created_at,last_sign_in_at,email_confirmed_at,app_metadata,email"
      )
      .eq("id", userId)
      .maybeSingle();

    const byUserId = !byId.data
      ? await supabase
          .from("profiles")
          .select(
            "id,user_id,role,avatar_url,display_name,full_name,username,created_at,last_sign_in_at,email_confirmed_at,app_metadata,email"
          )
          .eq("user_id", userId)
          .maybeSingle()
      : null;

    let profile: any = byId.data ?? byUserId?.data ?? null;

    // ✅ Auto-provision a profile if missing (default: guest)
    if (!profile) {
      // Try to pull email/name from auth.users (service key can access)
      const authRes = await supabase
        .from("auth.users")
        .select("email, raw_user_meta_data")
        .eq("id", userId)
        .maybeSingle();

      const email = authRes.data?.email ?? null;
      const meta = (authRes.data?.raw_user_meta_data as Record<string, any>) || {};

      const display_name =
        meta.display_name || meta.full_name || meta.name || null;

      // We don't know if your profiles table keys on id or user_id.
      // So: try insert using id first, then fallback to user_id.
      const insertPayloadBase: any = {
        role: "guest",
        email,
        display_name,
        avatar_url: null,
      };

      let inserted: any = null;

      // Attempt 1: profiles.id = auth user id
      const ins1 = await supabase
        .from("profiles")
        .insert({ ...insertPayloadBase, id: userId })
        .select(
          "id,user_id,role,avatar_url,display_name,full_name,username,created_at,last_sign_in_at,email_confirmed_at,app_metadata,email"
        )
        .maybeSingle();

      if (!ins1.error && ins1.data) {
        inserted = ins1.data;
      } else {
        // Attempt 2: profiles.user_id = auth user id
        const ins2 = await supabase
          .from("profiles")
          .insert({ ...insertPayloadBase, user_id: userId })
          .select(
            "id,user_id,role,avatar_url,display_name,full_name,username,created_at,last_sign_in_at,email_confirmed_at,app_metadata,email"
          )
          .maybeSingle();

        if (!ins2.error && ins2.data) {
          inserted = ins2.data;
        } else {
          // If both inserts failed, return a real error (don’t hide it)
          console.error("Profile auto-provision failed:", {
            byIdError: byId.error,
            byUserIdError: byUserId?.error,
            insertByIdError: ins1.error,
            insertByUserIdError: ins2.error,
          });

          return NextResponse.json(
            {
              error: "User profile not found and could not be created",
              details:
                ins2.error?.message ||
                ins1.error?.message ||
                "Unknown insert failure",
            },
            { status: 500 }
          );
        }
      }

      profile = inserted;
    }

    return NextResponse.json({
      id: profile.id ?? profile.user_id ?? userId,
      email: profile.email ?? null,
      role: profile.role ?? null,
      avatar_url: profile.avatar_url ?? null,
      display_name:
        profile.display_name ?? profile.full_name ?? profile.username ?? null,
      created_at: profile.created_at ?? null,
      last_sign_in_at: profile.last_sign_in_at ?? null,
      email_confirmed_at: profile.email_confirmed_at ?? null,
      app_metadata: profile.app_metadata ?? null,
    });
  } catch (err) {
    console.error("GET /api/profile/[id] error:", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  const targetId = params.id;

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const role = String(body?.role ?? "").toLowerCase().trim();

  if (!role) return NextResponse.json({ error: "Missing role" }, { status: 400 });
  if (!ALLOWED_ROLES.has(role)) {
    return NextResponse.json(
      { error: `Invalid role '${role}'`, allowed: Array.from(ALLOWED_ROLES) },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient("service");

    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .or(`id.eq.${targetId},user_id.eq.${targetId}`);

    if (error) {
      console.error("PATCH /api/profile/[id] update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: targetId, role });
  } catch (err) {
    console.error("PATCH /api/profile/[id] error:", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
