"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { Session, User } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { setCookie, getCookie, iosSessionHelpers } from "@/lib/cookieUtils";
import { usePathname, useRouter } from "next/navigation";
import { Theme } from "@/types/theme";
import { defaultThemeId, getThemeById, getAvailableThemeIds } from "@/themes";
import { dynamicFontManager } from "@/lib/dynamicFontManager";
import { transitionTheme, smoothThemeToggle } from "@/utils/themeTransitions";
import { authLogger } from "@/lib/authLogger";

interface EnhancedThemeContextType {
  themeType: "light" | "dark";
  toggleTheme: (element?: HTMLElement) => Promise<void>;
  themeId: string;
  setThemeId: (id: string, element?: HTMLElement) => Promise<void>;
  getTheme: (id?: string) => Promise<Theme | null>;
  availableThemes: string[];
}

const ThemeContext = createContext<EnhancedThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  refreshSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

function IOSSessionManager({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const cleanup = iosSessionHelpers.setupIOSHandlers();
    console.log("[Provider] 🍎 iOS session persistence initialized");
    return cleanup;
  }, []);
  return <>{children}</>;
}

function InternalAuthProvider({
  children,
  forceRefreshSession,
  session,
  isLoading,
}: {
  children: React.ReactNode;
  forceRefreshSession: () => void;
  session: Session | null;
  isLoading: boolean;
}) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const refreshSession = () => {
    iosSessionHelpers.refreshSession();
    console.log("[Provider] 🔄 Manual session refresh triggered (iosSessionHelpers)");
    forceRefreshSession();
  };

  useEffect(() => {
    if (session?.user) setUser(session.user);
    else setUser(null);

    // ✅ FIX: Force Next.js to re-render the full component tree whenever auth state
    // changes. Without this, components like MobileDrawer that read `session` from
    // AuthContext don't re-render after sign-in/sign-out because the custom window
    // event fires before they've mounted their listener (post-navigation). router.refresh()
    // re-syncs server components and flushes the updated session through the entire tree.
    router.refresh();
  }, [session, router]);

  useEffect(() => {
    if (!isLoading && !session) {
      const publicRoutes = [
        "/",
        "/sign-in",
        "/sign-up",
        "/forgot-password",
        "/reset-password",
        "/auth/callback",
        "/auth/callback/oauth",
      ];
      const publicPrefixes = ["/products", "/collections", "/auth"];

      const isPublicRoute =
        publicRoutes.includes(pathname) || publicPrefixes.some((prefix) => pathname.startsWith(prefix));

      if (!isPublicRoute) {
        console.log(`[Provider] Redirecting to sign-in from: ${pathname}`);
        router.push("/sign-in");
      } else {
        console.log(`[Provider] Allowing public route: ${pathname}`);
      }
    }
  }, [session, isLoading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, session, isLoading, refreshSession }}>
      <IOSSessionManager>{children}</IOSSessionManager>
    </AuthContext.Provider>
  );
}

export function useIOSSessionRefresh() {
  const { refreshSession } = useAuth();
  return { refreshSession };
}

