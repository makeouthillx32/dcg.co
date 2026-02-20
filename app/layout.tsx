// app/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Providers } from "./provider";
import { useTheme } from "./provider";
import ShopHeader from "@/components/Layouts/shop/Header";
import AppHeader from "@/components/Layouts/app/nav";
import { Header as DashboardHeader } from "@/components/Layouts/dashboard";
import { Sidebar } from "@/components/Layouts/sidebar";
import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import Footer from "@/components/Layouts/footer";
import AccessibilityOverlay from "@/components/Layouts/overlays/accessibility/accessibility";
import { CookieConsent } from "@/components/CookieConsent";
import ConditionalOverlays from "@/components/Layouts/overlays/ConditionalOverlays";
import { CartProvider } from "@/components/Layouts/overlays/cart/cart-context";
import analytics from "@/lib/analytics";
import { setCookie } from "@/lib/cookieUtils";
import { Toaster } from "react-hot-toast";
import RegionBootstrap from "@/components/Auth/RegionBootstrap";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import "@/css/satoshi.css";
import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

function useScreenSize() {
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">("desktop");

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) setScreenSize("mobile");
      else if (width < 1024) setScreenSize("tablet");
      else setScreenSize("desktop");
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return screenSize;
}

function getCookieConsentVariant(screenSize: "mobile" | "tablet" | "desktop") {
  switch (screenSize) {
    case "mobile":
      return "small";
    case "tablet":
      return "mini";
    default:
      return "default";
  }
}

// ─── iOS Status Bar Meta Tag Management ─────────────────────────

function setMetaTag(name: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }

  // iOS Safari can be stubborn; forcing a reset sometimes helps.
  // (Safe no-op for other browsers)
  tag.setAttribute("content", "");
  tag.setAttribute("content", content);
}

