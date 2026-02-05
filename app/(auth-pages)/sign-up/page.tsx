import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/Layouts/appheader/input";
import { Label } from "@/components/ui/label";
import SignInWithGoogle from "@/components/ui/SignInWithGoogle";
import Link from "next/link";
import { Mail, Lock, Ticket } from "lucide-react";
import { cookies } from "next/headers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a new account to access your dashboard.",
};

export default async function Signup({
  searchParams,
}: {
  searchParams: Promise<Message & { invite?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const cookieData = await cookies();

  // Prefer URL param; fallback to cookie
  const inviteFromQuery =
    "invite" in resolvedSearchParams ? (resolvedSearchParams.invite as string | undefined) : undefined;

  const inviteFromCookie = cookieData.get("invite")?.value;
  const invite = inviteFromQuery || inviteFromCookie || "";

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
        <h1 className="text-3xl md:text-4xl font-[var(--font-serif)] font-bold text-center text-[hsl(var(--sidebar-primary))] mb-6 leading-[1.2]">
          Create an Account
        </h1>

        <SignInWithGoogle />

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-[hsl(var(--border))]" />
          <span className="mx-4 text-sm font-[var(--font-sans)] text-[hsl(var(--muted-foreground))]">
            OR
          </span>
          <div className="flex-grow border-t border-[hsl(var(--border))]" />
        </div>

        <form className="space-y-6" action={signUpAction}>
          {/* If invite exists, keep it hidden so actions can use it */}
          <input type="hidden" name="invite" value={invite} />

          {/* Optional manual invite field (won’t hurt if empty) */}
          <div className="space-y-2">
            <Label
              htmlFor="invite"
              className="font-[var(--font-sans)] text-[hsl(var(--foreground))]"
            >
              Invite code (optional)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">
                <Ticket size={18} />
              </span>
              <Input
                id="invite"
                name="invite"
                type="text"
                defaultValue={invite}
                placeholder="Paste invite code if you have one"
                className="pl-10 border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] font-[var(--font-sans)] rounded-[var(--radius)] focus:ring-[hsl(var(--sidebar-ring))] focus:border-[hsl(var(--sidebar-primary))]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="font-[var(--font-sans)] text-[hsl(var(--foreground))]"
            >
              Email address
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
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-[hsl(var(--sidebar-primary))] hover:underline transition-all duration-200"
          >
            Sign in
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-[hsl(var(--muted-foreground))] font-[var(--font-sans)] leading-[1.5]">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-[hsl(var(--sidebar-primary))] transition-colors duration-200">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-[hsl(var(--sidebar-primary))] transition-colors duration-200">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
