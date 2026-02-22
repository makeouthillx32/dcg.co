// app/provider.tsx (CLIENT)
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  lazy,
  Suspense,
} from "react";
import { usePathname } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import type { Session } from "@supabase/supabase-js";

import { Header as ShopHeader } from "@/components/Layouts/shop/Header";
import { Header as AppHeader } from "@/components/Layouts/app/nav";
import { Header as DashboardHeader } from "@/components/Layouts/dashboard";
import { Sidebar } from "@/components/Layouts/sidebar";
import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import MobileDrawer from "@/components/Layouts/shop/MobileDrawer";

import analytics from "@/lib/analytics";
import { getCookie, setCookie } from "@/lib/cookieUtils";
import { Toaster } from "react-hot-toast";
import RegionBootstrap from "@/components/Auth/RegionBootstrap";
import NextTopLoader from "nextjs-toploader";

import ConditionalOverlays from "@/components/Layouts/overlays/ConditionalOverlays";
import { CartProvider } from "@/components/Layouts/overlays/cart/cart-context";

// ⬇️ keep your existing ThemeProvider exports/impl
// If your useTheme currently comes from "./provider", keep it here.
// (I’m assuming you already have a ThemeProvider + useTheme in this file.)
import { ThemeProvider, useTheme } from "@/components/theme/ThemeProvider";

const Footer = lazy(() => import("@/components/Layouts/footer"));
const AccessibilityOverlay = lazy(
  () => import("@/components/Layouts/overlays/accessibility/accessibility")
);
const CookieConsent = lazy(() =>
  import("@/components/CookieConsent").then((m) => ({
    default: m.CookieConsent,
  }))
);

type AuthCtx = { session: Session | null };
const AuthContext = createContext<AuthCtx>({ session: null });

export function useAuth() {
  return useContext(AuthContext);
}

function useScreenSize() {
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">(
    () => {
      if (typeof window === "undefined") return "desktop";
      try {
        const cached = getCookie("screenSize");
        if (
          cached === "mobile" ||
          cached === "tablet" ||
          cached === "desktop"
        )
          return cached;
      } catch (e) {
        console.warn("Cookie access failed:", e);
      }
      try {
        const width = window.innerWidth;
        const size =
          width < 768 ? "mobile" : width < 1024 ? "tablet" : "desktop";
        try {
          setCookie("screenSize", size, { maxAge: 86400 });
        } catch (e) {}
        return size;
      } catch (e) {
        return "desktop";
      }
    }
  );

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const checkScreenSize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        try {
          const width = window.innerWidth;
          const newSize =
            width < 768 ? "mobile" : width < 1024 ? "tablet" : "desktop";
          if (newSize !== screenSize) {
            setScreenSize(newSize);
            try {
              setCookie("screenSize", newSize, { maxAge: 86400 });
            } catch (e) {}
          }
        } catch (e) {}
      }, 200);
    };

    try {
      window.addEventListener("resize", checkScreenSize);
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener("resize", checkScreenSize);
      };
    } catch (e) {
      return () => clearTimeout(timeoutId);
    }
  }, [screenSize]);

  return screenSize;
}

