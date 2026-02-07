// app/dashboard/[id]/(home)/page.tsx
import { Suspense } from "react";
import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";
import { createClient } from "@/utils/supabase/server";

import AdminDashboard from "./admin/page";
import ClientDashboard from "./cliant/page"; // keep your existing path spelling

type PropsType = {
  params: { id: string };
  searchParams?: { selected_time_frame?: string };
};

type ValidRole = "admin" | "member" | "guest";

export default async function DashboardHome({ params, searchParams }: PropsType) {
  console.log("[Dashboard] 🏠 DashboardHome server route hit");

  const supabase = await createClient();

  // ✅ Resolve userId (support /dashboard/me)
  let userId = params?.id;
  if (!userId) return <ErrorDashboard message="No user ID provided in params." />;

  if (userId === "me") {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      console.error("[Dashboard] ❌ auth.getUser failed:", error);
      return <ErrorDashboard message="Authentication required. Please sign in." />;
    }
    userId = data.user.id;
  }

  // ✅ Resolve search params FIRST (prevents TDZ bugs)
  const resolvedSearchParams = searchParams ?? {};
  const extractTimeFrame = createTimeFrameExtractor(resolvedSearchParams.selected_time_frame);

  // ✅ Fetch profile role (new system: admin/member/guest)
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, display_name, first_name, last_name, region")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    console.error("[Dashboard] ❌ Profile fetch failed:", profileError);
    return (
      <ErrorDashboard
        message={`Profile not found or unauthorized for: ${userId}`}
        error={profileError}
      />
    );
  }

  const role = (profile.role as ValidRole) || "member";

  // ✅ Build props once (no branching before init)
  const dashboardProps = {
    searchParams: resolvedSearchParams,
    extractTimeFrame,
    user: {
      id: profile.id,
      email: undefined as string | undefined,
      role_name: role,
      role_id: role,
      profile: {
        first_name: profile.first_name ?? "",
        last_name: profile.last_name ?? "",
        display_name: profile.display_name ?? "",
        region: profile.region ?? null,
      },
    },
    params,
  };

  console.log("[Dashboard] ✅ Routing dashboard:", { userId, role });

  // ✅ Route by new role model
  if (role === "admin") {
    return (
      <Suspense fallback={<DashboardLoading role="Admin" />}>
        <AdminDashboard {...dashboardProps} />
      </Suspense>
    );
  }

  // member + guest both go to the storefront dashboard experience
  return (
    <Suspense fallback={<DashboardLoading role={role === "guest" ? "Guest" : "Member"} />}>
      <ClientDashboard {...dashboardProps} />
    </Suspense>
  );
}

function DashboardLoading({ role }: { role: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
        <p>Loading {role} Dashboard...</p>
      </div>
    </div>
  );
}

function ErrorDashboard({ message, error }: { message: string; error?: any }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="text-center max-w-md">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold mb-2">Dashboard Error</h1>
        <p className="text-muted-foreground mb-4">{message}</p>

        {error && (
          <details className="text-sm text-left bg-muted p-4 rounded">
            <summary className="cursor-pointer mb-2">Error Details</summary>
            <pre className="whitespace-pre-wrap">
              {error instanceof Error ? error.message : JSON.stringify(error, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
