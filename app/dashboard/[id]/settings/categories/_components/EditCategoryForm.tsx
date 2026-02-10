// app/settings/categories/_components/EditCategoryForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { CategoryModal } from "./CategoryModal";
import type { CategoryRow } from "./CategoriesTable";

type Props = {
  open: boolean;
  category: CategoryRow | null;
  categories: CategoryRow[];
  onClose: () => void;
  onSave: (data: {
    id: string;
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

function collectDescendantIds(categories: CategoryRow[], rootId: string) {
  const childrenByParent = new Map<string, string[]>();
  for (const c of categories) {
    if (!c.parent_id) continue;
    const arr = childrenByParent.get(c.parent_id) ?? [];
    arr.push(c.id);
    childrenByParent.set(c.parent_id, arr);
  }

  const out = new Set<string>();
  const stack = [rootId];

  while (stack.length) {
    const id = stack.pop()!;
    const kids = childrenByParent.get(id) ?? [];
    for (const k of kids) {
      if (!out.has(k)) {
        out.add(k);
        stack.push(k);
      }
    }
  }

  return out;
}

export function EditCategoryForm({
  open,
  category,
  categories,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ✅ keep fields in sync when opening / switching selected category
  useEffect(() => {
    if (!open || !category) return;
    setName(category.name ?? "");
    setSlug(category.slug ?? "");
    setParentId(category.parent_id ?? null);
    setSubmitting(false);
  }, [open, category]);

  const slugExists = useMemo(() => {
    if (!category) return false;
    const s = slug.trim().toLowerCase();
    if (!s) return false;
    return categories.some((c) => c.slug === s && c.id !== category.id);
  }, [slug, categories, category]);

  const invalidParentIds = useMemo(() => {
    if (!category) return new Set<string>();
    const descendants = collectDescendantIds(categories, category.id);
    // cannot be self OR any descendant
    return new Set<string>([category.id, ...Array.from(descendants)]);
  }, [categories, category]);

  const parentOptions = useMemo(() => {
    // show hierarchical labels, exclude invalid parents
    const labeled = buildLabelMap(categories)
      .filter((c) => !invalidParentIds.has(c.id))
      .sort((a, b) => a.label.localeCompare(b.label));
    return labeled;
  }, [categories, invalidParentIds]);

  const canSubmit =
    !!category &&
    name.trim().length > 0 &&
    slug.trim().length > 0 &&
    !slugExists &&
    !submitting;

  if (!category) return null;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    // extra safety: block invalid parent picks
    if (parentId && invalidParentIds.has(parentId)) return;

    try {
      setSubmitting(true);
      await onSave({
        id: category.id,
        name: name.trim(),
        slug: slugify(slug),
        parent_id: parentId,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CategoryModal
      open={open}
      title="Edit category"
      description="Update the category details."
      onClose={submitting ? () => {} : onClose}
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

              // ✅ don't clobber a manually-edited slug:
              // only auto-update if slug matches old name slug or slug is empty
              const nextAuto = slugify(v);
              const slugLooksAuto = !slug.trim() || slug === slugify(category.name);
              if (slugLooksAuto) setSlug(nextAuto);
            }}
            className="mt-1 h-10 w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm"
          />
        </div>

        {/* Slug */}
        <div>
          {/* ✅ FIXED: missing closing bracket in your className */}
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">
            Slug
          </label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            onBlur={() => setSlug((s) => slugify(s))}
            className={`mt-1 h-10 w-full rounded-[var(--radius)] border bg-[hsl(var(--background))] px-3 text-sm ${
              slugExists ? "border-red-500" : "border-[hsl(var(--border))]"
            }`}
          />
          {slugExists && (
            <p className="mt-1 text-xs text-red-500">
              This slug is already in use.
            </p>
          )}
        </div>

        {/* Parent */}
        <div>
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">
            Parent category
          </label>
          <select
            value={parentId ?? ""}
            onChange={(e) => setParentId(e.target.value || null)}
            className="mt-1 h-10 w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm"
          >
            <option value="">— None (top-level)</option>
            {parentOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>

          {parentId && invalidParentIds.has(parentId) ? (
            <p className="mt-1 text-xs text-red-500">
              Invalid parent selection (cannot set parent to self or a child).
            </p>
          ) : null}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="h-9 rounded-[var(--radius)] border border-[hsl(var(--border))] px-4 text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="h-9 rounded-[var(--radius)] bg-[hsl(var(--primary))] px-4 text-sm text-[hsl(var(--primary-foreground))] disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </CategoryModal>
  );
}
