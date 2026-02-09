// app/settings/categories/_components/CategoriesTable.tsx
"use client";

import { ChevronRight, Pencil, Trash2 } from "lucide-react";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
};

type Props = {
  categories: CategoryRow[];
  onEdit: (category: CategoryRow) => void;
  onDelete: (category: CategoryRow) => void;
};

/**
 * Renders categories as a simple tree (parent → children)
 * Assumes categories are already filtered + fetched.
 */
export function CategoriesTable({ categories, onEdit, onDelete }: Props) {
  const byParent = categories.reduce<Record<string, CategoryRow[]>>((acc, cat) => {
    const key = cat.parent_id ?? "root";
    acc[key] = acc[key] || [];
    acc[key].push(cat);
    return acc;
  }, {});

  const renderRows = (parentId: string | null, depth = 0) => {
    const rows = byParent[parentId ?? "root"] || [];
    return rows.map((cat) => (
      <div key={cat.id}>
        <div
          className="flex items-center justify-between rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2"
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          <div className="flex min-w-0 items-center gap-2">
            {byParent[cat.id]?.length ? (
              <ChevronRight className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            ) : (
              <span className="h-4 w-4" />
            )}

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[hsl(var(--foreground))]">
                {cat.name}
              </p>
              <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">
                /{cat.slug}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(cat)}
              className="rounded-[var(--radius)] p-1.5 hover:bg-[hsl(var(--muted))]"
            >
              <Pencil className="h-4 w-4 text-[hsl(var(--foreground))]" />
            </button>
            <button
              onClick={() => onDelete(cat)}
              className="rounded-[var(--radius)] p-1.5 hover:bg-[hsl(var(--muted))]"
            >
              <Trash2 className="h-4 w-4 text-[hsl(var(--destructive))]" />
            </button>
          </div>
        </div>

        {renderRows(cat.id, depth + 1)}
      </div>
    ));
  };

  return <div className="space-y-2">{renderRows(null)}</div>;
}