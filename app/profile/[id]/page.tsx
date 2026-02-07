// app/profile/[id]/page.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import ProfileCard from "@/components/profile/ProfileCard";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Profile" };
}

interface ProfilePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {
  const resolvedParams = await params;
  const idParam = resolvedParams.id;

  // keep to satisfy Next's signature; we don't currently use it
  await searchParams;

  // Use the correct site URL (fallback to current project URL)
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://dcg-co.vercel.app";

  const cookieHeader = cookies().toString();

  // Fetch the signed-in user's profile (server-side, cookie-authenticated)
  const profileRes = await fetch(`${baseUrl}/api/profile`, {
    cache: "no-store",
    headers: { cookie: cookieHeader },
  });

  const profile = await profileRes.json().catch(() => null);

  if (!profileRes.ok || !profile?.id) {
    return (
      <div className="text-center py-10 text-red-600">
        User not found or unauthorized.
      </div>
    );
  }

  // Enforce: /profile/me is the only profile route we show right now
  // (removes template logic around admin tools / browsing other users)
  const realId = idParam === "me" ? profile.id : idParam;
  if (profile.id !== realId) return redirect("/profile/me");

  // Keep it simple: show role directly (or "Member")
  const roleLabel = typeof profile.role === "string" && profile.role.length > 0 ? profile.role : "member";

  const displayName =
    typeof profile.display_name === "string" && profile.display_name.trim().length > 0
      ? profile.display_name.trim()
      : "Member";

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <ProfileCard profile={profile} displayName={displayName} roleLabel={roleLabel} />
    </div>
  );
}