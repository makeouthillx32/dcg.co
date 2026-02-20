// app/layout.tsx - BLAZING FAST - Zero Loops, Cookie Cache, Lazy Load
"use client";

import { useEffect, useLayoutEffect, useState, lazy, Suspense } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Providers } from "./provider";
import { useTheme } from "./provider";
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
import { RefreshCw } from "lucide-react";
import "./globals.css";
import "@/css/satoshi.css";
import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

// ✅ LAZY LOAD NON-CRITICAL COMPONENTS (that don't need CartProvider)
const Footer = lazy(() => import("@/components/Layouts/footer"));
const AccessibilityOverlay = lazy(() => import("@/components/Layouts/overlays/accessibility/accessibility"));
const CookieConsent = lazy(() => import("@/components/CookieConsent").then(m => ({ default: m.CookieConsent })));

// ✅ IMPORT ConditionalOverlays normally (needs CartProvider context)
import ConditionalOverlays from "@/components/Layouts/overlays/ConditionalOverlays";
import { CartProvider } from "@/components/Layouts/overlays/cart/cart-context";

/* ──────────────────────────────────────────────────────────────
   ✅ PWA / A2HS STANDALONE DETECTION (NO LOOPS, NO POLLING)
   - Adds html.is-pwa class when in standalone mode
   - Used to show refresh affordance
────────────────────────────────────────────────────────────── */
function detectStandalone() {
  if (typeof window === "undefined") return false;

  // Modern: display-mode
  const dm = window.matchMedia?.("(display-mode: standalone)")?.matches;

  // iOS Safari legacy
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const iosLegacy = (window.navigator as any).standalone === true;

  return Boolean(dm || iosLegacy);
}

function useStandalonePwa() {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const update = () => setIsStandalone(detectStandalone());
    update();

    const mq = window.matchMedia?.("(display-mode: standalone)");
    mq?.addEventListener?.("change", update);

    return () => mq?.removeEventListener?.("change", update);
  }, []);

  // ✅ toggle html class for CSS specialization
  useEffect(() => {
    const root = document.documentElement;
    if (!root) return;

    if (isStandalone) root.classList.add("is-pwa");
    else root.classList.remove("is-pwa");
  }, [isStandalone]);

  return isStandalone;
}

// ✅ COOKIE-CACHED SCREEN SIZE (iOS-safe with fallbacks)
function useScreenSize() {
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">(() => {
    if (typeof window === "undefined") return "desktop";

    try {
      const cached = getCookie("screenSize");
      if (cached === "mobile" || cached === "tablet" || cached === "desktop") {
        return cached;
      }
    } catch (e) {
      console.warn("Cookie access failed:", e);
    }

    try {
      const width = window.innerWidth;
      const size = width < 768 ? "mobile" : width < 1024 ? "tablet" : "desktop";

      try {
        setCookie("screenSize", size, { maxAge: 86400 });
      } catch {}

      return size;
    } catch {
      return "desktop";
    }
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const checkScreenSize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        try {
          const width = window.innerWidth;
          const newSize = width < 768 ? "mobile" : width < 1024 ? "tablet" : "desktop";
          if (newSize !== screenSize) {
            setScreenSize(newSize);
            try {
              setCookie("screenSize", newSize, { maxAge: 86400 });
            } catch {}
          }
        } catch {}
      }, 200);
    };

    try {
      window.addEventListener("resize", checkScreenSize);
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener("resize", checkScreenSize);
      };
    } catch {
      return () => clearTimeout(timeoutId);
    }
  }, [screenSize]);

  return screenSize;
}

// ✅ OPTIMIZED iOS STATUS BAR - ZERO RETRIES, DIRECT ACCESS
function useMetaThemeColor(layout: "shop" | "dashboard" | "app", themeType: "light" | "dark") {
  useLayoutEffect(() => {
    let cancelled = false;
    let lastColor = "";

    const updateStatusBar = () => {
      if (cancelled) return;

      const el = document.querySelector<HTMLElement>(`[data-layout="${layout}"]`);
      if (!el) return;

      const bgColor = getComputedStyle(el).backgroundColor;
      if (!bgColor || bgColor === "transparent" || bgColor === "rgba(0, 0, 0, 0)") return;

      const match = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!match) return;

      const hex = `#${((1 << 24) + (Number(match[1]) << 16) + (Number(match[2]) << 8) + Number(match[3])).toString(16).slice(1)}`;
      if (hex === lastColor) return;

      lastColor = hex;

      let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "theme-color";
        document.head.appendChild(meta);
      }
      meta.content = hex;

      let appleMeta = document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-status-bar-style"]');
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
      const hasClassChange = mutations.some(m => m.attributeName === "class");
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

// ✅ ROUTE CLASSIFICATION - COMPUTED ONCE, NO LOOPS
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
    isAuthPage: lower.startsWith("/sign-in") || lower.startsWith("/sign-up") || lower.startsWith("/forgot-password"),
    isCategoryPage: /^\/[^\/]+$/.test(pathname) &&
      !lower.startsWith("/tools") &&
      !lower.startsWith("/dashboard") &&
      !lower.startsWith("/products") &&
      !lower.startsWith("/auth"),
  };
}

