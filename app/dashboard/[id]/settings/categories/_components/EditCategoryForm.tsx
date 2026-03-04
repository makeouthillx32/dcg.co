"use client";

import React, { useState, useEffect } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  is_active: boolean;
};

interface EditCategoryFormProps {
  category: Category;
  allCategories: Category[];
  onSaved: () => void;
  onCancel: () => void;
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function EditCategoryForm({
  category,
  allCategories,
  onSaved,
  onCancel,
}: EditCategoryFormProps) {
  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug);
  const [slugManual, setSlugManual] = useState(true); // editing = always manual
  const [parentId, setParentId] = useState<string>(category.parent_id ?? "");
  const [isActive, setIsActive] = useState(category.is_active);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset when category prop changes
  useEffect(() => {
    setName(category.name);
    setSlug(category.slug);
    setParentId(category.parent_id ?? "");
    setIsActive(category.is_active);
    setError(null);
  }, [category.id]);

  const handleSlugChange = (val: string) => {
    setSlug(slugify(val));
  };

  // Don't allow setting self or own descendants as parent (prevent cycles)
  const getDescendantIds = (id: string): Set<string> => {
    const result = new Set<string>();
    const queue = [id];
    while (queue.length) {
      const current = queue.shift()!;
      allCategories.forEach((c) => {
        if (c.parent_id === current && !result.has(c.id)) {
          result.add(c.id);
          queue.push(c.id);
        }
      });
    }
    return result;
  };

  const invalidParents = new Set([category.id, ...getDescendantIds(category.id)]);

  const parentOptions = allCategories.filter((c) => !invalidParents.has(c.id));

  const getOptionLabel = (cat: Category): string => {
    if (!cat.parent_id) return cat.name;
    const parent = allCategories.find((c) => c.id === cat.parent_id);
    return parent ? `${parent.name} › ${cat.name}` : cat.name;
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!slug.trim()) {
      setError("Slug is required.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          parent_id: parentId || null,
          is_active: isActive,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? "Failed to update category.");
        return;
      }

      onSaved();
    } catch (e: any) {
      setError(e?.message ?? "Unexpected error.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 p-1">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-3 py-2 rounded-md">
          {error}
        </p>
      )}

      {/* Name */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[hsl(var(--foreground))]">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]/30 focus:border-[hsl(var(--ring))]"
        />
      </div>

      {/* Slug */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[hsl(var(--foreground))]">
          Slug <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          className="w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] font-mono focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]/30 focus:border-[hsl(var(--ring))]"
        />
        <p className="text-xs text-[hsl(var(--muted-foreground))]">/shop/{slug || "…"}</p>
      </div>

      {/* Parent Category */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[hsl(var(--foreground))]">
          Parent Category
        </label>
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]/30 focus:border-[hsl(var(--ring))]"
        >
          <option value="">— None (top-level) —</option>
          {parentOptions.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {getOptionLabel(cat)}
            </option>
          ))}
        </select>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          {parentId
            ? `Sub-link under "${allCategories.find((c) => c.id === parentId)?.name}"`
            : "Appears directly in the navigation bar."}
        </p>
      </div>

      {/* Active toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div
          onClick={() => setIsActive((v) => !v)}
          className={`relative w-9 h-5 rounded-full transition-colors ${
            isActive ? "bg-[hsl(var(--primary))]" : "bg-[hsl(var(--muted))]"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              isActive ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </div>
        <span className="text-sm text-[hsl(var(--foreground))]">Active</span>
      </label>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 text-sm rounded-md border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving || !name.trim() || !slug.trim()}
          className="px-4 py-2 text-sm rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}