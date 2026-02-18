"use client";

import { useEffect } from "react";
import { useTheme } from "@/app/provider";

// ─────────────────────────────────────────────────────────
// MetaThemeColor
// ─────────────────────────────────────────────────────────
// Reads --lt-status-bar from the nearest [data-layout] element
// defined in style/layout-tokens.css and writes it to
// meta[name="theme-color"] so the iOS/browser chrome matches
// the active layout header.
//
// Status bar colors are configured in layout-tokens.css only.
// This file never needs to change when you update colors.
//
// Usage:
//   <MetaThemeColor layout="shop" />
//   <MetaThemeColor layout="dashboard" />
//   <MetaThemeColor layout="app" />
// ─────────────────────────────────────────────────────────

type Layout = "shop" | "dashboard" | "app" | "sidebar" | "footer";

interface MetaThemeColorProps {
  layout: Layout;
}

// ─── Helpers ─────────────────────────────────────────────

/** Read --lt-status-bar from the scoped [data-layout] element. */
function getStatusBarColor(layout: Layout): string {
  const el = document.querySelector<HTMLElement>(`[data-layout="${layout}"]`);
  const source = el ?? document.documentElement;
  const raw = getComputedStyle(source)
    .getPropertyValue("--lt-status-bar")
    .trim();
  if (!raw) return "";
  if (raw.startsWith("#") || raw.startsWith("rgb") || raw.startsWith("hsl(")) {
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
// Mirrors meta[name="theme-color"] to meta[name="theme-color-ios"]
// and sets apple-mobile-web-app-* tags. Only runs on iOS Chromium.

function setupIOSChromiumSync(): (() => void) | void {
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isChromium = /CriOS|EdgiOS|FxiOS|OPiOS|Mercury/.test(ua);
  if (!isIOS || !isChromium) return;

  const sync = () => {
    const main = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]'
    );
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

  // Update status bar whenever theme or layout changes.
  // requestAnimationFrame ensures layout-tokens CSS is computed first.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const color = toHex(getStatusBarColor(layout));
      writeMetaColor(color);
    });
    return () => cancelAnimationFrame(id);
  }, [layout, themeType]);

  // iOS Chromium sync — mount once
  useEffect(() => {
    const cleanup = setupIOSChromiumSync();
    return () => { cleanup?.(); };
  }, []);

  return null;
}