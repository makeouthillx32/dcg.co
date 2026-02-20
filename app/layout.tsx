// app/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Providers } from "./provider";
import ConditionalOverlays from "@/components/Layouts/overlays/ConditionalOverlays";
import { CartProvider } from "@/components/Layouts/overlays/cart/cart-context";
import ShopHeader from "@/components/Layouts/shop/Header";
import AppHeader from "@/components/Layouts/app/nav";
import Footer from "@/components/Layouts/footer";
import AccessibilityOverlay from "@/components/Layouts/overlays/accessibility/accessibility";
import { CookieConsent } from "@/components/CookieConsent";
import analytics from "@/lib/analytics";
import { setCookie } from "@/lib/cookieUtils";
import { Toaster } from "react-hot-toast";
import RegionBootstrap from "@/components/Auth/RegionBootstrap";
import MetaThemeColor from "@/components/Layouts/meta-theme-color";
import "./globals.css";

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
    case "mobile": return "small";
    case "tablet": return "mini";
    default: return "default";
  }
}

function ClientContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isFirstLoad, setIsFirstLoad] = useState(true);
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

  const metaLayout = isDashboardPage ? "dashboard" : useAppHeader ? "app" : "shop";

  return (
    <>
      <RegionBootstrap />

      {/* ✅ Headers render FIRST - this ensures [data-layout] exists */}
      {useAppHeader ? <AppHeader /> : showNav && <ShopHeader />}
      
      {/* ✅ MetaThemeColor runs AFTER headers are mounted */}
      <MetaThemeColor layout={metaLayout} />

      {children}
      
      {!useAppHeader && showFooter && <Footer />}
      {!useAppHeader && showAccessibility && <AccessibilityOverlay />}

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
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* iOS-specific status bar configuration */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
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
              description:
                "Western-inspired pants and shirts with a warm, modern rustic aesthetic.",
              url: "https://desertcowgirl.co/",
              logo: "https://desertcowgirl.co/logo.png",
              sameAs: [],
            }),
          }}
        />
      </head>
      <body className="min-h-screen font-[var(--font-sans)]">
        <Providers>
          <CartProvider>
            <ClientContent>{children}</ClientContent>
            <ConditionalOverlays />
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}