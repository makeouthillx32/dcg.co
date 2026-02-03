// components/ClientLayout.tsx - ADD RESPONSIVE COOKIE CONSENT VARIANT

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import AccessibilityOverlay from "@/components/theme/accessibility";
import { CookieConsent } from "@/components/CookieConsent";
import analytics from "@/lib/analytics";
import { setCookie } from "@/lib/cookieUtils";

// ✅ ADD: Hook to detect screen size
function useScreenSize() {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      
      if (width < 768) {
        setScreenSize('mobile');    // < 768px = mobile
      } else if (width < 1024) {
        setScreenSize('tablet');    // 768px - 1023px = tablet  
      } else {
        setScreenSize('desktop');   // >= 1024px = desktop
      }
    };

    // Check on mount
    checkScreenSize();

    // Listen for window resize
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return screenSize;
}

// ✅ ADD: Get variant based on screen size
function getCookieConsentVariant(screenSize: 'mobile' | 'tablet' | 'desktop') {
  switch (screenSize) {
    case 'mobile':
      return 'small';   // Mobile uses 'small' variant
    case 'tablet':
      return 'mini';    // Tablet uses 'mini' variant
    case 'desktop':
    default:
      return 'default'; // Desktop uses 'default' variant
  }
}

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  
  // ✅ ADD: Screen size detection
  const screenSize = useScreenSize();
  const cookieVariant = getCookieConsentVariant(screenSize);

  const isHome = pathname === "/";
  const isToolsPage = pathname.toLowerCase().startsWith("/tools");
  const isDashboardPage = pathname.toLowerCase().startsWith("/dashboard");

  // ✅ EXISTING: All your existing useEffect hooks remain the same...
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Get theme from localStorage
      const theme = localStorage.getItem("theme") || "light";
      setIsDarkMode(theme === "dark");

      const updateThemeColor = () => {
        const root = document.documentElement;
        let backgroundColor = getComputedStyle(root).getPropertyValue('--background').trim();
        console.log('🔍 Raw CSS --background value:', backgroundColor);
        
        let themeColor = '#ffffff';
        
        if (backgroundColor) {
          const hslMatch = backgroundColor.match(/(\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%/);
          
          if (hslMatch) {
            const [, h, s, l] = hslMatch;
            const hslString = `hsl(${h}, ${s}%, ${l}%)`;
            console.log('🎨 Converted to HSL:', hslString);
            themeColor = hslToHex(parseFloat(h), parseFloat(s), parseFloat(l));
          } else {
            const bodyBg = getComputedStyle(document.body).backgroundColor;
            if (bodyBg && bodyBg !== 'rgba(0, 0, 0, 0)' && bodyBg !== 'transparent') {
              themeColor = rgbToHex(bodyBg);
            }
          }
        }
        
        console.log('🎨 Final theme color for iOS:', themeColor);

        let metaTag = document.querySelector("meta[name='theme-color']") as HTMLMetaElement;
        if (metaTag) {
          metaTag.setAttribute("content", themeColor);
        } else {
          metaTag = document.createElement("meta");
          metaTag.name = "theme-color";
          metaTag.content = themeColor;
          document.head.appendChild(metaTag);
        }

        console.log('📱 iOS theme-color updated:', {
          theme,
          pathname,
          cssBackground: backgroundColor,
          finalColor: themeColor
        });
      };

      setTimeout(updateThemeColor, 100);
      setTimeout(updateThemeColor, 500);
    }
  }, [pathname, isHome, isDarkMode]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuthPage =
        pathname === "/sign-in" ||
        pathname === "/sign-up" ||
        pathname.startsWith("/auth");

      if (!isAuthPage) {
        setCookie("lastPage", pathname, { path: "/" });
      }
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isAuthPage = pathname === "/sign-in" || 
                      pathname === "/sign-up" || 
                      pathname.startsWith("/auth");

    if (isAuthPage) {
      console.log('🚫 Skipping analytics for auth page:', pathname);
      return;
    }

    if (isFirstLoad) {
      console.log('🏠 First load detected, analytics will auto-track initial page view');
      setIsFirstLoad(false);
      return;
    }

    console.log('🔄 SPA navigation detected:', pathname);
    analytics.onRouteChange(window.location.href);
    
    let pageCategory = 'general';
    if (isHome) pageCategory = 'landing';
    else if (isToolsPage) pageCategory = 'tools';
    else if (isDashboardPage) pageCategory = 'dashboard';
    
    setTimeout(() => {
      analytics.trackEvent('navigation', {
        category: 'user_flow',
        action: 'page_change',
        label: pageCategory,
        metadata: {
          pathname,
          from: document.referrer || 'direct',
          pageType: pageCategory,
          timestamp: Date.now()
        }
      });
    }, 100);

  }, [pathname, isHome, isToolsPage, isDashboardPage, isFirstLoad]);

  useEffect(() => {
    if (typeof window !== "undefined" && process.env.NODE_ENV === 'development') {
      (window as any).debugAnalytics = () => {
        console.log('🔍 Analytics Debug Info:');
        console.log('Session ID:', analytics.getSessionId());
        console.log('Stats:', analytics.getStats());
        analytics.debug();
      };
      
      console.log('📊 Analytics Status:', {
        sessionId: analytics.getSessionId(),
        isEnabled: analytics.getStats().isEnabled,
        pageViews: analytics.getStats().pageViews,
        events: analytics.getStats().events
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const body = document.body;
      const className = `min-h-screen font-[var(--font-sans)] ${
        isDarkMode 
          ? "bg-[hsl(var(--background))] text-[hsl(var(--foreground))]" 
          : "bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
      }`;
      body.className = className;
      
      const html = document.documentElement;
      if (isDarkMode) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    }
  }, [isDarkMode]);

  const showNav = !isHome && !isToolsPage && !isDashboardPage;
  const showFooter = !isHome && !isDashboardPage && !isToolsPage;
  const showAccessibility = !pathname.startsWith("/auth") && 
                            pathname !== "/sign-in" && 
                            pathname !== "/sign-up";

  return (
    <>
      {showNav && <Nav />}
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
      {showAccessibility && <AccessibilityOverlay />}
      
      {/* ✅ UPDATED: Responsive Cookie Consent */}
      <CookieConsent
        variant={cookieVariant} // 🎯 Dynamic variant based on screen size
        showCustomize={screenSize !== 'mobile'} // Hide customize button on mobile for space
        description={
          screenSize === 'mobile' 
            ? "We use cookies to enhance your experience. Essential cookies are required for functionality."
            : screenSize === 'tablet'
            ? "We use cookies to enhance your experience and analyze usage. Essential cookies required."
            : "We use cookies to enhance your experience, analyze site usage, and improve our services. Essential cookies are required for basic functionality."
        }
        learnMoreHref="/privacy-policy"
        onAcceptCallback={(preferences) => {
          console.log('✅ Cookies accepted:', preferences);
          console.log('📱 Screen size:', screenSize, '| Variant used:', cookieVariant);
        }}
        onDeclineCallback={(preferences) => {
          console.log('🚫 Non-essential cookies declined:', preferences);
          console.log('📱 Screen size:', screenSize, '| Variant used:', cookieVariant);
        }}
        onCustomizeCallback={(preferences) => {
          console.log('⚙️ Custom preferences saved:', preferences);
          console.log('📱 Screen size:', screenSize, '| Variant used:', cookieVariant);
        }}
      />
      
      {/* ✅ ADD: Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-black/80 text-white text-xs p-2 rounded z-[60] pointer-events-none">
          Screen: {screenSize} | Variant: {cookieVariant}
        </div>
      )}
    </>
  );
}

// ✅ EXISTING: Keep all your helper functions
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function rgbToHex(rgb: string): string {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
  return rgb;
}