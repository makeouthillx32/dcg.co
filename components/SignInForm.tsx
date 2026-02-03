"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRef, useState } from "react";
import Link from "next/link";
import SignInWithGoogle from "@/components/ui/SignInWithGoogle";
import { useTheme } from "@/app/provider";
import { Mail, Lock, Loader2 } from "lucide-react";
import { userRoleCookies, profileCache, getCookie } from "@/lib/cookieUtils";

export default function SignInForm() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { themeType } = useTheme();
  const isDark = themeType === "dark";

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const populateUserCookies = async (userId: string) => {
    try {
      console.log(`[SignIn] 🍪 Populating cookies for user ${userId.slice(-4)}`);
      
      // Fetch only the fields that actually exist in your database schema
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, role, avatar_url, initials, display_name")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("[SignIn] ❌ Profile fetch failed:", profileError.message);
        return;
      }

      if (!profileData?.role) {
        console.error("[SignIn] ❌ No role found in profile");
        return;
      }

      const validRoles = ['admin1', 'coachx7', 'client7x', 'user0x'];
      if (!validRoles.includes(profileData.role)) {
        console.warn(`[SignIn] ⚠️ Invalid role: ${profileData.role}, using user0x`);
        profileData.role = 'user0x';
      }

      // Get email from auth.users since it's not in profiles
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      const userEmail = user?.email || '';

      // Create complete profile object with all available data
      const completeProfile = {
        id: profileData.id,
        role: profileData.role,
        avatar_url: profileData.avatar_url,
        initials: profileData.initials,
        display_name: profileData.display_name || userEmail?.split('@')[0] || 'User',
        email: userEmail
      };

      userRoleCookies.setUserRole(profileData.role, userId);
      profileCache.setProfile(userId, completeProfile);

      // Try to get role permissions if the RPC function exists
      try {
        const { data: rolePermissions } = await supabase
          .rpc('get_role_permissions', {
            user_role_type: profileData.role
          });

        if (rolePermissions) {
          profileCache.setPermissions(userId, rolePermissions);
        }
      } catch (permError) {
        console.log("[SignIn] ℹ️ Role permissions not available:", permError);
        // This is fine, permissions are optional
      }

      console.log(`[SignIn] ✅ Cookies populated successfully for ${profileData.role} user`);
      
    } catch (error) {
      console.error("[SignIn] ❌ Cookie population failed:", error);
    }
  };

  const getRedirectPath = (): string => {
    const lastPage = getCookie('lastPage');
    if (!lastPage) {
      console.log('[SignIn] No lastPage cookie, using homepage');
      return '/';
    }
    const excludedPages = ['/sign-in', '/sign-up', '/forgot-password', '/CMS'];
    const pageWithoutHash = lastPage.split('#')[0];
    if (excludedPages.includes(pageWithoutHash)) {
      console.log(`[SignIn] Excluded page detected (${lastPage}), using homepage`);
      return '/';
    }
    console.log(`[SignIn] Using saved page: ${lastPage}`);
    return lastPage;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const email = emailRef.current?.value || "";
      const password = passwordRef.current?.value || "";

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        setError(error.message);
      } else if (data.user?.id) {
        await populateUserCookies(data.user.id);
        
        const redirectPath = getRedirectPath();
        console.log(`[SignIn] 🚀 Redirecting to: ${redirectPath}`);
        
        router.refresh();
        router.push(`${redirectPath}?refresh=true`);
      }
    } catch (err) {
      console.error('[SignIn] Error:', err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[hsl(var(--background))]">
      <div className="w-full max-w-md">
        <div className={`p-6 md:p-8 rounded-[var(--radius)] shadow-[var(--shadow-lg)] ${
          isDark 
            ? "bg-[hsl(var(--card))]" 
            : "bg-[hsl(var(--card))]"
        }`}>
          <h1 className="text-2xl md:text-3xl font-[var(--font-serif)] font-bold text-center text-[hsl(var(--foreground))] mb-6 leading-[1.2]">
            Welcome Back
          </h1>
          
          <SignInWithGoogle />
          
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-[hsl(var(--border))]"></div>
            <span className="mx-4 text-sm font-[var(--font-sans)] text-[hsl(var(--muted-foreground))]">OR</span>
            <div className="flex-grow border-t border-[hsl(var(--border))]"></div>
          </div>
          
          <form onSubmit={handleSubmit} autoComplete="on" className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium font-[var(--font-sans)] text-[hsl(var(--foreground))]">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">
                  <Mail size={18} />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  ref={emailRef}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 pl-10 border border-[hsl(var(--border))] rounded-[var(--radius)] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] font-[var(--font-sans)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-ring))] focus:border-[hsl(var(--sidebar-primary))] transition-colors leading-[1.5]"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium font-[var(--font-sans)] text-[hsl(var(--foreground))]">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">
                  <Lock size={18} />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  ref={passwordRef}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 pl-10 border border-[hsl(var(--border))] rounded-[var(--radius)] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] font-[var(--font-sans)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-ring))] focus:border-[hsl(var(--sidebar-primary))] transition-colors leading-[1.5]"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[hsl(var(--sidebar-primary))] border-[hsl(var(--border))] rounded focus:ring-[hsl(var(--sidebar-ring))]"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm font-[var(--font-sans)] text-[hsl(var(--muted-foreground))]">
                  Remember me
                </label>
              </div>
              
              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="font-medium text-[hsl(var(--sidebar-primary))] hover:text-[hsl(var(--sidebar-primary))]/80 transition-colors font-[var(--font-sans)]"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-[hsl(var(--sidebar-primary))] hover:bg-[hsl(var(--sidebar-primary))]/90 text-[hsl(var(--sidebar-primary-foreground))] font-medium py-2.5 px-4 rounded-[var(--radius)] transition-colors duration-200 shadow-[var(--shadow-sm)] font-[var(--font-sans)] ${
                isLoading ? "opacity-80 cursor-wait" : ""
              } flex items-center justify-center`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>

            {error && (
              <div className="p-3 rounded-[var(--radius)] bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] text-sm font-[var(--font-sans)]">
                {error}
              </div>
            )}
          </form>
          
          <p className="mt-6 text-center text-sm text-[hsl(var(--muted-foreground))] font-[var(--font-sans)] leading-[1.5]">
            Don't have an account?{" "}
            <Link 
              href="/sign-up" 
              className="text-[hsl(var(--sidebar-primary))] hover:underline transition-colors font-medium"
            >
              Sign up
            </Link>
          </p>
          
          <p className="mt-4 text-center text-xs text-[hsl(var(--muted-foreground))] font-[var(--font-sans)] leading-[1.5]">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-[hsl(var(--sidebar-primary))] transition-colors">Terms</Link> and{' '}
            <Link href="/privacy" className="underline hover:text-[hsl(var(--sidebar-primary))] transition-colors">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}