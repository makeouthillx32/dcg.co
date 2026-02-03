// @ts-nocheck
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import ProfileCard from "@/components/profile/ProfileCard";
import AdminDelete from "@/components/profile/AdminDelete";
import ManualRoleEditor from "@/components/profile/ManualRoleEditor";
import ManageSpecializations from "@/components/profile/ManageSpecializations";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "User Profile" };
}

interface ProfilePageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  await searchParams;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://schedual-five.vercel.app";
  const cookieHeader = cookies().toString();

  const profileRes = await fetch(`${baseUrl}/api/profile`, {
    cache: "no-store",
    headers: { cookie: cookieHeader },
  });
  const profile = await profileRes.json();

  const authRes = await fetch(`${baseUrl}/api/get-all-users`, {
    cache: "no-store",
    headers: { cookie: cookieHeader },
  });
  const allUsers = await authRes.json();

  if (!profileRes.ok || !profile) {
    return <div className="text-center py-10 text-red-600">User not found or unauthorized.</div>;
  }

  const realId = id === "me" ? profile.id : id;
  if (profile.id !== realId) return redirect("/profile/me");

  let roleLabel = "User";
  if (profile?.role) {
    const roleRes = await fetch(`${baseUrl}/api/profile/role-label?role_id=${profile.role}`, {
      cache: "no-store",
      headers: { cookie: cookieHeader },
    });
    if (roleRes.ok) {
      const roleData = await roleRes.json();
      roleLabel = roleData.role || "User";
    }
  }

  const matchingUser = allUsers.find((user) => user.id === profile.id);
  const displayName = matchingUser?.display_name || "Unnamed User";

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <ProfileCard profile={profile} displayName={displayName} roleLabel={roleLabel} />

      <AdminDelete />
      <ManualRoleEditor />
      <ManageSpecializations /> {/* Add this line */}
    </div>
  );
}