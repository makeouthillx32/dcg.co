"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useTheme } from "@/app/provider";
import { Loader2 } from "lucide-react";

// Lazy load SignInForm since it uses useSearchParams()
const SignInForm = dynamic(() => import("@/components/SignInForm"), {
  ssr: false,
});

export default function SignInPage() {
  const { themeType } = useTheme();
  const isDark = themeType === "dark";

  return (
    <div className={`min-h-screen w-full flex items-center justify-center bg-[hsl(var(--background))] transition-colors duration-300`}>
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--sidebar-primary))]" />
        </div>
      }>
        <div className="w-full max-w-md px-4">
          <SignInForm />
        </div>
      </Suspense>
    </div>
  );
}