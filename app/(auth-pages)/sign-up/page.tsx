import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/Layouts/appheader/input";
import { Label } from "@/components/ui/label";
import SignInWithGoogle from "@/components/ui/SignInWithGoogle";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import { cookies } from "next/headers";
import type { Metadata } from "next";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ invite?: string; role?: string }> }): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const role = resolvedSearchParams?.role || "client";

  const roleName = {
    admin: "Admin",
    job_coach: "Job Coach",
    client: "Client",
    anonymous: "User"
  }[role] || "User";

  return {
    title: `Invite to join as ${roleName}`,
    description: `You've been invited to join as a ${roleName} on the CMS Schedule App.`,
    openGraph: {
      title: `Join as a ${roleName}`,
      description: `Create an account and get started as a ${roleName} on the CMS Schedule App.`,
      images: [`/images/${role}.png`]
    },
    twitter: {
      card: "summary_large_image",
      title: `Join as a ${roleName}`,
      description: `You've been invited to create an account as a ${roleName}.`,
      images: [`/images/${role}.png`]
    }
  };
}

export default async function Signup({ searchParams }: { searchParams: Promise<Message> }) {
  const resolvedSearchParams = await searchParams;
  const cookieData = await cookies();
  const invite = cookieData.get("invite")?.value;

  if ("message" in resolvedSearchParams) {
    return (
      <div className="w-full flex-1 flex items-center min-h-screen justify-center gap-2 p-4">
        <FormMessage message={resolvedSearchParams} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(var(--muted))] to-[hsl(var(--accent))] px-4 md:px-6 lg:px-12">
      <div className="mx-auto w-full max-w-2xl rounded-[var(--radius)] bg-[hsl(var(--card))] shadow-[var(--shadow-xl)] p-8 md:p-10">
        <h1 className="text-3xl md:text-4xl font-[var(--font-serif)] font-bold text-center text-[hsl(var(--sidebar-primary))] mb-6 leading-[1.2]">Create an Account</h1>

        <SignInWithGoogle />

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-[hsl(var(--border))]"></div>
          <span className="mx-4 text-sm font-[var(--font-sans)] text-[hsl(var(--muted-foreground))]">OR</span>
          <div className="flex-grow border-t border-[hsl(var(--border))]"></div>
        </div>

        <form className="space-y-6" action={signUpAction}>
          <input type="hidden" name="invite" value={invite || ""} />

          <div className="space-y-2">
            <Label htmlFor="email" className="font-[var(--font-sans)] text-[hsl(var(--foreground))]">Email address</Label>
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
            <Label htmlFor="password" className="font-[var(--font-sans)] text-[hsl(var(--foreground))]">Password</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">
                <Lock size={18} />
              </span>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="At least 6 characters"
                minLength={6}
                required
                className="pl-10 border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] font-[var(--font-sans)] rounded-[var(--radius)] focus:ring-[hsl(var(--sidebar-ring))] focus:border-[hsl(var(--sidebar-primary))]"
              />
            </div>
          </div>

          <SubmitButton
            pendingText="Creating..."
            className="w-full bg-[hsl(var(--sidebar-primary))] hover:bg-[hsl(var(--sidebar-primary))]/90 text-[hsl(var(--sidebar-primary-foreground))] py-2.5 rounded-[var(--radius)] font-[var(--font-sans)] font-medium transition-colors duration-200 shadow-[var(--shadow-sm)]"
          >
            Create Account
          </SubmitButton>

          <FormMessage message={resolvedSearchParams} />
        </form>

        <p className="text-center text-sm mt-6 text-[hsl(var(--muted-foreground))] font-[var(--font-sans)] leading-[1.5]">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-[hsl(var(--sidebar-primary))] hover:underline transition-all duration-200">
            Sign in
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-[hsl(var(--muted-foreground))] font-[var(--font-sans)] leading-[1.5]">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-[hsl(var(--sidebar-primary))] transition-colors duration-200">Terms</Link> and{' '}
          <Link href="/privacy" className="underline hover:text-[hsl(var(--sidebar-primary))] transition-colors duration-200">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}