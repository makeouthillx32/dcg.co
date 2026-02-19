//components/Layouts/meta-theme-color.tsx
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/app/provider";

// ─────────────────────────────────────────────────────────
// MetaThemeColor
// ─────────────────────────────────────────────────────────
// Reads --lt-status-bar from the scoped [data-layout] element.
// CRITICAL FIX: Now waits for the layout element to exist in DOM
// before attempting to read the color, ensuring CSS variables
// are fully resolved by the browser.
//
// Status bar colors are configured in layout-tokens.css only.
// ─────────────────────────────────────────────────────────

type Layout = "shop" | "dashboard" | "app" | "sidebar" | "footer";

interface MetaThemeColorProps {
  layout: Layout;
}

// ─── Helpers ─────────────────────────────────────────────

/** Wait for layout element to exist in DOM, with timeout */
function waitForLayoutElement(layout: Layout, maxWaitMs: number = 500): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const check = () => {
      const el = document.querySelector<HTMLElement>(`[data-layout="${layout}"]`);
      
      if (el) {
        resolve(el);
        return;
      }
      
      if (Date.now() - startTime > maxWaitMs) {
        console.warn(`⚠️ Layout element [data-layout="${layout}"] not found after ${maxWaitMs}ms`);
        resolve(null);
        return;
      }
      
      requestAnimationFrame(check);
    };
    
    check();
  });
}

/** Read --lt-status-bar for a layout by finding its element */
async function getStatusBarColor(layout: Layout): Promise<string> {
  // Wait for the actual rendered element
  const el = await waitForLayoutElement(layout);

  if (el) {
    const raw = getComputedStyle(el).getPropertyValue("--lt-status-bar").trim();
    if (raw) {
      console.log(`✅ Found status bar color for ${layout}:`, raw);
      return normalizeColor(raw);
    }
  }

  // Fallback: Element not in DOM even after waiting
  console.warn(`⚠️ Could not read status bar color for layout: ${layout}`);
  
  // Last resort: try creating temporary element (may not work for nested vars)
  const temp = document.createElement("div");
  temp.setAttribute("data-layout", layout);
  temp.style.position = "absolute";
  temp.style.visibility = "hidden";
  temp.style.pointerEvents = "none";
  document.body.appendChild(temp);
  
  // Force a reflow to ensure styles are computed
  temp.offsetHeight;
  
  const raw = getComputedStyle(temp).getPropertyValue("--lt-status-bar").trim();
  document.body.removeChild(temp);

  if (raw) {
    console.log(`⚠️ Fallback status bar color for ${layout}:`, raw);
    return normalizeColor(raw);
  }

  return "";
}

function normalizeColor(raw: string): string {
  if (raw.startsWith("#") || raw.startsWith("rgb")) {
    return raw;
  }
  // HSL values might come back as "0 84.2% 60.2%" or "hsl(0 84.2% 60.2%)"
  if (raw.startsWith("hsl(")) {
    return raw;
  }
  return `hsl(${raw})`;
}

/** Convert any color string to hex — iOS Chromium requires it. */
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

/** Write color to meta[name="theme-color"], creating it if absent. */
function writeMetaColor(color: string) {
  if (!color) return;
  let tag = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", "theme-color");
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", color);
}

// ─── iOS Chromium sync ───────────────────────────────────
function setupIOSChromiumSync(): (() => void) | void {
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isChromium = /CriOS|EdgiOS|FxiOS|OPiOS|Mercury/.test(ua);
  if (!isIOS || !isChromium) return;

  const sync = () => {
    const main = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!main) return;
    const color = main.getAttribute("content") ?? "";
    const apply = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };
    apply("apple-mobile-web-app-capable", "yes");
    apply("apple-mobile-web-app-status-bar-style", "default");
    apply("theme-color-ios", color);
  };

  sync();

  const main = document.querySelector('meta[name="theme-color"]');
  if (!main) return;
  const observer = new MutationObserver(sync);
  observer.observe(main, { attributes: true });
  return () => observer.disconnect();
}

// ─── Component ───────────────────────────────────────────

export default function MetaThemeColor({ layout }: MetaThemeColorProps) {
  const { themeType } = useTheme();
  const [isReady, setIsReady] = useState(false);

  // Wait for component to mount before reading colors
  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    let cancelled = false;

    const updateColor = async () => {
      const color = await getStatusBarColor(layout);
      if (cancelled) return;
      const hexColor = toHex(color);
      writeMetaColor(hexColor);
    };

    updateColor();

    return () => {
      cancelled = true;
    };
  }, [layout, themeType, isReady]);

  useEffect(() => {
    const cleanup = setupIOSChromiumSync();
    return () => { cleanup?.(); };
  }, []);

  return null;
}