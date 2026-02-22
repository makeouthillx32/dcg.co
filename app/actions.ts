"use server";
import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { encodedRedirect } from "@/utils/utils";
import { sendNotification } from "@/lib/notifications";
import { authLogger } from "@/lib/authLogger";

const VALID_ROLES = ["admin", "member", "guest"] as const;
type ValidRole = (typeof VALID_ROLES)[number];
type CookieOptions = { path: string; secure: boolean; sameSite: "lax"; maxAge: number };
type ProfileCookieRow = { role: string | null; display_name: string | null };
type ProfileUpsertRow = { id: string; role: ValidRole; display_name: string; first_name: string; last_name: string };

const getCookieOptions = async (remember: boolean): Promise<CookieOptions> => {
  const headerList = await headers();
  const origin = headerList.get("origin") || "";
  const isHttps = origin.startsWith("https://");
  const isProd = process.env.NODE_ENV === "production";
  return { path: "/", secure: isProd || isHttps, sameSite: "lax", maxAge: remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60 };
};

const getAndClearLastPage = async (): Promise<string> => {
  const store = await cookies();
  const lastPageCookie = store.getAll().find((c) => c.name === "lastPage");
  let lastPage = lastPageCookie?.value || "/";
  store.delete("lastPage");
  const excludedPages = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password", "/auth/callback", "/auth/callback/oauth", "/auth/logout"];
  const excludedPrefixes = ["/dashboard", "/settings", "/protected"];
  const pageWithoutHash = lastPage.split("#")[0].split("?")[0];
  const isExcluded = excludedPages.includes(pageWithoutHash) || excludedPrefixes.some(prefix => pageWithoutHash.startsWith(prefix));
  if (isExcluded) {
    console.log("[Auth] ⚠️ Excluded page in lastPage cookie:", lastPage, "→ redirecting to /");
    lastPage = "/";
  } else {
    console.log("[Auth] ✅ Valid lastPage from cookie:", lastPage);
  }
  return lastPage;
};

const normalizeRole = (role: unknown): ValidRole => {
  if (typeof role !== "string") return "member";
  if ((VALID_ROLES as readonly string[]).includes(role)) return role as ValidRole;
  return "member";
};

const populateUserCookies = async (userId: string, remember: boolean = false) => {
  try {
    const supabase = await createClient();
    const store = await cookies();
    const cookieOptions = await getCookieOptions(remember);
    const { data: profileData, error: profileError } = await supabase.from("profiles").select("role, display_name").eq("id", userId).single<ProfileCookieRow>();
    if (profileError) {
      console.error("[Auth] ❌ Profile fetch failed:", profileError.message);
      return;
    }
    const role = normalizeRole(profileData?.role);
    store.set("userRole", role, cookieOptions);
    store.set("userRoleUserId", userId, cookieOptions);
    store.set("rememberMe", remember.toString(), cookieOptions);
    if (profileData?.display_name) store.set("userDisplayName", profileData.display_name, cookieOptions);
    const rolePermissions = await supabase.rpc("get_role_permissions", { user_role_type: role });
    if (!rolePermissions.error && rolePermissions.data) {
      const permissionsData = { timestamp: Date.now(), permissions: rolePermissions.data, role };
      store.set("userPermissions", JSON.stringify(permissionsData), { ...cookieOptions, maxAge: 5 * 60 });
    }
    console.log(`[Auth] ✅ Cookies populated (${role}) remember=${remember}`);
  } catch (error) {
    console.error("[Auth] ❌ Cookie population failed:", error);
  }
};

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString().trim() || "";
  const password = formData.get("password")?.toString() || "";
  const firstName = formData.get("first_name")?.toString().trim() || "";
  const lastName = formData.get("last_name")?.toString().trim() || "";
  if (!email || !password) return encodedRedirect("error", "/sign-up", "Email and password are required.");
  if (!firstName || !lastName) return encodedRedirect("error", "/sign-up", "First and last name are required.");
  const supabase = await createClient();
  const headerList = await headers();
  const origin = headerList.get("origin") || "";
  const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${origin}/auth/callback/oauth`, data: { first_name: firstName, last_name: lastName } } });
  if (error || !data.user) {
    console.error("[Auth] ❌ Sign up failed:", error?.message);
    return encodedRedirect("error", "/sign-up", error?.message || "Sign up failed.");
  }
  const userId = data.user.id;
  const displayName = `${firstName} ${lastName}`.trim();
  const payload: ProfileUpsertRow = { id: userId, role: "member", display_name: displayName, first_name: firstName, last_name: lastName };
  const { error: profileUpsertError } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
  if (profileUpsertError) {
    console.error("[Auth] ❌ Profile upsert failed:", profileUpsertError.message);
    return encodedRedirect("error", "/sign-up", profileUpsertError.message);
  }
  try {
    await sendNotification({ title: `${email} signed up`, role_admin: true });
  } catch (err) {
    console.error("[Auth] ⚠️ Notification failed:", err);
  }
  const hasSession = !!data.session;
  if (hasSession) {
    authLogger.memberSignUp(userId, email, { firstName, lastName, source: 'email_signup' });
    await populateUserCookies(userId, false);
    await new Promise(resolve => setTimeout(resolve, 100));
    const lastPage = await getAndClearLastPage();
    return redirect(`${lastPage}?signin=true`);
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
  if (error) {
    console.error("[Auth] ❌ Sign-in failed:", error.message);
    return encodedRedirect("error", "/sign-in", error.message);
  }
  if (!data.user?.id) {
    console.error("[Auth] ❌ No user ID in response");
    return encodedRedirect("error", "/sign-in", "Authentication failed");
  }
  if (!data.session) {
    console.error("[Auth] ❌ No session in response");
    return encodedRedirect("error", "/sign-in", "Session creation failed");
  }
  console.log("[Auth] ✅ Supabase sign-in successful, session created");
  authLogger.memberSignIn(data.user.id, data.user.email || '', remember);
  await populateUserCookies(data.user.id, remember);
  await new Promise(resolve => setTimeout(resolve, 100));
  const lastPage = await getAndClearLastPage();
  console.log("[Auth] ✅ Redirecting to:", lastPage);
  
  // Force server components to re-fetch data after sign-in
  const { revalidatePath } = await import('next/cache');
  revalidatePath('/', 'layout'); // Revalidates all pages that use root layout
  
  return redirect(`${lastPage}?signin=true`);
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();
  if (!email) return encodedRedirect("error", "/forgot-password", "Email is required");
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password` });
  if (error) {
    console.error("❌ Forgot password error:", error.message);
    return encodedRedirect("error", "/forgot-password", "Could not reset password");
  }
  if (callbackUrl) return redirect(callbackUrl);
  return encodedRedirect("success", "/forgot-password", "Check your email for a link to reset your password.");
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  if (!password || !confirmPassword) return encodedRedirect("error", "/protected/reset-password", "Password and confirm password are required");
  if (password !== confirmPassword) return encodedRedirect("error", "/protected/reset-password", "Passwords do not match");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return encodedRedirect("error", "/protected/reset-password", "Password update failed");
  return encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  const store = await cookies();
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) authLogger.memberSignOut(session.user.id, session.user.email || '');
  store.delete("userRole");
  store.delete("userRoleUserId");
  store.delete("userDisplayName");
  store.delete("userPermissions");
  store.delete("rememberMe");
  store.delete("lastPage");
  console.log("[Auth] 🚪 Signing out and redirecting to home");
  await supabase.auth.signOut();
  await new Promise(resolve => setTimeout(resolve, 100));
  return redirect("/?logout=true");
};