// app/CMS/layout.tsx - Create this file to ensure no auth requirements
import type { PropsWithChildren } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CMS Schedule | Commercial Services",
  description: "View and manage your cleaning schedules with the CMS tool - Public Access",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9fafb" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
};

// ✅ IMPORTANT: This layout ensures no authentication checks for /CMS routes
export default function CMSLayout({ children }: PropsWithChildren) {
  return (
    <div className="cms-public-layout">
      {/* No authentication checks here - this is intentionally public */}
      {children}
    </div>
  );
}