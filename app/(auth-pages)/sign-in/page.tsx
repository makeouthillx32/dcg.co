// app/(auth-pages)/sign-in/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

import { signInAction } from "@/actions/auth";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/Layouts/app/input";
import { Label } from "@/components/ui/label";
import SignInWithGoogle from "@/components/ui/SignInWithGoogle";
import { Mail, Lock } from "lucide-react";

// ✅ ADD
import { AuthBreadcrumbs } from "@/components/Auth/AuthBreadcrumbs";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your account.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Message;
}) {
  return (
    <div className="mx-auto w-full max-w-md rounded-[var(--radius)] bg-[hsl(var(--card))] shadow-[var(--shadow-xl)] p-6 md:p-8">
      {/* ✅ ADD */}
      <AuthBreadcrumbs current="Sign in" />

      <h1 className="text-2xl md:text-3xl font-[var(--font-serif)] font-bold text-center text-[hsl(var(--sidebar-primary))] mb-6 leading-[1.2]">
        Welcome Back
      </h1>

      {/* ✅ hard-center wrapper so button cannot drift */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-[520px]">
          <SignInWithGoogle />
        </div>
      </div>

      <div className="flex items-center my-6">
        <div className="flex-grow border-t border-[hsl(var(--border))]" />
        <span className="mx-4 text-sm font-[var(--font-sans)] text-[hsl(var(--muted-foreground))]">
          OR
        </span>
        <div className="flex-grow border-t border-[hsl(var(--border))]" />
      </div>

      <form className="space-y-5" action={signInAction}>
        <div className="space-y-2">
          <Label htmlFor="email" className="font-[var(--font-sans)] text-[hsl(var(--foreground))]">
            Email
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">
              <Mail size={18} />
            </span>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="pl-10 border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] font-[var(--font-sans)] rounded-[var(--radius)] focus:ring-[hsl(var(--sidebar-ring))] focus:border-[hsl(var(--sidebar-primary))]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="font-[var(--font-sans)] text-[hsl(var(--foreground))]"
          >
            Password
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">
              <Lock size={18} />
            </span>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="pl-10 border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] font-[var(--font-sans)] rounded-[var(--radius)] focus:ring-[hsl(var(--sidebar-ring))] focus:border-[hsl(var(--sidebar-primary))]"
            />
          </div>
        </div>

        {/* ✅ name must be "remember" to match signInAction */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-[var(--font-sans)] text-[hsl(var(--muted-foreground))]">
            <input
              type="checkbox"
              name="remember"
              value="true"
              className="h-4 w-4 rounded border-[hsl(var(--border))]"
            />
            Remember me
          </label>

          <Link
            href="/forgot-password"
            className="text-sm font-medium text-[hsl(var(--sidebar-primary))] hover:underline font-[var(--font-sans)]"
          >
            Forgot password?
          </Link>
        </div>

        <SubmitButton
          pendingText="Signing in..."
          className="w-full bg-[hsl(var(--sidebar-primary))] hover:bg-[hsl(var(--sidebar-primary))]/90 text-[hsl(var(--sidebar-primary-foreground))] py-2.5 rounded-[var(--radius)] font-[var(--font-sans)] font-medium transition-colors duration-200 shadow-[var(--shadow-sm)]"
        >
          Sign in
        </SubmitButton>

        {/* ✅ Keep this for now; we'll convert it to toast-only next */}
        <FormMessage message={searchParams} />
      </form>

      <p className="mt-6 text-center text-sm text-[hsl(var(--muted-foreground))] font-[var(--font-sans)] leading-[1.5]">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="text-[hsl(var(--sidebar-primary))] hover:underline transition-colors font-medium"
        >
          Sign up
        </Link>
      </p>

      <p className="mt-4 text-center text-xs text-[hsl(var(--muted-foreground))] font-[var(--font-sans)] leading-[1.5]">
        By signing in, you agree to our{" "}
        <Link href="/terms" className="underline hover:text-[hsl(var(--sidebar-primary))]">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline hover:text-[hsl(var(--sidebar-primary))]">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}