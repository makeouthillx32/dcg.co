"use client";

import React from "react";
import { ChevronRight, ChevronDown, Pencil, Trash2, GripVertical } from "lucide-react";

export type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  position: number;
  sort_order: number;
  is_active: boolean;
  children?: Category[];
};

interface CategoriesTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

function buildTree(flat: Category[]): Category[] {
  const map: Record<string, Category> = {};
  const roots: Category[] = [];

  flat.forEach((c) => {
    map[c.id] = { ...c, children: [] };
  });

  flat.forEach((c) => {
    if (c.parent_id && map[c.parent_id]) {
      map[c.parent_id].children!.push(map[c.id]);
    } else {
      roots.push(map[c.id]);
    }
  });

  // Sort each level by position then sort_order
  const sortLevel = (nodes: Category[]) => {
    nodes.sort((a, b) => a.position - b.position || a.sort_order - b.sort_order);
    nodes.forEach((n) => n.children?.length && sortLevel(n.children));
  };
  sortLevel(roots);

  return roots;
}

function CategoryRow({
  category,
  depth,
  onEdit,
  onDelete,
  expanded,
  onToggle,
}: {
  category: Category;
  depth: number;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
  expanded: Set<string>;
  onToggle: (id: string) => void;
}) {
  const hasChildren = (category.children?.length ?? 0) > 0;
  const isExpanded = expanded.has(category.id);

  return (
    <>
      <tr className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))/40] transition-colors group">
        <td className="py-3 px-4">
          <div
            className="flex items-center gap-2"
            style={{ paddingLeft: `${depth * 20}px` }}
          >
            {/* Expand toggle */}
            <button
              type="button"
              onClick={() => hasChildren && onToggle(category.id)}
              className={`w-5 h-5 flex items-center justify-center rounded transition-colors shrink-0 ${
                hasChildren
                  ? "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] cursor-pointer"
                  : "text-transparent cursor-default"
              }`}
            >
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )
              ) : (
                <span className="w-3 h-px bg-[hsl(var(--border))] block ml-1" />
              )}
            </button>

            {/* Depth indicator dots */}
            {depth > 0 && (
              <span className="text-[hsl(var(--muted-foreground))] text-xs select-none">
                {"└"}
              </span>
            )}

            <span className={`font-medium text-sm ${depth === 0 ? "text-[hsl(var(--foreground))]" : "text-[hsl(var(--muted-foreground))]"}`}>
              {category.name}
            </span>

            {(category.children?.length ?? 0) > 0 && (
              <span className="text-[10px] text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] rounded-full px-1.5 py-0.5 leading-none">
                {category.children!.length}
              </span>
            )}
          </div>
        </td>

        <td className="py-3 px-4">
          <code className="text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] px-1.5 py-0.5 rounded">
            /{category.slug}
          </code>
        </td>

        <td className="py-3 px-4">
          <span
            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
              category.is_active
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${category.is_active ? "bg-green-500" : "bg-[hsl(var(--muted-foreground))]"}`} />
            {category.is_active ? "Active" : "Inactive"}
          </span>
        </td>

        <td className="py-3 px-4">
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            {depth === 0 ? "Root" : "Sub"}
          </span>
        </td>

        <td className="py-3 px-4 text-right">
          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onEdit(category)}
              className="p-1.5 rounded hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              title="Edit category"
            >
              <Pencil size={13} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(category)}
              className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-[hsl(var(--muted-foreground))] hover:text-red-600 transition-colors"
              title="Delete category"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </td>
      </tr>

      {/* Render children if expanded */}
      {hasChildren && isExpanded &&
        category.children!.map((child) => (
          <CategoryRow
            key={child.id}
            category={child}
            depth={depth + 1}
            onEdit={onEdit}
            onDelete={onDelete}
            expanded={expanded}
            onToggle={onToggle}
          />
        ))}
    </>
  );
}

export default function CategoriesTable({ categories, onEdit, onDelete }: CategoriesTableProps) {
  const tree = buildTree(categories);
  const [expanded, setExpanded] = React.useState<Set<string>>(() => {
    // Auto-expand roots that have children
    const s = new Set<string>();
    categories.forEach((c) => {
      if (!c.parent_id && categories.some((ch) => ch.parent_id === c.id)) {
        s.add(c.id);
      }
    });
    return s;
  });

  const onToggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-16 text-[hsl(var(--muted-foreground))] text-sm">
        No categories yet. Create your first one above.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[hsl(var(--border))] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[hsl(var(--muted))/60] border-b border-[hsl(var(--border))]">
            <th className="text-left py-2.5 px-4 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
              Name
            </th>
            <th className="text-left py-2.5 px-4 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
              Slug
            </th>
            <th className="text-left py-2.5 px-4 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
              Status
            </th>
            <th className="text-left py-2.5 px-4 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
              Level
            </th>
            <th className="py-2.5 px-4" />
          </tr>
        </thead>
        <tbody>
          {tree.map((root) => (
            <CategoryRow
              key={root.id}
              category={root}
              depth={0}
              onEdit={onEdit}
              onDelete={onDelete}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}