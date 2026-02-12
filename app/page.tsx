// app/page.tsx
import Home from "@/components/shop/Home";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home | Desert Cowgirl",
  description:
    "Western-inspired pants and shirts with a warm, modern rustic aesthetic. Thoughtfully designed staples made for everyday wear.",

  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://desertcowgirl.co"
  ),

  openGraph: {
    title: "Desert Cowgirl | Western-Inspired Pants & Shirts",
    description:
      "Shop western-inspired pants and shirts with a warm, modern rustic look—quality staples made for everyday wear.",
    type: "website",
    url: "https://desertcowgirl.co/",
    siteName: "Desert Cowgirl",
    images: [
      {
        url: "/opengraph-image.png",
        alt: "Desert Cowgirl storefront preview",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Desert Cowgirl | Western-Inspired Pants & Shirts",
    description:
      "Western-inspired pants and shirts with a warm, modern rustic aesthetic.",
    images: ["/twitter-image.png"],
  },
};

export default function Page() {
  return (
    <div>
      <Home />
    </div>
  );
}