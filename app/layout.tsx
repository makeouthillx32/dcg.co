// app/layout.tsx - UPDATED BRANDING FOR DESERT COWGIRL
import { Providers } from "./provider";
import Nav from "@/components/nav";
import Footer from "@/components/Layouts/footer";
import AccessibilityOverlay from "@/components/theme/accessibility";
import "./globals.css";
import type { Metadata } from "next";
import ClientLayoutWrapper from "@/components/ClientLayout";

// ✅ UPDATED: Metadata for Desert Cowgirl (western-inspired clothing storefront)
export const metadata: Metadata = {
  title: {
    template: "%s | Desert Cowgirl",
    default: "Desert Cowgirl | Western-Inspired Pants & Shirts",
  },
  description:
    "Desert Cowgirl offers western-inspired pants and shirts with a warm, modern rustic aesthetic—quality staples made for everyday wear.",

  // ✅ Update when domain is live (recommended): https://desertcowgirl.co
  metadataBase: new URL("https://desertcowgirl.co"),

  // ✅ Keywords for SEO
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

  // ✅ Authors and creator info
  authors: [{ name: "Desert Cowgirl" }],
  creator: "Desert Cowgirl",
  publisher: "Desert Cowgirl",

  // ✅ Open Graph Meta Tags
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
        url: "/og-image.jpg", // TODO: replace with your actual OG image
        width: 1200,
        height: 630,
        alt: "Desert Cowgirl storefront preview",
      },
    ],
  },

  // ✅ Twitter Meta Tags
  twitter: {
    card: "summary_large_image",
    title: "Desert Cowgirl | Western-Inspired Pants & Shirts",
    description:
      "Shop western-inspired pants and shirts with a warm, modern rustic look—quality staples made for everyday wear.",
    images: ["/og-image.jpg"], // TODO: replace with your actual image
  },

  // ✅ Robots
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

  // ✅ App-specific metadata
  applicationName: "Desert Cowgirl",
  referrer: "origin-when-cross-origin",
  category: "Apparel",

  // ✅ Contact info placeholders (fill when ready)
  other: {
    "contact:email": "support@desertcowgirl.co",
  },
};

// ✅ Keep the HTML structure server-side, move client logic to wrapper
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ✅ Theme color matches your light palette background */}
        <meta name="theme-color" content="#faf8f5" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="format-detection" content="telephone=no" />

        {/* ✅ Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* ✅ Preconnect for performance (keep only if you actually use Google Fonts) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        {/* ✅ Canonical URL */}
        <link rel="canonical" href="https://desertcowgirl.co/" />

        {/* ✅ Store schema (helps SEO for ecommerce) */}
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
              sameAs: [
                // Add socials when ready:
                // "https://instagram.com/your-handle",
                // "https://tiktok.com/@your-handle"
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-screen font-[var(--font-sans)]">
        <Providers>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}