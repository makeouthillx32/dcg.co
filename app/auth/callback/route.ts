import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const urlInvite = requestUrl.searchParams.get("invite");
  const redirectTo = requestUrl.searchParams.get("redirect_to") ?? "/CMS";
  const cookieStore = cookies();

  if (code) {
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    await supabase.auth.exchangeCodeForSession(code);

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const userId = user.id;
      const metaInvite = user.user_metadata?.invite;
      const inviteCode = metaInvite || urlInvite;

      // ✅ Step 1: Ensure profile exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      if (!existingProfile) {
        await supabase.from("profiles").insert({
          id: userId,
          role: "anonymous",
        });
      }

      // ✅ Step 2: Apply invite if found
      if (inviteCode) {
        const { data: invite, error: inviteError } = await supabase
          .from("invites")
          .select("role_id")
          .eq("code", inviteCode)
          .maybeSingle();

        if (!inviteError && invite?.role_id) {
          await supabase
            .from("profiles")
            .update({ role: invite.role_id })
            .eq("id", userId);

          await supabase
            .from("invites")
            .delete()
            .eq("code", inviteCode);
        }
      }

      // ✅ Step 3: Set display name if missing
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", userId)
        .maybeSingle();

      if (!profileError && !profile?.display_name) {
        const defaultName = user.email?.split("@")[0];
        if (defaultName) {
          await supabase
            .from("profiles")
            .update({ display_name: defaultName })
            .eq("id", userId);
        }
      }

      // ✅ Step 4: Clean up metadata (remove invite)
      await supabase.auth.updateUser({
        data: { invite: null },
      });
    }
  }

  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
}