// app/dashboard/[id]/providers.tsx
"use client";

import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>{children}</SidebarProvider>
  );
}