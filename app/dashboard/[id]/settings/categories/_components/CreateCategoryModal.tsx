"use client";

import { useMemo, useState } from "react";
import { CategoryModal } from "./CategoryModal";
import type { CategoryRow } from "./CategoriesTable";

type Props = {
  open: boolean;
  categories: CategoryRow[];
  onClose: () => void;
  onCreate: (data: {
    name: string;
    slug: string;
    parent_id: string | null;
  }) => Promise<void> | void;
};

function slugify(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Build "Parent → Child" labels for selects
function buildLabelMap(categories: CategoryRow[]) {
  const map = new Map<string, CategoryRow>();
  categories.forEach((c) => map.set(c.id, c));

  const labelFor = (cat: CategoryRow): string => {
    if (!cat.parent_id) return cat.name;
    const parent = map.get(cat.parent_id);
    return parent ? `${labelFor(parent)} → ${cat.name}` : cat.name;
  };

  return categories.map((c) => ({
    id: c.id,
    label: labelFor(c),
  }));
}

export function CreateCategoryModal({
  open,
  categories,
  onClose,
  onCreate,
}: Props) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const slugExists = useMemo(() => {
    const s = slug.trim().toLowerCase();
    if (!s) return false;
    return categories.some((c) => c.slug === s);
  }, [slug, categories]);

  const parents = useMemo(
    () => buildLabelMap(categories),
    [categories]
  );

  const canSubmit =
    name.trim().length > 0 &&
    slug.trim().length > 0 &&
    !slugExists &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      setSubmitting(true);
      await onCreate({
        name: name.trim(),
        slug: slug.trim(),
        parent_id: parentId,
      });

      setName("");
      setSlug("");
      setParentId(null);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CategoryModal
      open={open}
      title="Create category"
      description="Add a new category to your storefront navigation."
      onClose={onClose}
    >
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => {
              const v = e.target.value;
              setName(v);
              setSlug(slugify(v));
            }}
            className="mt-1 h-10 w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">
            Slug
          </label>
          <input
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            className={`mt-1 h-10 w-full rounded-[var(--radius)] border px-3 text-sm
              ${
                slugExists
                  ? "border-red-500"
                  : "border-[hsl(var(--border))]"
              }
            `}
          />
          {slugExists && (
            <p className="mt-1 text-xs text-red-500">
              This slug already exists.
            </p>
          )}
        </div>

        {/* Parent */}
        <div>
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">
            Parent category (optional)
          </label>
          <select
            value={parentId ?? ""}
            onChange={(e) => setParentId(e.target.value || null)}
            className="mt-1 h-10 w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm"
          >
            <option value="">— None (top-level)</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-[var(--radius)] border border-[hsl(var(--border))] px-4 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="h-9 rounded-[var(--radius)] bg-[hsl(var(--primary))] px-4 text-sm text-[hsl(var(--primary-foreground))] disabled:opacity-50"
          >
            Create
          </button>
        </div>
      </div>
    </CategoryModal>
  );
}
