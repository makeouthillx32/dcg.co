import { Providers } from "./provider";
import ClientLayout from "@/components/Layouts/ClientLayout";
import NextTopLoader from "nextjs-toploader";
import type { Metadata } from "next";

import "./globals.css";
import "@/css/satoshi.css";
import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

// ─── Metadata (Server-Only) ──────────────────────────────

export const metadata: Metadata = {
  title: {
    default: "Desert Cowgirl",
    template: "%s | Desert Cowgirl",
  },
  description: "Western-inspired clothing with a warm, modern rustic aesthetic.",
  keywords: ["western wear", "cowgirl fashion", "desert style", "rustic clothing"],
  authors: [{ name: "Desert Cowgirl" }],
  creator: "Desert Cowgirl",
  publisher: "Desert Cowgirl",
  metadataBase: new URL("https://desertcowgirl.co"),
  openGraph: {
    title: "Desert Cowgirl",
    description: "Western-inspired clothing with a warm, modern rustic aesthetic.",
    url: "https://desertcowgirl.co",
    siteName: "Desert Cowgirl",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Desert Cowgirl",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Desert Cowgirl",
    description: "Western-inspired clothing with a warm, modern rustic aesthetic.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

// ─── Root Layout (Server Component) ──────────────────────

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="format-detection" content="telephone=no" />

        {/* Icons & Manifest */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Font Preconnect */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://desertcowgirl.co/" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Brand",
              name: "Desert Cowgirl",
              description: "Western-inspired pants and shirts with a warm, modern rustic aesthetic.",
              url: "https://desertcowgirl.co/",
              logo: "https://desertcowgirl.co/logo.png",
              sameAs: [],
            }),
          }}
        />

        {/* ── Preloader keyframe (must live in a stylesheet, not inline style attr) ── */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes dcg-slide {
            0%   { width: 0%;  margin-left: 0%;   }
            50%  { width: 60%; margin-left: 20%;  }
            100% { width: 0%;  margin-left: 100%; }
          }
        `}} />

        {/*
         * ── Synchronous theme-init + preloader bootstrap ──
         *
         * Runs BEFORE first paint. The preloader is appended to <html> directly
         * (documentElement always exists at script parse time) so we never race
         * against <body> being available. position:fixed means location doesn't matter.
         * React never sees this node — zero hydration conflict.
         */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function () {
            var DEFAULT_LIGHT_BG = '240 9.09% 97.84%';
            var DEFAULT_PRIMARY  = '139.66 52.73% 43.14%';

            // ── 1. Apply saved theme type + themeId to <html> immediately
            var savedType = '';
            try { savedType = localStorage.getItem('theme') || ''; } catch(e) {}
            if (!savedType) {
              savedType = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            var html = document.documentElement;
            html.classList.add(savedType);
            try {
              var savedId = localStorage.getItem('themeId');
              if (savedId) html.classList.add('theme-' + savedId);
            } catch(e) {}

            // ── 2. Read last-saved bg + primary HSL (written by provider on prev load)
            var bgHsl      = DEFAULT_LIGHT_BG;
            var primaryHsl = DEFAULT_PRIMARY;
            try {
              var storedBg = localStorage.getItem('dcg-preloader-bg-' + savedType);
              var storedPr = localStorage.getItem('dcg-preloader-primary');
              if (storedBg) bgHsl      = storedBg;
              if (storedPr) primaryHsl = storedPr;
            } catch(e) {}

            // ── 3. Build + inject preloader onto <html> (always available, position:fixed)
            //       React owns <body> — we deliberately stay outside it.
            var logoSrc = savedType === 'dark'
              ? '/images/logo/logo-dark.svg'
              : '/images/logo/logo-icon.svg';

            var div = document.createElement('div');
            div.id = 'dcg-preloader';
            div.setAttribute('aria-hidden', 'true');
            div.style.cssText = [
              'position:fixed',
              'inset:0',
              'z-index:2147483647',
              'display:flex',
              'flex-direction:column',
              'align-items:center',
              'justify-content:center',
              'gap:28px',
              'background:hsl(' + bgHsl + ')',
              'transition:opacity 0.4s ease',
              'pointer-events:none'
            ].join(';');

            div.innerHTML =
              '<img src="' + logoSrc + '" alt="" ' +
                'style="width:64px;height:64px;object-fit:contain;pointer-events:none;" />' +
              '<div style="width:120px;height:2px;border-radius:2px;' +
                'background:rgba(128,128,128,0.15);overflow:hidden;">' +
                '<div style="height:100%;width:0%;border-radius:2px;' +
                  'background:hsl(' + primaryHsl + ');' +
                  'animation:dcg-slide 1.4s ease-in-out infinite;"></div>' +
              '</div>';

            // Append to <html> — always exists, React doesn't manage it directly
            document.documentElement.appendChild(div);

            // ── 4. Dismiss: fade then remove — el.remove() owns itself, no parent needed
            function dismiss() {
              var el = document.getElementById('dcg-preloader');
              if (!el || el.dataset.done) return;
              el.dataset.done = '1';
              el.style.opacity = '0';
              setTimeout(function () {
                try { el.remove(); } catch(e) {}
              }, 420);
            }
            window.addEventListener('dcg-theme-ready', dismiss, { once: true });

            // Safety fallback — clears after 3 s no matter what
            setTimeout(function () {
              window.dispatchEvent(new Event('dcg-theme-ready'));
            }, 3000);
          })();
        `}} />
      </head>

      <body className="min-h-screen font-[var(--font-sans)]" suppressHydrationWarning>

        {/* Top Loading Bar */}
        <NextTopLoader
          color="hsl(var(--primary))"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px hsl(var(--primary)),0 0 5px hsl(var(--primary))"
        />

        {/* Provider Wrapper (handles theme, auth, etc.) */}
        <Providers>
          {/* Client Layout (handles routing, headers, analytics, etc.) */}
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}