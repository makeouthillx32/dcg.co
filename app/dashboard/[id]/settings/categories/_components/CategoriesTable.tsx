// app/dashboard/[id]/settings/categories/_components/CategoriesTable.tsx
"use client";

import { Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { useMemo } from "react";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  cover_image_bucket?: string | null;
  cover_image_path?: string | null;
  cover_image_alt?: string | null;
};

type Props = {
  categories: CategoryRow[];
  onEdit: (category: CategoryRow) => void;
  onDelete: (category: CategoryRow) => void;
};

export function CategoriesTable({ categories, onEdit, onDelete }: Props) {
  const supabase = useMemo(() => createClient(), []);

  const getCoverImageUrl = (category: CategoryRow): string | null => {
    if (!category.cover_image_bucket || !category.cover_image_path) {
      return null;
    }

    const { data } = supabase.storage
      .from(category.cover_image_bucket)
      .getPublicUrl(category.cover_image_path);

    return data.publicUrl;
  };

  // Build hierarchy labels
  const labelMap = useMemo(() => {
    const map = new Map<string, CategoryRow>();
    categories.forEach((c) => map.set(c.id, c));

    const labelFor = (cat: CategoryRow): string => {
      if (!cat.parent_id) return cat.name;
      const parent = map.get(cat.parent_id);
      return parent ? `${labelFor(parent)} → ${cat.name}` : cat.name;
    };

    return new Map(categories.map((c) => [c.id, labelFor(c)]));
  }, [categories]);

  return (
    <div className="space-y-2">
      {categories.map((cat) => {
        const coverUrl = getCoverImageUrl(cat);
        const label = labelMap.get(cat.id) ?? cat.name;

        return (
          <div
            key={cat.id}
            className="flex items-center gap-3 rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3"
          >
            {/* Cover Image Thumbnail */}
            <div className="flex-shrink-0">
              {coverUrl ? (
                <div className="relative w-16 h-20 rounded-md overflow-hidden border border-[hsl(var(--border))]">
                  <Image
                    src={coverUrl}
                    alt={cat.cover_image_alt || cat.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              ) : (
                <div className="w-16 h-20 rounded-md border-2 border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))] flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
                </div>
              )}
            </div>

            {/* Category Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[hsl(var(--foreground))]">
                {label}
              </p>
              <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">
                /{cat.slug}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(cat)}
                className="rounded-[var(--radius)] p-1.5 hover:bg-[hsl(var(--muted))] transition-colors"
                aria-label="Edit category"
              >
                <Pencil className="h-4 w-4 text-[hsl(var(--foreground))]" />
              </button>

              <button
                onClick={() => onDelete(cat)}
                className="rounded-[var(--radius)] p-1.5 hover:bg-[hsl(var(--muted))] transition-colors"
                aria-label="Delete category"
              >
                <Trash2 className="h-4 w-4 text-[hsl(var(--destructive))]" />
              </button>
            </div>
          </div>
        );
      })}

      {categories.length === 0 && (
        <div className="text-center py-12 text-sm text-[hsl(var(--muted-foreground))]">
          No categories yet. Click "Create Category" to get started.
        </div>
      )}
    </div>
  );
}