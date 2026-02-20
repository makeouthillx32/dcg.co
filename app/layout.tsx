// app/layout.tsx - BLAZING FAST - Zero Loops, Cookie Cache, Lazy Load
"use client";

import { useEffect, useLayoutEffect, useState, lazy, Suspense } from "react";
import { usePathname } from "next/navigation";
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

// ✅ COOKIE-CACHED SCREEN SIZE (no resize listener until needed)
function useScreenSize() {
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">(() => {
    // Try cookie first (SSR-safe)
    if (typeof window === "undefined") return "desktop";
    
    const cached = getCookie("screenSize");
    if (cached === "mobile" || cached === "tablet" || cached === "desktop") {
      return cached;
    }
    
    // Calculate once on mount
    const width = window.innerWidth;
    const size = width < 768 ? "mobile" : width < 1024 ? "tablet" : "desktop";
    setCookie("screenSize", size, { maxAge: 86400 }); // 24h
    return size;
  });

  useEffect(() => {
    // Only add listener if screen size matters (for cookie consent variant)
    let timeoutId: NodeJS.Timeout;
    
    const checkScreenSize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const width = window.innerWidth;
        const newSize = width < 768 ? "mobile" : width < 1024 ? "tablet" : "desktop";
        if (newSize !== screenSize) {
          setScreenSize(newSize);
          setCookie("screenSize", newSize, { maxAge: 86400 });
        }
      }, 200); // Debounce
    };

    window.addEventListener("resize", checkScreenSize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", checkScreenSize);
    };
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
      if (!el) return; // Element renders synchronously now, if not found = wrong layout

      const bgColor = getComputedStyle(el).backgroundColor;
      if (!bgColor || bgColor === "transparent" || bgColor === "rgba(0, 0, 0, 0)") return;

      // Convert RGB to hex
      const match = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!match) return;
      
      const hex = `#${((1 << 24) + (Number(match[1]) << 16) + (Number(match[2]) << 8) + Number(match[3])).toString(16).slice(1)}`;
      if (hex === lastColor) return;

      lastColor = hex;

      // Update meta tags
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

      // Force repaint
      el.style.visibility = "hidden";
      el.offsetHeight;
      el.style.visibility = "visible";
    };

    // Single execution
    updateStatusBar();

    // Only watch theme toggle (class changes on html element)
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { themeType } = useTheme();
  const screenSize = useScreenSize();

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
      setCookie("lastPage", pathname, { path: "/", maxAge: 86400 }); // 24h
    }
  }, [pathname, route.isAuthPage, route.isDashboardPage]);

  // ✅ ANALYTICS (deduped, lazy)
  useEffect(() => {
    if (typeof window === "undefined" || route.isAuthPage) return;

    // Skip first load
    const isFirstLoad = !sessionStorage.getItem("analyticsInit");
    if (isFirstLoad) {
      sessionStorage.setItem("analyticsInit", "1");
      return;
    }

    // Debounce duplicate tracks
    const lastUrl = sessionStorage.getItem("lastTrackedUrl");
    if (lastUrl === pathname) return;
    
    sessionStorage.setItem("lastTrackedUrl", pathname);
    analytics.onRouteChange(window.location.href);

    const pageCategory = route.isHome ? "landing" : route.isToolsPage ? "tools" : route.isDashboardPage ? "dashboard" : "general";

    requestIdleCallback(() => {
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
    });
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
      </SidebarProvider>
    );
  }

  // ✅ Auth pages - minimal
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
      <Suspense fallback={null}>
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