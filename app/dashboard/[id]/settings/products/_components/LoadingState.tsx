"use client";

import React from "react";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export default function LoadingState({
  message = "Loading…",
  size = "md",
}: LoadingStateProps) {
  const sizeMap = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-4",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <div
        className={`
          animate-spin rounded-full
          border-[hsl(var(--sidebar-primary))]
          border-t-transparent
          ${sizeMap[size]}
          shadow-[var(--shadow-xs)]
        `}
        aria-label="Loading"
      />

      <p className="text-sm text-[hsl(var(--muted-foreground))] text-center">
        {message}
      </p>
    </div>
  );
}
