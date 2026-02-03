// app/page.tsx
import Home from "@/components/home/Home";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home | Desert Area Resources and Training",
  description: "Welcome to Desert Area Resources and Training.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://schedual-five.vercel.app'),
  openGraph: {
    title: "Desert Area Resources and Training",
    description: "Welcome to Desert Area Resources and Training.",
    type: "website",
    images: ["/opengraph-image.png"], // Simple version - no dimensions needed
  },
  twitter: {
    card: "summary_large_image",
    title: "Desert Area Resources and Training",
    description: "Welcome to Desert Area Resources and Training.",
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