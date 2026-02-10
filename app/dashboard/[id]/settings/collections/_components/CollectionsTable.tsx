// app/settings/collections/_components/CollectionsTable.tsx
"use client";

import { Pencil, Trash2 } from "lucide-react";

export type CollectionRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  position: number;
  is_home_section: boolean;
};

type Props = {
  collections: CollectionRow[];
  onEdit: (collection: CollectionRow) => void;
  onDelete: (collection: CollectionRow) => void;
};

export function CollectionsTable({ collections, onEdit, onDelete }: Props) {
  return (
    <div className="space-y-2">
      {collections.map((col) => (
        <div
          key={col.id}
          className="flex items-center justify-between rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[hsl(var(--foreground))]">
              {col.name}
            </p>
            <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">
              /collections/{col.slug}
            </p>
            {col.is_home_section && (
              <p className="mt-1 text-xs text-[hsl(var(--primary))]">
                Shown on homepage
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(col)}
              className="rounded-[var(--radius)] p-1.5 hover:bg-[hsl(var(--muted))]"
            >
              <Pencil className="h-4 w-4 text-[hsl(var(--foreground))]" />
            </button>

            <button
              onClick={() => onDelete(col)}
              className="rounded-[var(--radius)] p-1.5 hover:bg-[hsl(var(--muted))]"
            >
              <Trash2 className="h-4 w-4 text-[hsl(var(--destructive))]" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}