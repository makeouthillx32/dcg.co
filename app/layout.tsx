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