function useMetaThemeColor(
  layout: "shop" | "dashboard" | "app",
  themeType: "light" | "dark"
) {
  useLayoutEffect(() => {
    let cancelled = false;
    let lastColor = "";

    const updateStatusBar = () => {
      if (cancelled) return;
      const el = document.querySelector<HTMLElement>(`[data-layout="${layout}"]`);
      if (!el) return;

      const bgColor = getComputedStyle(el).backgroundColor;
      if (
        !bgColor ||
        bgColor === "transparent" ||
        bgColor === "rgba(0, 0, 0, 0)"
      )
        return;

      const match = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!match) return;

      const hex = `#${(
        (1 << 24) +
        (Number(match[1]) << 16) +
        (Number(match[2]) << 8) +
        Number(match[3])
      )
        .toString(16)
        .slice(1)}`;

      if (hex === lastColor) return;
      lastColor = hex;

      let meta = document.querySelector<HTMLMetaElement>(
        'meta[name="theme-color"]'
      );
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "theme-color";
        document.head.appendChild(meta);
      }
      meta.content = hex;

      let appleMeta = document.querySelector<HTMLMetaElement>(
        'meta[name="apple-mobile-web-app-status-bar-style"]'
      );
      if (!appleMeta) {
        appleMeta = document.createElement("meta");
        appleMeta.name = "apple-mobile-web-app-status-bar-style";
        document.head.appendChild(appleMeta);
      }
      appleMeta.content = "default";

      el.style.visibility = "hidden";
      el.offsetHeight;
      el.style.visibility = "visible";
    };

    updateStatusBar();

    const observer = new MutationObserver((mutations) => {
      if (cancelled) return;
      const hasClassChange = mutations.some((m) => m.attributeName === "class");
      if (hasClassChange) updateStatusBar();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [layout, themeType]);
}

function classifyRoute(pathname: string) {
  const lower = pathname.toLowerCase();
  return {
    isHome: pathname === "/",
    isToolsPage: lower.startsWith("/tools"),
    isDashboardPage: lower.startsWith("/dashboard"),
    isProductsPage: lower.startsWith("/products"),
    isCollectionsPage: lower.startsWith("/collections"),
    isCheckoutRoute: lower.startsWith("/checkout") || lower.startsWith("/cart"),
    isProfileMeRoute: lower.startsWith("/profile/me"),
    isAuthPage:
      lower.startsWith("/sign-in") ||
      lower.startsWith("/sign-up") ||
      lower.startsWith("/forgot-password"),
    isCategoryPage:
      /^\/[^\/]+$/.test(pathname) &&
      !lower.startsWith("/tools") &&
      !lower.startsWith("/dashboard") &&
      !lower.startsWith("/products") &&
      !lower.startsWith("/auth"),
  };
}

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { themeType } = useTheme();
  const { session } = useAuth();

  const screenSize = useScreenSize();
  const route = classifyRoute(pathname);

  const isShopRoute =
    route.isHome ||
    route.isProductsPage ||
    route.isCollectionsPage ||
    route.isCategoryPage;

  const useAppHeader = route.isCheckoutRoute || route.isProfileMeRoute;

  const metaLayout = route.isDashboardPage
    ? "dashboard"
    : useAppHeader
    ? "app"
    : "shop";

  useMetaThemeColor(metaLayout, themeType);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [session?.user?.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!route.isAuthPage && !route.isDashboardPage) {
      setCookie("lastPage", pathname, { path: "/", maxAge: 86400 });
    }
  }, [pathname, route.isAuthPage, route.isDashboardPage]);

  useEffect(() => {
    if (typeof window === "undefined" || route.isAuthPage) return;

    try {
      const isFirstLoad = !sessionStorage.getItem("analyticsInit");
      if (isFirstLoad) {
        sessionStorage.setItem("analyticsInit", "1");
        return;
      }

      const lastUrl = sessionStorage.getItem("lastTrackedUrl");
      if (lastUrl === pathname) return;
      sessionStorage.setItem("lastTrackedUrl", pathname);
    } catch (e) {}

    analytics.onRouteChange(window.location.href);

    const pageCategory = route.isHome
      ? "landing"
      : route.isToolsPage
      ? "tools"
      : route.isDashboardPage
      ? "dashboard"
      : "general";

    const scheduleTracking = () => {
      analytics.trackEvent("navigation", {
        category: "user_flow",
        action: "page_change",
        label: pageCategory,
        metadata: {
          pathname,
          from: document.referrer || "direct",
          pageType: pageCategory,
          timestamp: Date.now(),
        },
      });
    };

    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(scheduleTracking);
    } else {
      setTimeout(scheduleTracking, 0);
    }
  }, [pathname, route]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("logout") === "true") {
      params.delete("logout");
      const newUrl =
        window.location.pathname +
        (params.toString() ? "?" + params.toString() : "");
      window.location.replace(newUrl);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("signin") === "true") {
      params.delete("signin");
      const newUrl =
        window.location.pathname +
        (params.toString() ? "?" + params.toString() : "");
      window.location.replace(newUrl);
    }
  }, []);

  if (route.isDashboardPage) {
    return (
      <SidebarProvider>
        <NextTopLoader
          color="hsl(var(--sidebar-primary))"
          showSpinner={false}
        />
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="w-full">
            <DashboardHeader />
            <main className="isolate mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (route.isAuthPage) {
    return (
      <>
        <RegionBootstrap />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "hsl(var(--background))",
              color: "hsl(var(--foreground))",
              border: "1px solid hsl(var(--border))",
            },
          }}
        />
      </>
    );
  }

  const cookieVariant =
    screenSize === "mobile"
      ? "small"
      : screenSize === "tablet"
      ? "mini"
      : "default";

  return (
    <CartProvider>
      <RegionBootstrap />

      {useAppHeader ? (
        <AppHeader />
      ) : isShopRoute ? (
        <>
          {/* Optional but recommended if Header needs auth UI */}
          <ShopHeader
            // @ts-expect-error - add these props if your header supports them
            session={session}
            onMenuClick={() => setMobileMenuOpen(true)}
          />

          {mobileMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
                aria-hidden="true"
              />
              <div
                className="fixed bottom-0 left-0 top-0 z-50 w-[min(86vw,360px)] overflow-y-auto border-r border-[var(--lt-border)] bg-[var(--lt-bg)] shadow-[var(--lt-shadow)] lg:hidden"
                data-layout="shop"
              >
                <MobileDrawer
                  key={session?.user?.id || "guest"}
                  session={session}
                  onClose={() => setMobileMenuOpen(false)}
                />
              </div>
            </>
          )}
        </>
      ) : null}

      {children}

      <Suspense fallback={<div style={{ minHeight: "1px" }} />}>
        {!useAppHeader && isShopRoute && <Footer />}
        {!useAppHeader && isShopRoute && <AccessibilityOverlay />}

        <CookieConsent
          variant={cookieVariant}
          showCustomize={screenSize !== "mobile"}
          description={
            screenSize === "mobile"
              ? "We use cookies to enhance your experience. Essential cookies are required for functionality."
              : screenSize === "tablet"
              ? "We use cookies to enhance your experience and analyze usage. Essential cookies required."
              : "We use cookies to enhance your experience, analyze site usage, and improve our services. Essential cookies are required for basic functionality."
          }
        />
      </Suspense>

      <ConditionalOverlays />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--border))",
          },
          success: {
            iconTheme: {
              primary: "hsl(var(--primary))",
              secondary: "hsl(var(--primary-foreground))",
            },
          },
          error: {
            iconTheme: {
              primary: "hsl(var(--destructive))",
              secondary: "hsl(var(--destructive-foreground))",
            },
          },
        }}
      />
    </CartProvider>
  );
}

export function Providers({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession: Session | null;
}) {
  const [session, setSession] = useState<Session | null>(initialSession);

  const supabase = useMemo(() => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ session }}>
      <ThemeProvider>
        <RootLayoutContent>{children}</RootLayoutContent>
      </ThemeProvider>
    </AuthContext.Provider>
  );
}