//components/Layouts/meta-theme-color.tsx
"use client";

import { useEffect } from "react";
import { useTheme } from "@/app/provider";

// ─────────────────────────────────────────────────────────
// MetaThemeColor - DEBUG VERSION
// ─────────────────────────────────────────────────────────

type Layout = "shop" | "dashboard" | "app" | "sidebar" | "footer";

interface MetaThemeColorProps {
  layout: Layout;
}

// ─── Helpers ─────────────────────────────────────────────

/** Read --lt-status-bar AND --lt-bg for debugging */
function getStatusBarColor(layout: Layout): string {
  console.log(`🔍 [MetaThemeColor] Reading color for layout: ${layout}`);
  
  // First try to find the actual rendered element
  const el = document.querySelector<HTMLElement>(`[data-layout="${layout}"]`);

  if (el) {
    console.log(`✅ Found element [data-layout="${layout}"]`, el);
    
    const statusBar = getComputedStyle(el).getPropertyValue("--lt-status-bar").trim();
    const bg = getComputedStyle(el).getPropertyValue("--lt-bg").trim();
    const gpBg = getComputedStyle(document.documentElement).getPropertyValue("--gp-bg").trim();
    const gpStatusBar = getComputedStyle(document.documentElement).getPropertyValue("--gp-status-bar").trim();
    
    console.log(`📊 CSS Variables:
  --lt-status-bar: "${statusBar}"
  --lt-bg: "${bg}"
  --gp-bg (from :root): "${gpBg}"
  --gp-status-bar (from :root): "${gpStatusBar}"`);
    
    if (statusBar) {
      const normalized = normalizeColor(statusBar);
      console.log(`✅ Using status bar color: "${normalized}"`);
      return normalized;
    }
  } else {
    console.warn(`⚠️ Element [data-layout="${layout}"] NOT FOUND in DOM`);
  }

  // Element not in DOM — resolve via a temporary scoped div
  console.log(`⚠️ Creating temporary element for layout: ${layout}`);
  const temp = document.createElement("div");
  temp.setAttribute("data-layout", layout);
  temp.style.position = "absolute";
  temp.style.visibility = "hidden";
  temp.style.pointerEvents = "none";
  document.body.appendChild(temp);
  
  const statusBar = getComputedStyle(temp).getPropertyValue("--lt-status-bar").trim();
  const bg = getComputedStyle(temp).getPropertyValue("--lt-bg").trim();
  
  console.log(`📊 Temp element CSS Variables:
  --lt-status-bar: "${statusBar}"
  --lt-bg: "${bg}"`);
  
  document.body.removeChild(temp);

  if (statusBar) {
    const normalized = normalizeColor(statusBar);
    console.log(`⚠️ Using status bar from temp element: "${normalized}"`);
    return normalized;
  }

  console.error(`❌ Could not resolve status bar color for layout: ${layout}`);
  return "";
}

function normalizeColor(raw: string): string {
  console.log(`🎨 Normalizing color: "${raw}"`);
  
  if (raw.startsWith("#") || raw.startsWith("rgb")) {
    console.log(`   → Already normalized (hex or rgb)`);
    return raw;
  }
  if (raw.startsWith("hsl(")) {
    console.log(`   → Already normalized (hsl with parens)`);
    return raw;
  }
  
  // Check if it still contains var() - this means it wasn't resolved!
  if (raw.includes("var(")) {
    console.error(`   ❌ UNRESOLVED VAR() REFERENCE: "${raw}"`);
    return raw; // Return as-is to see the error
  }
  
  console.log(`   → Adding hsl() wrapper`);
  return `hsl(${raw})`;
}

/** Convert any color string to hex — iOS Chromium requires it. */
function toHex(color: string): string {
  console.log(`🔄 Converting to hex: "${color}"`);
  
  if (!color) {
    console.log(`   → Empty color, returning empty string`);
    return "";
  }
  
  if (color.startsWith("#")) {
    console.log(`   → Already hex`);
    return color;
  }
  
  // Check if still contains var() - can't convert!
  if (color.includes("var(")) {
    console.error(`   ❌ Cannot convert unresolved var() to hex: "${color}"`);
    return "";
  }
  
  const div = document.createElement("div");
  div.style.color = color;
  document.body.appendChild(div);
  const computed = getComputedStyle(div).color;
  document.body.removeChild(div);
  
  console.log(`   → Computed color: "${computed}"`);
  
  const match = computed.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) {
    console.error(`   ❌ Failed to parse RGB: "${computed}"`);
    return color;
  }
  
  const [, r, g, b] = match.map(Number);
  const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  console.log(`   ✅ Converted to hex: "${hex}"`);
  return hex;
}

/** Write color to meta[name="theme-color"], creating it if absent. */
function writeMetaColor(color: string) {
  if (!color) {
    console.warn(`⚠️ Attempted to write empty color to meta tag`);
    return;
  }
  
  let tag = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!tag) {
    console.log(`📝 Creating new meta[name="theme-color"] tag`);
    tag = document.createElement("meta");
    tag.setAttribute("name", "theme-color");
    document.head.appendChild(tag);
  }
  
  console.log(`📝 Setting meta[name="theme-color"] content="${color}"`);
  tag.setAttribute("content", color);
}

// ─── iOS Chromium sync ───────────────────────────────────
function setupIOSChromiumSync(): (() => void) | void {
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isChromium = /CriOS|EdgiOS|FxiOS|OPiOS|Mercury/.test(ua);
  
  console.log(`📱 Device detection: isIOS=${isIOS}, isChromium=${isChromium}`);
  
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
    console.log(`🍎 iOS Chromium sync: set apple meta tags with color="${color}"`);
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

  useEffect(() => {
    console.log(`\n🚀 [MetaThemeColor] Effect triggered - layout="${layout}", theme="${themeType}"\n`);
    
    const id = requestAnimationFrame(() => {
      const color = getStatusBarColor(layout);
      const hexColor = toHex(color);
      writeMetaColor(hexColor);
      
      console.log(`\n✨ [MetaThemeColor] Complete - Final hex color: "${hexColor}"\n`);
    });
    return () => cancelAnimationFrame(id);
  }, [layout, themeType]);

  useEffect(() => {
    const cleanup = setupIOSChromiumSync();
    return () => { cleanup?.(); };
  }, []);

  return null;
}