function rgbToHex(rgb: string): string {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return "";

  const r = Number(match[1]);
  const g = Number(match[2]);
  const b = Number(match[3]);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Read the resolved background color from the layout element.
 *
 * The dashboard header works because its <header data-layout="dashboard">
 * applies bg-[var(--lt-bg)] directly, and --lt-bg resolves through the chain:
 *   --lt-bg -> --gp-bg -> hsl(var(--destructive))
 *
 * We use three strategies in order:
 *   1. Read the element's own computed backgroundColor
 *   2. Probe inside the element with var(--lt-status-bar, var(--lt-bg))
 *   3. Probe on document.body with var(--gp-status-bar, var(--gp-bg))
 *      (bypasses layout-scoped tokens, reads the global palette directly)
 */
function getResolvedStatusBarColor(layoutEl: HTMLElement): string | null {
  const isUsable = (c: string | undefined | null) =>
    !!c && c !== "transparent" && c !== "rgba(0, 0, 0, 0)";

  const layout = layoutEl.getAttribute("data-layout") || "unknown";
  const cs = getComputedStyle(layoutEl);

  // Log the CSS variable chain for diagnostics
  console.log(`[v0] StatusBarColor[${layout}] diagnostics:`, {
    tagName: layoutEl.tagName,
    className: layoutEl.className.slice(0, 100),
    "--lt-bg": cs.getPropertyValue("--lt-bg").trim(),
    "--lt-status-bar": cs.getPropertyValue("--lt-status-bar").trim(),
    "--gp-bg": cs.getPropertyValue("--gp-bg").trim(),
    "--gp-status-bar": cs.getPropertyValue("--gp-status-bar").trim(),
    "--destructive": cs.getPropertyValue("--destructive").trim(),
    backgroundColor: cs.backgroundColor,
    background: cs.background.slice(0, 80),
  });

  // Strategy 1: element's own computed background
  const directBg = cs.backgroundColor;
  if (isUsable(directBg)) {
    console.log(`[v0] StatusBarColor[${layout}] -> Strategy 1 (direct): ${directBg}`);
    return directBg;
  }

  // Strategy 2: probe inside the layout element (inherits --lt-* tokens)
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:absolute;left:-9999px;top:0;width:1px;height:1px;pointer-events:none;" +
    "background-color:var(--lt-status-bar, var(--lt-bg))";
  layoutEl.appendChild(probe);
  const probeBg = getComputedStyle(probe).backgroundColor;
  layoutEl.removeChild(probe);
  console.log(`[v0] StatusBarColor[${layout}] -> Strategy 2 (probe): ${probeBg}`);
  if (isUsable(probeBg)) return probeBg;

  // Strategy 3: probe on body with global palette tokens directly
  const bodyProbe = document.createElement("div");
  bodyProbe.style.cssText =
    "position:absolute;left:-9999px;top:0;width:1px;height:1px;pointer-events:none;" +
    "background-color:var(--gp-status-bar, var(--gp-bg))";
  document.body.appendChild(bodyProbe);
  const bodyProbeBg = getComputedStyle(bodyProbe).backgroundColor;
  document.body.removeChild(bodyProbe);
  console.log(`[v0] StatusBarColor[${layout}] -> Strategy 3 (body): ${bodyProbeBg}`);
  if (isUsable(bodyProbeBg)) return bodyProbeBg;

  return null;
}

function useMetaThemeColor(layout: "shop" | "dashboard" | "app", themeType: "light" | "dark") {
  useEffect(() => {
    let cancelled = false;
    let lastHex = "";

    const applyColor = () => {
      if (cancelled) return false;

      const el = document.querySelector<HTMLElement>(`[data-layout="${layout}"]`);
      if (!el) {
        console.log(`[v0] useMetaThemeColor: [data-layout="${layout}"] not found`);
        return false;
      }

      const rgb = getResolvedStatusBarColor(el);
      if (!rgb) {
        console.log(`[v0] useMetaThemeColor layout="${layout}" - no color resolved`);
        return false;
      }

      const hexColor = rgbToHex(rgb);
      if (!hexColor) return false;

      // Only update if the color actually changed
      if (hexColor !== lastHex) {
        lastHex = hexColor;
        console.log(`[v0] useMetaThemeColor layout="${layout}" -> "${hexColor}"`);
        setMetaTag("theme-color", hexColor);
        setMetaTag("apple-mobile-web-app-status-bar-style", "black-translucent");
      }
      return true;
    };

    // --- Phase 1: Poll until the element exists and has a color ---
    let attempts = 0;
    const maxAttempts = 120;
    const poll = () => {
      if (cancelled) return;
      attempts++;
      if (applyColor()) return;
      if (attempts < maxAttempts) requestAnimationFrame(poll);
    };
    requestAnimationFrame(poll);

    // --- Phase 2: MutationObserver on <html> for theme changes ---
    // The theme provider applies CSS vars to <html> via useEffect after
    // fetching from Supabase. We debounce because it sets many vars in a loop.
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const observer = new MutationObserver(() => {
      if (cancelled) return;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        requestAnimationFrame(() => applyColor());
      }, 80);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    return () => {
      cancelled = true;
      observer.disconnect();
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [layout, themeType]);
}

// ─── Root Layout Content ─────────────────────────────────

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const { themeType } = useTheme();

  const screenSize = useScreenSize();
  const cookieVariant = getCookieConsentVariant(screenSize);

  const lowerPath = pathname.toLowerCase();

  const isHome = pathname === "/";
  const isToolsPage = lowerPath.startsWith("/tools");
  const isDashboardPage = lowerPath.startsWith("/dashboard");
  const isProductsPage = lowerPath.startsWith("/products");
  const isCollectionsPage = lowerPath.startsWith("/collections");
  const isCategoryPage =
    /^\/[^\/]+$/.test(pathname) &&
    !isToolsPage &&
    !isDashboardPage &&
    !isProductsPage &&
    !lowerPath.startsWith("/auth");

  const isCheckoutRoute = lowerPath.startsWith("/checkout") || lowerPath.startsWith("/cart");
  const isProfileMeRoute = lowerPath.startsWith("/profile/me");

  const isShopRoute = isHome || isProductsPage || isCollectionsPage || isCategoryPage;
  const useAppHeader = isCheckoutRoute || isProfileMeRoute;

  // Determine layout type
  const metaLayout = isDashboardPage ? "dashboard" : useAppHeader ? "app" : "shop";

  // ✅ iOS status bar hook (resolved computed color via probe)
  useMetaThemeColor(metaLayout, themeType);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up" || lowerPath.startsWith("/auth");
      if (!isAuthPage) {
        setCookie("lastPage", pathname, { path: "/" });
      }
    }
  }, [pathname, lowerPath]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up" || lowerPath.startsWith("/auth");
    if (isAuthPage) return;

    if (isFirstLoad) {
      setIsFirstLoad(false);
      return;
    }

    analytics.onRouteChange(window.location.href);

    let pageCategory = "general";
    if (isHome) pageCategory = "landing";
    else if (isToolsPage) pageCategory = "tools";
    else if (isDashboardPage) pageCategory = "dashboard";

    setTimeout(() => {
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
    }, 100);
  }, [pathname, lowerPath, isHome, isToolsPage, isDashboardPage, isFirstLoad]);

  useEffect(() => {
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      (window as any).debugAnalytics = () => {
        console.log("🔍 Analytics Debug Info:");
        console.log("Session ID:", analytics.getSessionId());
        console.log("Stats:", analytics.getStats());
        analytics.debug();
      };
    }
  }, []);

  const showNav = isShopRoute;
  const showFooter = isShopRoute;
  const showAccessibility = isShopRoute;

  // ✅ Dashboard layout rendering
  if (isDashboardPage) {
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

  // ✅ Shop/App layout rendering
  return (
    <CartProvider>
      <RegionBootstrap />

      {/* Headers render */}
      {useAppHeader ? <AppHeader /> : showNav && <ShopHeader />}

      {children}

      {!useAppHeader && showFooter && <Footer />}
      {!useAppHeader && showAccessibility && <AccessibilityOverlay />}

      <ConditionalOverlays />

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
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* Optional: provide a default theme-color so iOS has something immediately */}
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
      <body className="min-h-screen font-[var(--font-sans)]">
        <Providers>
          <RootLayoutContent>{children}</RootLayoutContent>
        </Providers>
      </body>
    </html>
  );
}
