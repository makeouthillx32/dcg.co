// app/settings/categories/_components/CreateCategoryModal.tsx
"use client";

import { useState } from "react";
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

  const handleSubmit = async () => {
    if (!name.trim() || !slug.trim()) return;
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
        <div>
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSlug(
                e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "")
              );
            }}
            className="mt-1 h-10 w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">
            Slug
          </label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mt-1 h-10 w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm"
          />
        </div>

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
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

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
            disabled={submitting}
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