// app/dashboard/[id]/settings/roles/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import RolesSearchBar from "./_components/RolesSearchBar";
import RolesActionBar from "./_components/RolesActionBar";
import LoadingState from "./_components/LoadingState";
import ErrorAlert from "./_components/ErrorAlert";
import RolesTable from "./_components/RolesTable";
import { toast } from "react-hot-toast";

type RoleType = "admin" | "job_coach" | "client";

interface RoleRow {
  id: RoleType; // stable id
  name: string;
  description: string;
  color: string;
  role_type: RoleType;
  member_count: number;
}

const STATIC_ROLES: Omit<RoleRow, "member_count">[] = [
  {
    id: "admin",
    name: "Admin",
    description: "Full access to admin tools and settings.",
    color: "hsl(var(--primary))",
    role_type: "admin",
  },
  {
    id: "job_coach",
    name: "Job Coach",
    description: "Can manage assigned client work / schedules.",
    color: "hsl(var(--chart-2))",
    role_type: "job_coach",
  },
  {
    id: "client",
    name: "Client",
    description: "Can view personal info and assigned schedules.",
    color: "hsl(var(--chart-4))",
    role_type: "client",
  },
];

export default function RolesManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roles, setRoles] = useState<RoleRow[]>(
    STATIC_ROLES.map((r) => ({ ...r, member_count: 0 }))
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadingCounts, setLoadingCounts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCounts = async () => {
    setLoadingCounts(true);
    try {
      const res = await fetch("/api/roles/stats");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Failed: ${res.status}`);

      setRoles((prev) =>
        prev.map((r) => {
          const found = (json.roles as any[]).find((x) => x.role === r.role_type);
          return found ? { ...r, member_count: Number(found.count) || 0 } : r;
        })
      );

      setError(null);
      toast.success("Member counts refreshed");
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to load role counts.");
    } finally {
      setLoadingCounts(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredRoles = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return roles.filter((r) =>
      [r.name, r.description, r.role_type].join(" ").toLowerCase().includes(q)
    );
  }, [roles, searchQuery]);

  return (
    <ShowcaseSection title="Role Management">
      <div className="roles-management">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <RolesSearchBar searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} />
          <RolesActionBar
            onCreateRole={() => toast("Roles are static in this build.", { icon: "ℹ️" })}
            onRefreshCounts={fetchCounts}
            isRefreshing={loadingCounts}
          />
        </div>

        {isLoading && <LoadingState message="Loading roles..." />}

        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {!isLoading && !error && (
          <RolesTable
            roles={filteredRoles}
            allRolesCount={roles.length}
            loadingMemberCounts={loadingCounts}
            onEdit={() => toast("Static roles (edit disabled).", { icon: "ℹ️" })}
            onDelete={() => toast("Static roles (delete disabled).", { icon: "ℹ️" })}
          />
        )}
      </div>
    </ShowcaseSection>
  );
}