// ─── Root Layout Content ─────────────────────────────────
function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { themeType } = useTheme();
  const screenSize = useScreenSize();

  // ✅ NEW: PWA detection (standalone mode)
  const isPwa = useStandalonePwa();

  // ✅ SINGLE ROUTE CLASSIFICATION
  const route = classifyRoute(pathname);
  const isShopRoute = route.isHome || route.isProductsPage || route.isCollectionsPage || route.isCategoryPage;
  const useAppHeader = route.isCheckoutRoute || route.isProfileMeRoute;
  const metaLayout = route.isDashboardPage ? "dashboard" : useAppHeader ? "app" : "shop";

  // ✅ iOS status bar
  useMetaThemeColor(metaLayout, themeType);

  // ✅ MOBILE MENU HANDLING
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

  // ✅ COOKIE-BASED LAST PAGE (auth excluded)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!route.isAuthPage && !route.isDashboardPage) {
      setCookie("lastPage", pathname, { path: "/", maxAge: 86400 });
    }
  }, [pathname, route.isAuthPage, route.isDashboardPage]);

  // ✅ ANALYTICS (deduped, lazy, iOS-safe)
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
    } catch {}

    analytics.onRouteChange(window.location.href);

    const pageCategory = route.isHome ? "landing" : route.isToolsPage ? "tools" : route.isDashboardPage ? "dashboard" : "general";

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

  // ✅ Dashboard layout
  if (route.isDashboardPage) {
    return (
      <SidebarProvider>
        <NextTopLoader color="hsl(var(--sidebar-primary))" showSpinner={false} />
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="w-full">
            <DashboardHeader />
            <main className="isolate mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
              {children}
            </main>
          </div>
        </div>

        {/* ✅ PWA Refresh (dashboard too, but only when installed) */}
        {isPwa && (
          <button
            type="button"
            aria-label="Refresh"
            onClick={() => router.refresh()}
            className="
              fixed bottom-6 right-6 z-50
              rounded-full
              border border-[hsl(var(--border))]
              bg-[hsl(var(--card))]
              shadow-[var(--shadow-lg)]
              p-3
              backdrop-blur
              active:scale-95
              transition
            "
          >
            <RefreshCw className="h-5 w-5 text-[hsl(var(--foreground))]" />
          </button>
        )}
      </SidebarProvider>
    );
  }

  // ✅ Auth pages - minimal
  if (route.isAuthPage) {
    return (
      <>
        <RegionBootstrap />
        {children}

        {/* ✅ PWA Refresh (auth too, but only when installed) */}
        {isPwa && (
          <button
            type="button"
            aria-label="Refresh"
            onClick={() => router.refresh()}
            className="
              fixed bottom-6 right-6 z-50
              rounded-full
              border border-[hsl(var(--border))]
              bg-[hsl(var(--card))]
              shadow-[var(--shadow-lg)]
              p-3
              backdrop-blur
              active:scale-95
              transition
            "
          >
            <RefreshCw className="h-5 w-5 text-[hsl(var(--foreground))]" />
          </button>
        )}

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

  // ✅ Shop/App layout with lazy-loaded components
  const cookieVariant = screenSize === "mobile" ? "small" : screenSize === "tablet" ? "mini" : "default";

  return (
    <CartProvider>
      <RegionBootstrap />

      {useAppHeader ? (
        <AppHeader />
      ) : isShopRoute ? (
        <>
          <ShopHeader onMenuClick={() => setMobileMenuOpen(true)} />

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
                <MobileDrawer session={null} onClose={() => setMobileMenuOpen(false)} />
              </div>
            </>
          )}
        </>
      ) : null}

      {children}

      {/* ✅ LAZY LOAD NON-CRITICAL UI */}
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

      {/* ✅ NON-LAZY: ConditionalOverlays needs CartProvider immediately */}
      <ConditionalOverlays />

      {/* ✅ PWA Refresh (shop/app too, but only when installed) */}
      {isPwa && (
        <button
          type="button"
          aria-label="Refresh"
          onClick={() => router.refresh()}
          className="
            fixed bottom-6 right-6 z-50
            rounded-full
            border border-[hsl(var(--border))]
            bg-[hsl(var(--card))]
            shadow-[var(--shadow-lg)]
            p-3
            backdrop-blur
            active:scale-95
            transition
          "
        >
          <RefreshCw className="h-5 w-5 text-[hsl(var(--foreground))]" />
        </button>
      )}

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

// ─── Root Layout Wrapper ─────────────────────────────────
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="format-detection" content="telephone=no" />

        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        <link rel="canonical" href="https://desertcowgirl.co/" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Brand",
              name: "Desert Cowgirl",
              description: "Western-inspired pants and shirts with a warm, modern rustic aesthetic.",
              url: "https://desertcowgirl.co/",
              logo: "https://desertcowgirl.co/logo.png",
              sameAs: [],
            }),
          }}
        />
      </head>
      <body className="min-h-screen font-[var(--font-sans)]" suppressHydrationWarning>
        <Providers>
          <RootLayoutContent>{children}</RootLayoutContent>
        </Providers>
      </body>
    </html>
  );
}