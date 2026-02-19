// settings/landing/_components/LandingManager.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useLandingSections } from "./useLandingSections";
import LandingActionBar from "./LandingActionBar";
import LandingSearchBar from "./LandingSearchBar";
import LandingSectionsTable from "./LandingSectionsTable";
import LoadingState from "./LoadingState";
import ErrorAlert from "./ErrorAlert";

export default function LandingManager() {
  const { sections, loading, error, refresh } = useLandingSections();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return sections;

    return sections.filter((row) => {
      const t = `${row.type ?? ""}`.toLowerCase();
      const slug = `${row.config?.slug ?? ""}`.toLowerCase();
      const title = `${row.config?.title ?? ""}`.toLowerCase();
      return t.includes(s) || slug.includes(s) || title.includes(s);
    });
  }, [sections, q]);

  return (
    <div className="landing-manager">
      <div className="settings-header">
        <div>
          <h1 className="settings-title">Landing Management</h1>
          <p className="settings-subtitle">
            Control the storefront landing layout using <code>landing_sections</code>.
          </p>
        </div>
      </div>

      <LandingActionBar onRefresh={refresh} />

      <LandingSearchBar value={q} onChange={setQ} />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorAlert message={error} /> : null}

      {!loading ? (
        <LandingSectionsTable rows={filtered} onChange={refresh} />
      ) : null}
    </div>
  );
}
