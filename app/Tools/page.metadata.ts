// app/Tools/page.metadata.ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tools | CMS Helper Utilities",
  description: "Quick access to internal tools for the CMS Schedule App.",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9fafb" }, // Light for app
    { media: "(prefers-color-scheme: dark)", color: "#111827" },  // Dark for app
  ],
};