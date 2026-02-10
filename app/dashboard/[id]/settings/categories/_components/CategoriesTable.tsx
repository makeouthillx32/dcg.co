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

function buildMaps(categories: CategoryRow[]) {
  const byId = new Map<string, CategoryRow>();
  const byParent = new Map<string | null, CategoryRow[]>();

  for (const c of categories) {
    byId.set(c.id, c);
    const key = c.parent_id ?? null;
    const arr = byParent.get(key) ?? [];
    arr.push(c);
    byParent.set(key, arr);
  }

  return { byId, byParent };
}

function buildPathLabel(cat: CategoryRow, byId: Map<string, CategoryRow>) {
  const names: string[] = [cat.name];
  let cur = cat;

  // walk up parents to root
  while (cur.parent_id) {
    const p = byId.get(cur.parent_id);
    if (!p) break;
    names.push(p.name);
    cur = p;
  }

  return names.reverse().join(" → ");
}

export function CategoriesTable({ categories, onEdit, onDelete }: Props) {
  const { byId, byParent } = buildMaps(categories);

  // optional: sort siblings by name (keeps it predictable even if position isn't included)
  const getChildren = (parentId: string | null) => {
    const kids = byParent.get(parentId ?? null) ?? [];
    return [...kids].sort((a, b) => a.name.localeCompare(b.name));
  };

  const renderRows = (parentId: string | null, depth = 0) => {
    const rows = getChildren(parentId);

    return rows.map((cat) => {
      const children = getChildren(cat.id);
      const hasChildren = children.length > 0;
      const path = buildPathLabel(cat, byId);

      return (
        <div key={cat.id} className="space-y-2">
          <div
            className="flex items-center justify-between rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2"
            style={{ paddingLeft: `${12 + depth * 18}px` }}
          >
            <div className="flex min-w-0 items-center gap-2">
              {/* branch indicator */}
              <span
                className="relative mr-1 inline-flex h-4 w-4 items-center justify-center"
                aria-hidden="true"
              >
                {hasChildren ? (
                  <ChevronRight className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--muted-foreground))]" />
                )}
              </span>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium text-[hsl(var(--foreground))]">
                    {cat.name}
                  </p>

                  {/* Shows nesting context */}
                  {depth > 0 ? (
                    <span className="truncate text-xs text-[hsl(var(--muted-foreground))]">
                      {path}
                    </span>
                  ) : null}

                  {/* Shows how many are inside */}
                  {hasChildren ? (
                    <span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-2 py-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                      Contains: {children.length}
                    </span>
                  ) : null}
                </div>

                <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">
                  /{cat.slug}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onEdit(cat)}
                className="rounded-[var(--radius)] p-1.5 hover:bg-[hsl(var(--muted))]"
                aria-label={`Edit ${cat.name}`}
              >
                <Pencil className="h-4 w-4 text-[hsl(var(--foreground))]" />
              </button>

              <button
                type="button"
                onClick={() => onDelete(cat)}
                className="rounded-[var(--radius)] p-1.5 hover:bg-[hsl(var(--muted))]"
                aria-label={`Delete ${cat.name}`}
              >
                <Trash2 className="h-4 w-4 text-[hsl(var(--destructive))]" />
              </button>
            </div>
          </div>

          {/* children */}
          {hasChildren ? (
            <div className="space-y-2">
              {renderRows(cat.id, depth + 1)}
            </div>
          ) : null}
        </div>
      );
    });
  };

  return <div className="space-y-2">{renderRows(null)}</div>;
}
