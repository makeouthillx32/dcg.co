// components/theme/ThemeProvider.tsx
"use client";

import React, { createContext, useEffect, useState } from "react";
import { Theme } from "@/types/theme";
import { defaultThemeId, themeMap } from "@/themes";
import { setCookie, getCookie } from "@/lib/cookieUtils";

export interface ThemeContextType {
  // Theme settings
  themeId: string;
  setThemeId: (id: string) => void;
  
  // Color mode settings (dark/light)
  themeType: "light" | "dark";
  toggleTheme: () => void;
  
  // Utility functions
  getTheme: () => Theme;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Theme state
  const [themeId, setThemeIdState] = useState<string>(defaultThemeId);
  const [themeType, setThemeType] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // Get current theme object
  const getTheme = (): Theme => {
    return themeMap[themeId] || themeMap[defaultThemeId];
  };

  // Set theme ID and save to cookies
  const setThemeId = (id: string) => {
    if (themeMap[id]) {
      setThemeIdState(id);
      setCookie("themeId", id, { path: "/", maxAge: 31536000 });
    }
  };

  // Toggle between light and dark mode
  const toggleTheme = () => {
    const newThemeType = themeType === "light" ? "dark" : "light";
    setThemeType(newThemeType);
    setCookie("themeType", newThemeType, { path: "/", maxAge: 31536000 });
  };

  // Initialize theme from cookies or system preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      setMounted(true);
      
      // Get theme ID from cookie or use default
      const savedThemeId = getCookie("themeId") || localStorage.getItem("themeId");
      if (savedThemeId && themeMap[savedThemeId]) {
        setThemeIdState(savedThemeId);
      }
      
      // Get theme type from cookie or system preference
      const savedThemeType = getCookie("themeType") || localStorage.getItem("themeType");
      if (savedThemeType === "light" || savedThemeType === "dark") {
        setThemeType(savedThemeType);
      } else {
        // Use system preference as fallback
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setThemeType(systemPrefersDark ? "dark" : "light");
      }
    }
  }, []);

  // Apply theme variables when theme or mode changes
  useEffect(() => {
    if (!mounted) return;
    
    const html = document.documentElement;
    const theme = getTheme();
    const variables = themeType === "dark" ? theme.dark : theme.light;
    
    // Apply theme CSS variables
    for (const [key, value] of Object.entries(variables)) {
      html.style.setProperty(key, value);
    }
    
    // Apply dark class for tailwind
    html.classList.remove("light", "dark");
    html.classList.add(themeType);
    
    // Save preferences
    localStorage.setItem("themeId", themeId);
    localStorage.setItem("themeType", themeType);
    
    // Update theme-color meta tag
    updateThemeColorMeta(themeType, theme, html);
  }, [themeId, themeType, mounted]);

  // Update theme-color meta tag for browser UI
  const updateThemeColorMeta = (
    mode: "light" | "dark", 
    theme: Theme,
    root: HTMLElement
  ) => {
    const variables = mode === "dark" ? theme.dark : theme.light;
    
    // Get appropriate color based on the current page
    const isHome = window.location.pathname === "/";
    let colorVariable = isHome 
      ? (mode === "dark" ? "--sidebar" : "--background")
      : "--background";
    
    // Get the color value
    let themeColor = variables[colorVariable] || "";
    if (themeColor.startsWith("hsl")) {
      themeColor = themeColor; // Use as is
    } else {
      // Convert HSL components to actual color
      themeColor = `hsl(${themeColor})`;
    }
    
    // Set meta tag
    let metaTag = document.querySelector("meta[name='theme-color']");
    if (!metaTag) {
      metaTag = document.createElement("meta");
      metaTag.setAttribute("name", "theme-color");
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute("content", themeColor);
  };

  // Context value
  const contextValue: ThemeContextType = {
    themeId,
    setThemeId,
    themeType,
    toggleTheme,
    getTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;