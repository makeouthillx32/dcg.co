"use client";

import React from "react";
import "@/app/globals.css";
import AnchorSection from "@/components/home/_components/AnchorSection";  // ← import

interface CareersPageProps {
  navigateTo: (key: string) => (e?: React.MouseEvent) => void;
}

export default function CareersPage({ navigateTo }: CareersPageProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] p-8">
      {/* Top‑level anchor for /#careers */}
      <AnchorSection id="careers" />

      <h1 className="text-3xl font-bold mb-4 text-[var(--foreground)]">
        Find a Meaningful Career
      </h1>

      <p className="text-lg mb-6">Making a difference starts here.</p>

      <button
        onClick={(e) => navigateTo("careers/jobs")(e)}
        className="bg-[var(--accent)] text-white px-6 py-2 rounded hover:opacity-90 transition"
      >
        Current Openings
      </button>

      <div className="mt-10 space-y-4 text-lg">
        <p>
          If your heart is gracious and your enthusiasm unwavering, the place to
          start is Desert Area Resources and Training!
        </p>
        <p>
          A not-for-profit organization that serves people in our community with
          intellectual disabilities … (etc.)
        </p>

        {/* Inner anchor for /#careers/jobs */}
        <AnchorSection id="jobs" />

        <p className="font-semibold text-xl mt-6">Current Openings</p>

        <p>
          Since 1961, DART has been dedicated to helping people with
          disabilities find the very best version of themselves.
        </p>
        <p>
          DART thrives with the funding from our social enterprises … (etc.)
        </p>
      </div>
    </div>
  );
}
