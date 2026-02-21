// Enhanced app/provider.tsx with iOS session persistence added
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { Session, User } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider, useSessionContext } from "@supabase/auth-helpers-react";
import { setCookie, getCookie, iosSessionHelpers } from "@/lib/cookieUtils";
import { usePathname, useRouter } from "next/navigation";
import { Theme } from "@/types/theme"; 
import { defaultThemeId, getThemeById, getAvailableThemeIds } from "@/themes";
import { dynamicFontManager } from "@/lib/dynamicFontManager";
import { transitionTheme, smoothThemeToggle } from "@/utils/themeTransitions";

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
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Auth context interface
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  refreshSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// 🍎 iOS Session Persistence Component
function IOSSessionManager({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const cleanup = iosSessionHelpers.setupIOSHandlers();
    console.log('[Provider] 🍎 iOS session persistence initialized');
    return cleanup;
  }, []);

  return <>{children}</>;
}

function InternalAuthProvider({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useSessionContext();
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const refreshSession = () => {
    iosSessionHelpers.refreshSession();
    console.log('[Provider] 🔄 Manual session refresh triggered');
  };

  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
    } else {
      setUser(null);
    }
  }, [session]);

  useEffect(() => {
    if (!isLoading && !session) {
      // ✅ EXPANDED: Add all public routes including auth callback
      const publicRoutes = [
        "/", 
        "/sign-in", 
        "/sign-up", 
        "/forgot-password", 
        "/reset-password",
        "/auth/callback",
        "/auth/callback/oauth"
      ];
      
      // ✅ Also check if path starts with public prefixes
      const publicPrefixes = ["/products", "/collections", "/auth"];
      
      const isPublicRoute = publicRoutes.includes(pathname) || 
                           publicPrefixes.some(prefix => pathname.startsWith(prefix));
      
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
      <IOSSessionManager>
        {children}
      </IOSSessionManager>
    </AuthContext.Provider>
  );
}

// Hook for components that need to manually refresh session
export function useIOSSessionRefresh() {
  const { refreshSession } = useAuth();
  return { refreshSession };
}

// Main Provider Component
export const Providers: React.FC<{
  children: React.ReactNode;
  session?: Session | null;
}> = ({ children, session }) => {
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

    if (element) {
      await smoothThemeToggle(element, themeChangeCallback);
    } else {
      await transitionTheme(themeChangeCallback);
    }
  };

  const toggleTheme = async (element?: HTMLElement) => {
    const themeChangeCallback = () => {
      setThemeType((prev) => (prev === "light" ? "dark" : "light"));
    };

    if (element) {
      await smoothThemeToggle(element, themeChangeCallback);
    } else {
      await transitionTheme(themeChangeCallback);
    }
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
          if (theme) {
            setThemeIdState(savedThemeId);
          } else {
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
        availableThemes.forEach(id => html.classList.remove(`theme-${id}`));
        
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
          console.error('❌ Failed to auto-load fonts:', error);
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

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ✅ CRITICAL  FIX: Fetch session client-side if not provided as prop
  // This handles the case where layout.tsx is a client component and can't fetch server-side
  const [initialSession, setInitialSession] = useState<Session | null>(session ?? null);
  const [sessionFetched, setSessionFetched] = useState(!!session);

  useEffect(() => {
    if (!sessionFetched) {
      console.log('[Provider] 🔄 Fetching session client-side...');
      supabase.auth.getSession().then(({ data: { session: fetchedSession } }) => {
        console.log('[Provider] ✅ Session fetched:', fetchedSession ? 'authenticated' : 'not authenticated');
        setInitialSession(fetchedSession);
        setSessionFetched(true);
      });
    }
  }, [sessionFetched, supabase.auth]);

  return (
    <SessionContextProvider supabaseClient={supabase} initialSession={initialSession}>
      <InternalAuthProvider>
        <ThemeContext.Provider value={{ 
          themeType, 
          toggleTheme,
          themeId,
          setThemeId,
          getTheme,
          availableThemes
        }}>
          {children}
        </ThemeContext.Provider>
      </InternalAuthProvider>
    </SessionContextProvider>
  );
};