export const Providers: React.FC<{ children: React.ReactNode; session?: Session | null }> = ({
  children,
  session,
}) => {
  // -------------------------
  // THEME STATE (unchanged)
  // -------------------------
  const [themeType, setThemeType] = useState<"light" | "dark">("light");
  const [themeId, setThemeIdState] = useState<string>(defaultThemeId);
  const [mounted, setMounted] = useState(false);
  const [availableThemes, setAvailableThemes] = useState<string[]>([]);

  const getTheme = async (id?: string): Promise<Theme | null> => {
    const targetId = id || themeId;
    try {
      const theme = await getThemeById(targetId);
      if (!theme) {
        console.warn(`⚠️ Theme ${targetId} not found, falling back to default`);
        return await getThemeById(defaultThemeId);
      }
      return theme;
    } catch (error) {
      console.error(`❌ Error getting theme ${targetId}:`, error);
      return await getThemeById(defaultThemeId);
    }
  };

  const setThemeId = async (id: string, element?: HTMLElement) => {
    const themeChangeCallback = async () => {
      try {
        const theme = await getThemeById(id);
        if (theme) {
          setThemeIdState(id);
          localStorage.setItem("themeId", id);
          setCookie("themeId", id, { path: "/", maxAge: 31536000 });
          console.log(`🎨 Theme changed to: ${theme.name} (${id})`);
        } else {
          console.warn(`⚠️ Theme ${id} not found in database`);
        }
      } catch (error) {
        console.error(`❌ Error setting theme ${id}:`, error);
      }
    };

    if (element) await smoothThemeToggle(element, themeChangeCallback);
    else await transitionTheme(themeChangeCallback);
  };

  const toggleTheme = async (element?: HTMLElement) => {
    const themeChangeCallback = () => {
      setThemeType((prev) => (prev === "light" ? "dark" : "light"));
    };

    if (element) await smoothThemeToggle(element, themeChangeCallback);
    else await transitionTheme(themeChangeCallback);
  };

  useEffect(() => {
    const loadAvailableThemes = async () => {
      try {
        const themeIds = await getAvailableThemeIds();
        setAvailableThemes(themeIds);
        console.log(`📚 Loaded ${themeIds.length} available themes:`, themeIds);
      } catch (error) {
        console.error("❌ Error loading available themes:", error);
        setAvailableThemes([defaultThemeId]);
      }
    };
    loadAvailableThemes();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setMounted(true);

      const initializeTheme = async () => {
        const savedThemeId = localStorage.getItem("themeId") || getCookie("themeId");
        if (savedThemeId) {
          const theme = await getThemeById(savedThemeId);
          if (theme) setThemeIdState(savedThemeId);
          else {
            console.warn(`⚠️ Saved theme ${savedThemeId} not found, using default`);
            setThemeIdState(defaultThemeId);
          }
        }

        const savedThemeType = localStorage.getItem("theme") || getCookie("theme");
        if (!savedThemeType) {
          const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          setThemeType(systemPrefersDark ? "dark" : "light");
        } else {
          setThemeType(savedThemeType as "light" | "dark");
        }
      };

      initializeTheme();
    }
  }, []);

  useEffect(() => {
    if (!mounted || availableThemes.length === 0) return;

    const applyTheme = async () => {
      try {
        const theme = await getTheme();
        if (!theme) {
          console.error("❌ No theme available to apply");
          return;
        }

        console.log(`🎨 Applying theme: ${theme.name} (${themeType} mode)`);
        const variables = themeType === "dark" ? theme.dark : theme.light;
        const html = document.documentElement;

        html.classList.remove("light", "dark");
        availableThemes.forEach((id) => html.classList.remove(`theme-${id}`));
        html.classList.add(themeType);
        html.classList.add(`theme-${themeId}`);

        console.log(`🔧 Applying ${Object.keys(variables).length} CSS variables`);
        for (const [key, value] of Object.entries(variables)) {
          html.style.setProperty(key, value);
        }

        try {
          console.log(`🔤 Auto-loading fonts from CSS variables...`);
          await dynamicFontManager.autoLoadFontsFromCSS();
        } catch (error) {
          console.error("❌ Failed to auto-load fonts:", error);
        }

        if (theme.typography?.trackingNormal) {
          document.body.style.letterSpacing = theme.typography.trackingNormal;
        }

        localStorage.setItem("theme", themeType);
        setCookie("theme", themeType, { path: "/", maxAge: 31536000 });

        console.log(`✅ Theme applied: ${theme.name} (${themeType})`);
      } catch (error) {
        console.error("❌ Error applying theme:", error);
      }
    };

    applyTheme();
  }, [themeType, themeId, mounted, availableThemes]);

  // -------------------------
  // AUTH / SESSION FIXES
  // -------------------------

  const supabase = useMemo(() => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

  const [initialSession, setInitialSession] = useState<Session | null>(session ?? null);
  const [liveSession, setLiveSession] = useState<Session | null>(session ?? null);
  const [sessionFetched, setSessionFetched] = useState(!!session);

  const isAuthLoading = !sessionFetched;

  const forceRefreshSession = () => {
    supabase.auth
      .getSession()
      .then(({ data: { session: fetchedSession } }) => {
        console.log("[Provider] ✅ Forced session fetched:", fetchedSession ? "authenticated" : "not authenticated");

        if (fetchedSession?.user) {
          authLogger.memberSessionRestored(fetchedSession.user.id, fetchedSession.user.email || "");
        }

        setInitialSession(fetchedSession);
        setLiveSession(fetchedSession);
        setSessionFetched(true);
      })
      .catch((e) => console.error("[Provider] ❌ Forced session fetch failed:", e));
  };

  // ✅ FIX: After email sign-in, signInAction redirects with ?refresh=true.
  // This effect detects that flag on mount and immediately calls forceRefreshSession()
  // so the session is populated in AuthContext before the user can open the mobile drawer.
  // Without this, the drawer renders "Sign In" because the async onAuthStateChange
  // fires after the component tree has already painted with session = null.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("refresh") === "true") {
      console.log("[Provider] 🔑 ?refresh=true detected — forcing immediate session sync");
      forceRefreshSession();
      // Strip the param from the URL so it doesn't persist or show to the user
      params.delete("refresh");
      const newUrl = window.location.pathname + (params.toString() ? "?" + params.toString() : "");
      window.history.replaceState({}, "", newUrl);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!sessionFetched) {
      console.log("[Provider] 🔄 Fetching session client-side...");
      forceRefreshSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionFetched]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("[Provider] 🔄 Auth state changed:", event, newSession ? "authenticated" : "not authenticated");

      setInitialSession(newSession);
      setLiveSession(newSession);
      setSessionFetched(true);

      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        console.log("[Provider] 📢 Broadcasting auth event to components:", event);
        window.dispatchEvent(
          new CustomEvent("supabase-auth-change", {
            detail: { event, session: newSession },
          })
        );
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        console.log("[Provider] 👀 visibilitychange => refreshing session");
        iosSessionHelpers.refreshSession();
        forceRefreshSession();
      }
    };

    const onPageShow = () => {
      console.log("[Provider] 📲 pageshow => refreshing session");
      iosSessionHelpers.refreshSession();
      forceRefreshSession();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onPageShow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  return (
    <SessionContextProvider supabaseClient={supabase} initialSession={initialSession}>
      <InternalAuthProvider
        forceRefreshSession={forceRefreshSession}
        session={liveSession}
        isLoading={isAuthLoading}
      >
        <ThemeContext.Provider
          value={{
            themeType,
            toggleTheme,
            themeId,
            setThemeId,
            getTheme,
            availableThemes,
          }}
        >
          {children}
        </ThemeContext.Provider>
      </InternalAuthProvider>
    </SessionContextProvider>
  );
};