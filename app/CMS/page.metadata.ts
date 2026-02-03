// app/CMS/page.metadata.ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CMS Schedule | Commercial Services",
  description: "View and manage your cleaning schedules with the CMS tool.",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9fafb" }, // Light for app
    { media: "(prefers-color-scheme: dark)", color: "#111827" },  // Dark for app
  ],
};