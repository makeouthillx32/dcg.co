"use client";

import { useEffect } from "react";
import { useTheme } from "@/app/provider";

export default function MetaThemeColor({ type }: { type: "home" | "app" }) {
  const { themeType } = useTheme();
  const isDark = themeType === "dark";

  useEffect(() => {
    // Function to get computed CSS variable value
    const getCSSVariable = (variable: string): string => {
      const root = document.documentElement;
      const value = getComputedStyle(root).getPropertyValue(variable).trim();
      return value || '';
    };

    const meta = document.querySelector('meta[name="theme-color"]') || document.createElement("meta");
    meta.setAttribute("name", "theme-color");

    let color;

    if (type === "home") {
      // For home pages, use home-prefixed variables
      color = isDark 
        ? getCSSVariable('--sidebar') 
        : getCSSVariable('--background');
    } else {
      // For app pages, use standard variables
      color = isDark 
        ? getCSSVariable('--background') 
        : getCSSVariable('--background');
    }

    // Ensure we have a valid color or fall back to defaults
    if (!color || !color.startsWith('#') && !color.startsWith('hsl') && !color.startsWith('rgb')) {
      // Try secondary source if primary failed
      if (type === "home") {
        color = isDark 
          ? getCSSVariable('--sidebar') // Fall back to regular sidebar 
          : getCSSVariable('--background'); // Fall back to regular background
      }
      
      // If still no valid color, use hardcoded defaults
      if (!color || !color.startsWith('#') && !color.startsWith('hsl') && !color.startsWith('rgb')) {
        color = isDark ? "#111827" : "#ffffff";
      }
    }

    meta.setAttribute("content", color);
    
    if (!document.head.contains(meta)) {
      document.head.appendChild(meta);
    }
  }, [themeType, type, isDark]);

  return null;
}