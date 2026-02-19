//components/Layouts/meta-theme-color.tsx
"use client";

import { useEffect, useLayoutEffect } from "react";
import { useTheme } from "@/app/provider";

// ─────────────────────────────────────────────────────────
// MetaThemeColor
// ─────────────────────────────────────────────────────────
// Sets browser and iOS status bar colors by reading --lt-status-bar
// from the scoped [data-layout] element.
//
// CRITICAL iOS FIX:
// - Uses useLayoutEffect to set meta tag BEFORE paint
// - Sets apple-mobile-web-app-status-bar-style to "black-translucent"
// - Removes any static fallback meta tags from layout.tsx
// ─────────────────────────────────────────────────────────

type Layout = "shop" | "dashboard" | "app" | "sidebar" | "footer";

interface MetaThemeColorProps {
  layout: Layout;
}

// ─── Helpers ─────────────────────────────────────────────

function getStatusBarColor(layout: Layout): string {
  // First try to find the actual rendered element
  const el = document.querySelector<HTMLElement>(`[data-layout="${layout}"]`);

  if (el) {
    const raw = getComputedStyle(el).getPropertyValue("--lt-status-bar").trim();
    if (raw) return normalizeColor(raw);
  }

  // Element not in DOM — resolve via a temporary scoped div
  const temp = document.createElement("div");
  temp.setAttribute("data-layout", layout);
  temp.style.position = "absolute";
  temp.style.visibility = "hidden";
  temp.style.pointerEvents = "none";
  document.body.appendChild(temp);
  const raw = getComputedStyle(temp).getPropertyValue("--lt-status-bar").trim();
  document.body.removeChild(temp);

  return raw ? normalizeColor(raw) : "";
}

function normalizeColor(raw: string): string {
  if (raw.startsWith("#") || raw.startsWith("rgb") || raw.startsWith("hsl(")) {
    return raw;
  }
  return `hsl(${raw})`;
}

function toHex(color: string): string {
  if (!color) return "";
  if (color.startsWith("#")) return color;
  
  const div = document.createElement("div");
  div.style.color = color;
  document.body.appendChild(div);
  const computed = getComputedStyle(div).color;
  document.body.removeChild(div);
  
  const match = computed.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return color;
  
  const [, r, g, b] = match.map(Number);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function setMetaTag(name: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

// ─── Component ───────────────────────────────────────────

export default function MetaThemeColor({ layout }: MetaThemeColorProps) {
  const { themeType } = useTheme();

  // Use useLayoutEffect to run BEFORE paint, critical for iOS
  useLayoutEffect(() => {
    const color = getStatusBarColor(layout);
    const hexColor = toHex(color);
    
    if (hexColor) {
      // Set standard theme-color for Chrome/Android
      setMetaTag("theme-color", hexColor);
      
      // CRITICAL: iOS Safari needs black-translucent to respect theme-color
      // This allows the status bar to use the theme-color value
      setMetaTag("apple-mobile-web-app-status-bar-style", "black-translucent");
    }
  }, [layout, themeType]);

  return null;
}