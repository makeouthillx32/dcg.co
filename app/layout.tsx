// app/layout.tsx
import { Providers } from "./provider";
import ConditionalOverlays from "@/components/Layouts/overlays/ConditionalOverlays";
import { CartProvider } from "@/components/Layouts/overlays/cart/cart-context";
import "./globals.css";
import type { Metadata } from "next";
import ClientLayoutWrapper from "@/components/Layouts/ClientLayout";

export const metadata: Metadata = {
  title: {
    template: "%s | Desert Cowgirl",
    default: "Desert Cowgirl | Western-Inspired Pants & Shirts",
  },
  description:
    "Desert Cowgirl offers western-inspired pants and shirts with a warm, modern rustic aesthetic—quality staples made for everyday wear.",
  metadataBase: new URL("https://desertcowgirl.co"),
  keywords: [
    "Desert Cowgirl",
    "western inspired clothing",
    "western clothing",
    "western pants",
    "western shirts",
    "denim",
    "heritage style",
    "rustic fashion",
    "desert style",
    "boutique clothing",
    "online clothing store",
    "women's western clothing",
    "men's western clothing",
  ],
  authors: [{ name: "Desert Cowgirl" }],
  creator: "Desert Cowgirl",
  publisher: "Desert Cowgirl",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://desertcowgirl.co/",
    siteName: "Desert Cowgirl",
    title: "Desert Cowgirl | Western-Inspired Pants & Shirts",
    description:
      "Shop western-inspired pants and shirts with a warm, modern rustic look—quality staples made for everyday wear.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Desert Cowgirl storefront preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Desert Cowgirl | Western-Inspired Pants & Shirts",
    description:
      "Shop western-inspired pants and shirts with a warm, modern rustic look—quality staples made for everyday wear.",
    images: ["/og-image.jpg"],
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
  applicationName: "Desert Cowgirl",
  referrer: "origin-when-cross-origin",
  category: "Apparel",
  other: {
    "contact:email": "support@desertcowgirl.co",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* 
          REMOVED: Static fallback theme-color meta tag
          Reason: iOS Safari caches the initial server-rendered value,
          so we need MetaThemeColor to control it from the start.
          The meta tag will be created dynamically by MetaThemeColor component.
        */}
        
        {/* iOS-specific status bar configuration */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="format-detection" content="telephone=no" />

        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        <link rel="canonical" href="https://desertcowgirl.co/" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Brand",
              name: "Desert Cowgirl",
              description:
                "Western-inspired pants and shirts with a warm, modern rustic aesthetic.",
              url: "https://desertcowgirl.co/",
              logo: "https://desertcowgirl.co/logo.png",
              sameAs: [],
            }),
          }}
        />
      </head>
      <body className="min-h-screen font-[var(--font-sans)]">
        <Providers>
          {/* 🛒 Wrap with CartProvider for global cart state */}
          <CartProvider>
            <ClientLayoutWrapper>{children}</ClientLayoutWrapper>

            {/* 🎯 Conditional Overlays - excluded from /app and /dashboard */}
            <ConditionalOverlays />
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}