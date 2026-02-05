"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { encodedRedirect } from "@/utils/utils";
import { cookies } from "next/headers";
import { sendNotification } from "@/lib/notifications";

const VALID_ROLES = ["admin", "member", "guest"] as const;
type ValidRole = (typeof VALID_ROLES)[number];

const DEFAULT_AVATAR =
  "https://chsmesvozsjcgrwuimld.supabase.co/storage/v1/object/public/avatars/Default.png";

const getCookieOptions = async (remember: boolean) => {
  const headerList = await headers();
  const origin = headerList.get("origin") || "";
  const isHttps = origin.startsWith("https://");
  const isProd = process.env.NODE_ENV === "production";

  return {
    path: "/",
    secure: isProd || isHttps,
    sameSite: "lax" as const,
    maxAge: remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
  };
};

const getAndClearLastPage = async (): Promise<string> => {
  const store = await cookies();
  const lastPageCookie = store.getAll().find((c) => c.name === "lastPage");

  let lastPage = lastPageCookie?.value || "/";
  store.delete("lastPage");

  const excludedPages = ["/sign-in", "/sign-up", "/forgot-password"];
  const pageWithoutHash = lastPage.split("#")[0];

  if (excludedPages.includes(pageWithoutHash)) {
    lastPage = "/";
  }

  return lastPage;
};

const normalizeRole = (role: unknown): ValidRole => {
  if (typeof role !== "string") return "member";
  if ((VALID_ROLES as readonly string[]).includes(role)) return role as ValidRole;
  return "member";
};

// Populates role/permission cookies based on profiles row
const populateUserCookies = async (userId: string, remember: boolean = false) => {
  try {
    const supabase = await createClient();
    const store = await cookies();
    const cookieOptions = await getCookieOptions(remember);

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("role, display_name, department, avatar_url")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("[Auth] ❌ Profile fetch failed:", profileError.message);
      return;
    }

    const role = normalizeRole(profileData?.role);

    store.set("userRole", role, cookieOptions);
    store.set("userRoleUserId", userId, cookieOptions);
    store.set("rememberMe", remember.toString(), cookieOptions);

    if (profileData?.display_name) {
      store.set("userDisplayName", profileData.display_name, cookieOptions);
    }

    if (profileData?.department) {
      store.set("userDepartment", profileData.department, cookieOptions);
    }

    // Permissions (optional)
    const rolePermissions = await supabase.rpc("get_role_permissions", {
      user_role_type: role,
    });

    if (!rolePermissions.error && rolePermissions.data) {
      const permissionsData = {
        timestamp: Date.now(),
        permissions: rolePermissions.data,
        role,
      };

      store.set("userPermissions", JSON.stringify(permissionsData), {
        ...cookieOptions,
        maxAge: 5 * 60, // 5 minutes
      });
    }

    console.log(`[Auth] ✅ Cookies populated (${role}) remember=${remember}`);
  } catch (error) {
    console.error("[Auth] ❌ Cookie population failed:", error);
  }
};

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const inviteCode = formData.get("invite")?.toString().trim();

  if (!email || !password) {
    return encodedRedirect("error", "/sign-up", "Email and password are required.");
  }

  const supabase = await createClient();
  const headerList = await headers();
  const origin = headerList.get("origin") || "";

  // 1) Create auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // keep your callback route if that’s what your project uses
      emailRedirectTo: `${origin}/auth/callback/oauth`,
      data: inviteCode ? { invite: inviteCode } : {},
    },
  });

  if (error || !data.user) {
    console.error("[Auth] ❌ Sign up failed:", error?.message);
    return encodedRedirect("error", "/sign-up", error?.message || "Sign up failed.");
  }

  const userId = data.user.id;

  // 2) Decide role (default member)
  let finalRole: ValidRole = "member";

  if (inviteCode) {
    const { data: inviteData, error: inviteError } = await supabase
      .from("invites")
      .select("role_id")
      .eq("code", inviteCode)
      .maybeSingle();

    if (!inviteError && inviteData?.role_id) {
      finalRole = normalizeRole(inviteData.role_id);
    }
  }

  // 3) Ensure profile exists + role set (UPSERT so it works even if profile row doesn’t exist yet)
  const { error: profileUpsertError } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        role: finalRole,
        avatar_url: DEFAULT_AVATAR,
      },
      { onConflict: "id" }
    );

  if (profileUpsertError) {
    console.error("[Auth] ❌ Profile upsert failed:", profileUpsertError.message);
  }

  // 4) Consume invite if used
  if (inviteCode) {
    await supabase.from("invites").delete().eq("code", inviteCode);
  }

  // 5) Optional notification
  try {
    await sendNotification({
      title: `${email} signed up`,
      subtitle: `Role: ${finalRole}`,
      imageUrl: DEFAULT_AVATAR,
      role_admin: true,
    });
  } catch (err) {
    console.error("[Auth] ⚠️ Notification failed:", err);
  }

  // 6) Supabase email confirm flow
  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! Please check your email to verify your account."
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString().trim() || "";
  const password = formData.get("password")?.toString() || "";
  const remember = formData.get("remember") === "true";

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("[Auth] ❌ Sign-in failed:", error.message);
    return encodedRedirect("error", "/sign-in", error.message);
  }

  if (!data.user?.id) {
    return encodedRedirect("error", "/sign-in", "Authentication failed");
  }

  await populateUserCookies(data.user.id, remember);

  const lastPage = await getAndClearLastPage();
  return redirect(`${lastPage}?refresh=true`);
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error("❌ Forgot password error:", error.message);
    return encodedRedirect("error", "/forgot-password", "Could not reset password");
  }

  if (callbackUrl) return redirect(callbackUrl);

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password."
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required"
    );
  }

  if (password !== confirmPassword) {
    return encodedRedirect("error", "/protected/reset-password", "Passwords do not match");
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return encodedRedirect("error", "/protected/reset-password", "Password update failed");
  }

  return encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  const store = await cookies();

  store.delete("userRole");
  store.delete("userRoleUserId");
  store.delete("userDisplayName");
  store.delete("userDepartment");
  store.delete("userPermissions");
  store.delete("rememberMe");

  await supabase.auth.signOut();
  return redirect("/sign-in");
};
