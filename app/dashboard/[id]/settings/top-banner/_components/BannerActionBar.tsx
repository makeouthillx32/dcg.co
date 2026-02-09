// app/settings/top-banner/_components/BannerActionBar.tsx
"use client";

import { Plus } from "lucide-react";

type Props = {
  enabled: boolean;
  onToggleEnabled: (value: boolean) => void;
  onAddItem: () => void;
};

export function BannerActionBar({ enabled, onToggleEnabled, onAddItem }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <label className="flex items-center gap-2 text-sm text-[hsl(var(--foreground))]">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggleEnabled(e.target.checked)}
          className="h-4 w-4 rounded border-[hsl(var(--border))]"
        />
        Banner enabled
      </label>

      <button
        type="button"
        onClick={onAddItem}
        className="inline-flex h-10 items-center gap-2 rounded-[var(--radius)] bg-[hsl(var(--primary))] px-4 text-sm font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90"
      >
        <Plus className="h-4 w-4" />
        Add message
      </button>
    </div>
  );
}