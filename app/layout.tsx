// app/layout.tsx - UPDATED WITH ENHANCED METADATA
import { Providers } from "./provider";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import AccessibilityOverlay from "@/components/theme/accessibility";
import "./globals.css";
import type { Metadata } from "next";
import ClientLayoutWrapper from "@/components/ClientLayout";

// ✅ UPDATED: Enhanced metadata with SEO and social media tags
export const metadata: Metadata = {
  title: {
    template: '%s | Desert Area Resources and Training',
    default: 'Desert Area Resources and Training - Disability Services & Support Organization in Ridgecrest California, 93555',
  },
  description: 'From support services, career opportunities, fun events, and business services, discover all Desert Area Resources and Training has to offer! Start Here. Desert Area Resources and Training serves people in Southern California with comprehensive disability support services.',
  metadataBase: new URL('https://schedual-five.vercel.app'), // Update this to your actual domain when ready
  
  // ✅ Keywords for SEO
  keywords: [
    'disability services',
    'support organization', 
    'Ridgecrest California',
    'career opportunities',
    'business services',
    'Southern California',
    'resources',
    'training',
    'accessibility',
    'community support'
  ],
  
  // ✅ Authors and creator info
  authors: [{ name: 'Desert Area Resources and Training' }],
  creator: 'Desert Area Resources and Training',
  publisher: 'Desert Area Resources and Training',
  
  // ✅ Open Graph (Facebook) Meta Tags
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://schedual-five.vercel.app/', // Update to your actual domain
    siteName: 'Desert Area Resources and Training',
    title: 'Desert Area Resources and Training - Disability Services & Support Organization in Ridgecrest California',
    description: 'From support services, career opportunities, fun events, and business services, discover all Desert Area Resources and Training has to offer! Start Here. Desert Area Resources and Training serves people in Southern California with comprehensive disability support services.',
    images: [
      {
        url: '/og-image.jpg', // Add your actual image path
        width: 1200,
        height: 630,
        alt: 'Desert Area Resources and Training - Disability Services & Support',
      },
    ],
  },
  
  // ✅ Twitter Meta Tags
  twitter: {
    card: 'summary_large_image',
    site: '@DesertAreaRT', // Update with your actual Twitter handle
    creator: '@DesertAreaRT', // Update with your actual Twitter handle
    title: 'Desert Area Resources and Training - Disability Services & Support Organization in Ridgecrest California',
    description: 'From support services, career opportunities, fun events, and business services, discover all Desert Area Resources and Training has to offer! Start Here. Desert Area Resources and Training serves people in Southern California with comprehensive disability support services.',
    images: ['/twitter-image.jpg'], // Add your actual image path
  },
  
  // ✅ Additional SEO improvements
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // ✅ Verification (add when you have these)
  // verification: {
  //   google: 'your-google-verification-code',
  //   yandex: 'your-yandex-verification-code',
  //   yahoo: 'your-yahoo-verification-code',
  // },
  
  // ✅ App-specific metadata
  applicationName: 'Desert Area Resources and Training',
  referrer: 'origin-when-cross-origin',
  category: 'Disability Services',
  
  // ✅ Contact and organization info
  other: {
    'contact:phone_number': '+1-760-375-9787', // Add your actual phone
    'contact:email': 'info@desertareart.org', // Add your actual email
    'business:contact_data:locality': 'Ridgecrest',
    'business:contact_data:region': 'California',
    'business:contact_data:postal_code': '93555',
    'business:contact_data:country_name': 'United States',
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
        {/* ✅ Additional head elements */}
        <meta name="theme-color" content="#ffffff" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* ✅ Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* ✅ Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* ✅ Canonical URL */}
        <link rel="canonical" href="https://schedual-five.vercel.app/" />
        
        {/* ✅ Geographic targeting */}
        <meta name="geo.region" content="US-CA" />
        <meta name="geo.placename" content="Ridgecrest" />
        <meta name="geo.position" content="35.6225;-117.6709" />
        <meta name="ICBM" content="35.6225, -117.6709" />
        
        {/* ✅ Organization schema (helps with local SEO) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Desert Area Resources and Training",
              "description": "Disability services and support organization serving Southern California",
              "url": "https://schedual-five.vercel.app/",
              "logo": "https://schedual-five.vercel.app/logo.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+1-760-XXX-XXXX",
                "contactType": "Customer Service",
                "availableLanguage": ["English", "Spanish"]
              },
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Ridgecrest",
                "addressRegion": "CA",
                "postalCode": "93555",
                "addressCountry": "US"
              },
              "sameAs": [
                "https://facebook.com/your-page",
                "https://twitter.com/your-handle",
                "https://linkedin.com/company/your-company"
              ]
            })
          }}
        />
      </head>
      <body className="min-h-screen font-[var(--font-sans)]">
        <Providers>
          <ClientLayoutWrapper>
            {children}
          </ClientLayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}