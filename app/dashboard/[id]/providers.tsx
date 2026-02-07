"use client";

import * as React from "react";
import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { ThemeProvider, useTheme } from "next-themes";
import { useEffect } from "react";
import { transitionTheme } from "@/utils/themeTransitions";

// Enhanced theme manager for dashboard with smooth transitions
function DashboardThemeColorManager() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const updateThemeColor = () => {
      // Remove existing theme-color meta tags
      document.querySelectorAll('meta[name="theme-color"]').forEach((el) => el.remove());

      const html = document.documentElement;
      const computedStyle = getComputedStyle(html);

      // In your setup --background is likely "H S% L%" (shadcn style)
      const raw = computedStyle.getPropertyValue("--background").trim();

      let finalColor = raw;

      // Fallback if variable is missing
      if (!finalColor) {
        finalColor = resolvedTheme === "dark" ? "#111827" : "#ffffff";
      } else {
        // If it looks like "220 14% 11%" convert to a real CSS color:
        // IMPORTANT: theme-color meta supports CSS color strings, doesn't need hex.
        if (finalColor.includes(" ")) finalColor = `hsl(${finalColor})`;
        else if (!finalColor.startsWith("#")) finalColor = `#${finalColor}`;
      }

      const metaTag = document.createElement("meta");
      metaTag.setAttribute("name", "theme-color");
      metaTag.setAttribute("content", finalColor);
      document.head.appendChild(metaTag);
    };

    updateThemeColor();

    const observer = new MutationObserver(() => {
      setTimeout(updateThemeColor, 50);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => observer.disconnect();
  }, [resolvedTheme]);

  return null;
}

// Theme manager that adds enhanced transition support
function DashboardThemeManager({ children }: { children: React.ReactNode }) {
  const theme = useTheme();

  useEffect(() => {
    (window as any).smoothToggleTheme = async (coordinates?: { x: number; y: number }) => {
      const themeChangeCallback = () => {
        theme.setTheme(theme.resolvedTheme === "dark" ? "light" : "dark");
      };
      await transitionTheme(themeChangeCallback, coordinates);
    };

    (window as any).smoothSetTheme = async (newTheme: string, coordinates?: { x: number; y: number }) => {
      const themeChangeCallback = () => {
        theme.setTheme(newTheme);
      };
      await transitionTheme(themeChangeCallback, coordinates);
    };

    return () => {
      delete (window as any).smoothToggleTheme;
      delete (window as any).smoothSetTheme;
    };
  }, [theme]);

  return (
    <>
      <DashboardThemeColorManager />
      {children}
    </>
  );
}

// Keep the same structure as your original
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      <DashboardThemeManager>
        <SidebarProvider>{children}</SidebarProvider>
      </DashboardThemeManager>
    </ThemeProvider>
  );
}
