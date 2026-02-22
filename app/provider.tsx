// app/provider.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { Session, User } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider, useSessionContext } from "@supabase/auth-helpers-react";
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
}: {
  children: React.ReactNode;
  forceRefreshSession: () => void;
}) {
  const { session, isLoading } = useSessionContext();
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
  }, [session]);

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

export function Providers({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession: Session | null;
}) {
  // THEME
  const [themeType, setThemeType] = useState<"light" | "dark">("light");
  const [themeId, setThemeIdState] = useState<string>(defaultThemeId);
  const [mounted, setMounted] = useState(false);
  const [availableThemes, setAvailableThemes] = useState<string[]>([]);

  const getTheme = async (id?: string): Promise<Theme | null> => {
    const targetId = id || themeId;
    try {
      const theme = await getThemeById(targetId);
      if (!theme) return await getThemeById(defaultThemeId);
      return theme;
    } catch {
      return await getThemeById(defaultThemeId);
    }
  };

  const setThemeId = async (id: string, element?: HTMLElement) => {
    const themeChangeCallback = async () => {
      const theme = await getThemeById(id);
      if (!theme) return;

      setThemeIdState(id);
      localStorage.setItem("themeId", id);
      setCookie("themeId", id, { path: "/", maxAge: 31536000 });
    };

    if (element) await smoothThemeToggle(element, themeChangeCallback);
    else await transitionTheme(themeChangeCallback);
  };

  const toggleTheme = async (element?: HTMLElement) => {
    const themeChangeCallback = () => setThemeType((p) => (p === "light" ? "dark" : "light"));
    if (element) await smoothThemeToggle(element, themeChangeCallback);
    else await transitionTheme(themeChangeCallback);
  };

  useEffect(() => {
    (async () => {
      try {
        const themeIds = await getAvailableThemeIds();
        setAvailableThemes(themeIds);
      } catch {
        setAvailableThemes([defaultThemeId]);
      }
    })();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setMounted(true);

    (async () => {
      const savedThemeId = localStorage.getItem("themeId") || getCookie("themeId");
      if (savedThemeId) {
        const theme = await getThemeById(savedThemeId);
        setThemeIdState(theme ? savedThemeId : defaultThemeId);
      }

      const savedThemeType = localStorage.getItem("theme") || getCookie("theme");
      if (!savedThemeType) {
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setThemeType(systemPrefersDark ? "dark" : "light");
      } else {
        setThemeType(savedThemeType as "light" | "dark");
      }
    })();
  }, []);

  useEffect(() => {
    if (!mounted || availableThemes.length === 0) return;

    (async () => {
      const theme = await getTheme();
      if (!theme) return;

      const variables = themeType === "dark" ? theme.dark : theme.light;
      const html = document.documentElement;

      html.classList.remove("light", "dark");
      availableThemes.forEach((id) => html.classList.remove(`theme-${id}`));
      html.classList.add(themeType);
      html.classList.add(`theme-${themeId}`);

      for (const [key, value] of Object.entries(variables)) html.style.setProperty(key, value);

      try {
        await dynamicFontManager.autoLoadFontsFromCSS();
      } catch {}

      localStorage.setItem("theme", themeType);
      setCookie("theme", themeType, { path: "/", maxAge: 31536000 });
    })();
  }, [themeType, themeId, mounted, availableThemes]);

  // AUTH / SESSION
  const supabase = useMemo(() => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

  const [clientSession, setClientSession] = useState<Session | null>(initialSession);
  const [sessionFetched, setSessionFetched] = useState(!!initialSession);

  const forceRefreshSession = () => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session?.user) authLogger.memberSessionRestored(session.user.id, session.user.email || "");
        setClientSession(session);
        setSessionFetched(true);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (!sessionFetched) forceRefreshSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionFetched]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setClientSession(newSession);
      setSessionFetched(true);

      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        window.dispatchEvent(new CustomEvent("supabase-auth-change", { detail: { event, session: newSession } }));
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        iosSessionHelpers.refreshSession();
        forceRefreshSession();
      }
    };
    const onPageShow = () => {
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
    <SessionContextProvider supabaseClient={supabase} initialSession={clientSession ?? undefined}>
      <InternalAuthProvider forceRefreshSession={forceRefreshSession}>
        <ThemeContext.Provider value={{ themeType, toggleTheme, themeId, setThemeId, getTheme, availableThemes }}>
          {children}
        </ThemeContext.Provider>
      </InternalAuthProvider>
    </SessionContextProvider>
  );
}