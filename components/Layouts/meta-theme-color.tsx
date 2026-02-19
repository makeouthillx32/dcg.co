//components/Layouts/meta-theme-color.tsx
"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useTheme } from "@/app/provider";

// ─────────────────────────────────────────────────────────
// MetaThemeColor
// ─────────────────────────────────────────────────────────
// Sets browser and iOS status bar colors by reading --lt-status-bar
// from the scoped [data-layout] element.
//
// CRITICAL FIX: Waits for DOM element to exist before reading color
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
    console.log(`✅ Found [data-layout="${layout}"]`);
    const raw = getComputedStyle(el).getPropertyValue("--lt-status-bar").trim();
    console.log(`  --lt-status-bar from element: "${raw}"`);
    if (raw) return normalizeColor(raw);
  } else {
    console.warn(`⚠️ Element [data-layout="${layout}"] NOT FOUND - using :root fallback`);
  }

  // FALLBACK: Read directly from :root if element doesn't exist yet
  // This handles the timing issue where layout elements render after MetaThemeColor
  const root = document.documentElement;
  const gpStatusBar = getComputedStyle(root).getPropertyValue("--gp-status-bar").trim();
  console.log(`  --gp-status-bar from :root: "${gpStatusBar}"`);
  
  if (gpStatusBar) {
    return normalizeColor(gpStatusBar);
  }

  console.error(`❌ Could not resolve status bar color for layout: ${layout}`);
  return "";
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
  const [mounted, setMounted] = useState(false);

  // Mark as mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Wait for next frame to ensure DOM is ready
  useEffect(() => {
    if (!mounted) return;

    console.log(`\n🚀 MetaThemeColor: layout="${layout}", theme="${themeType}"`);

    // Use multiple attempts to find the element
    let attempts = 0;
    const maxAttempts = 10;

    const updateColor = () => {
      attempts++;
      console.log(`  Attempt ${attempts}/${maxAttempts}`);

      const color = getStatusBarColor(layout);
      const hexColor = toHex(color);

      if (hexColor) {
        console.log(`  ✅ Final hex color: "${hexColor}"\n`);
        setMetaTag("theme-color", hexColor);
        setMetaTag("apple-mobile-web-app-status-bar-style", "black-translucent");
        return true; // Success
      }

      console.warn(`  ⚠️ No color resolved yet`);
      return false; // Failed
    };

    // Try immediately
    if (updateColor()) return;

    // If failed, keep trying with requestAnimationFrame
    const tryAgain = () => {
      if (attempts >= maxAttempts) {
        console.error(`  ❌ Failed to resolve color after ${maxAttempts} attempts\n`);
        return;
      }

      if (!updateColor()) {
        requestAnimationFrame(tryAgain);
      }
    };

    requestAnimationFrame(tryAgain);
  }, [layout, themeType, mounted]);

  return null;
}