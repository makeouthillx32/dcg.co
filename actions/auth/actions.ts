"use server";

import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { encodedRedirect } from "@/utils/utils";
import { sendNotification } from "@/lib/notifications";
import { authLogger } from "@/lib/authLogger";

import type { ProfileUpsertRow } from "./types";
import { getAndClearLastPage, populateUserCookies, clearAuthCookies } from "./cookies";

const safeOrigin = async (): Promise<string> => {
  const headerList = await headers();
  const origin = headerList.get("origin") || "";
  if (origin) return origin;
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://desertcowgirl.co").replace(/\/$/, "");
};

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString().trim() || "";
  const password = formData.get("password")?.toString() || "";
  const firstName = formData.get("first_name")?.toString().trim() || "";
  const lastName = formData.get("last_name")?.toString().trim() || "";

  if (!email || !password) return encodedRedirect("error", "/sign-up", "Email and password are required.");
  if (!firstName || !lastName) return encodedRedirect("error", "/sign-up", "First and last name are required.");

  const supabase = await createClient();
  const origin = await safeOrigin();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback/oauth`,
      data: { first_name: firstName, last_name: lastName },
    },
  });

  if (error || !data.user) {
    console.error("[Auth] ❌ Sign up failed:", error?.message);
    return encodedRedirect("error", "/sign-up", error?.message || "Sign up failed.");
  }

  const userId = data.user.id;
  const displayName = `${firstName} ${lastName}`.trim();

  const payload: ProfileUpsertRow = {
    id: userId,
    role: "member",
    display_name: displayName,
    first_name: firstName,
    last_name: lastName,
  };

  const { error: profileUpsertError } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" });

  if (profileUpsertError) {
    console.error("[Auth] ❌ Profile upsert failed:", profileUpsertError.message);
    return encodedRedirect("error", "/sign-up", profileUpsertError.message);
  }

  try {
    await sendNotification({ title: `${email} signed up`, role_admin: true });
  } catch (err) {
    console.error("[Auth] ⚠️ Notification failed:", err);
  }

  if (data.session) {
    authLogger.memberSignUp(userId, email, { firstName, lastName, source: "email_signup" });
    await populateUserCookies(userId, false);
    await new Promise((r) => setTimeout(r, 100));
    const lastPage = await getAndClearLastPage();
    // ✅ Append ?refresh=true so the client Provider immediately syncs the session
    const separator = lastPage.includes("?") ? "&" : "?";
    return redirect(`${lastPage}${separator}refresh=true`);
  }

  return encodedRedirect("success", "/sign-in", "Account created. Please check your email to verify, then sign in.");
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString().trim() || "";
  const password = formData.get("password")?.toString() || "";
  const remember = formData.get("remember") === "true";

  console.log("[Auth] 🔐 Sign-in attempt:", { email, remember });

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return encodedRedirect("error", "/sign-in", error.message);
  if (!data.user?.id) return encodedRedirect("error", "/sign-in", "Authentication failed");
  if (!data.session) return encodedRedirect("error", "/sign-in", "Session creation failed");

  authLogger.memberSignIn(data.user.id, data.user.email || "", remember);

  await populateUserCookies(data.user.id, remember);
  await new Promise((r) => setTimeout(r, 100));

  const lastPage = await getAndClearLastPage();
  // ✅ Append ?refresh=true so the client Provider immediately syncs the session
  const separator = lastPage.includes("?") ? "&" : "?";
  return redirect(`${lastPage}${separator}refresh=true`);
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString()?.trim();
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) return encodedRedirect("error", "/forgot-password", "Email is required");

  const supabase = await createClient();
  const origin = await safeOrigin();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) return encodedRedirect("error", "/forgot-password", "Could not reset password");

  if (callbackUrl) return redirect(callbackUrl);
  return encodedRedirect("success", "/forgot-password", "Check your email for a link to reset your password.");
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();
  const password = (formData.get("password") as string) || "";
  const confirmPassword = (formData.get("confirmPassword") as string) || "";

  if (!password || !confirmPassword) {
    return encodedRedirect("error", "/protected/reset-password", "Password and confirm password are required");
  }
  if (password !== confirmPassword) {
    return encodedRedirect("error", "/protected/reset-password", "Passwords do not match");
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return encodedRedirect("error", "/protected/reset-password", "Password update failed");

  return encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  const store = await cookies();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) authLogger.memberSignOut(session.user.id, session.user.email || "");

  await clearAuthCookies();

  // (extra safety) if Next cookies store behaves oddly in some env, keep a fallback
  store.delete("userRole");
  store.delete("userRoleUserId");
  store.delete("userDisplayName");
  store.delete("userPermissions");
  store.delete("rememberMe");
  store.delete("lastPage");

  await supabase.auth.signOut();
  await new Promise((r) => setTimeout(r, 100));
  return redirect("/");
};