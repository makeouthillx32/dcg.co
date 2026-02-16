// app/dashboard/[id]/settings/categories/_components/EditCategoryForm.tsx
"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { CategoryModal } from "./CategoryModal";
import type { CategoryRow } from "./CategoriesTable";
import { createClient } from "@/utils/supabase/client";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

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
  
  // Cover image state
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [coverImageAlt, setCoverImageAlt] = useState("");
  const [removeCoverImage, setRemoveCoverImage] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const parents = useMemo(
    () => buildLabelMap(categories.filter((c) => c.id !== category?.id)),
    [categories, category]
  );

  useEffect(() => {
    if (!category) return;
    setName(category.name);
    setSlug(category.slug);
    setParentId(category.parent_id ?? null);
    setCoverImageAlt((category as any).cover_image_alt ?? "");
    setCoverImageFile(null);
    setCoverImagePreview(null);
    setRemoveCoverImage(false);
    setError(null);
  }, [category]);

  if (!open || !category) return null;

  // Load existing cover image
  const existingCoverUrl = (category as any).cover_image_path && (category as any).cover_image_bucket
    ? supabase.storage.from((category as any).cover_image_bucket).getPublicUrl((category as any).cover_image_path).data.publicUrl
    : null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setCoverImageFile(file);
    setRemoveCoverImage(false);
    setError(null);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setCoverImageFile(null);
    setCoverImagePreview(null);
    setRemoveCoverImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadCoverImage = async (categoryId: string): Promise<{ path: string; bucket: string } | null> => {
    if (!coverImageFile) return null;

    const fileExt = coverImageFile.name.split(".").pop();
    const fileName = `${categoryId}-${Date.now()}.${fileExt}`;
    const filePath = `covers/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("category-covers")
      .upload(filePath, coverImageFile, {
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Image upload failed: ${uploadError.message}`);
    }

    return { path: filePath, bucket: "category-covers" };
  };

  const handleSave = async () => {
    if (!name.trim() || !slug.trim()) return;
    setError(null);
    
    try {
      setSaving(true);
      
      // Upload new cover image if selected
      let coverImageData: { path: string; bucket: string } | null = null;
      if (coverImageFile) {
        coverImageData = await uploadCoverImage(category.id);
      }

      // Update category with cover image fields
      const updateData: any = {
        name: name.trim(),
        slug: slug.trim(),
        parent_id: parentId,
      };

      // Handle cover image updates
      if (coverImageData) {
        updateData.cover_image_bucket = coverImageData.bucket;
        updateData.cover_image_path = coverImageData.path;
        updateData.cover_image_alt = coverImageAlt.trim() || name.trim();
      } else if (removeCoverImage) {
        updateData.cover_image_bucket = null;
        updateData.cover_image_path = null;
        updateData.cover_image_alt = null;
      } else if (coverImageAlt !== (category as any).cover_image_alt) {
        updateData.cover_image_alt = coverImageAlt.trim() || name.trim();
      }

      const { error: updateError } = await supabase
        .from("categories")
        .update(updateData)
        .eq("id", category.id);

      if (updateError) throw updateError;

      // Call the original onSave callback
      await onSave({
        id: category.id,
        name: name.trim(),
        slug: slug.trim(),
        parent_id: parentId,
      });
      
      onClose();
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const currentImageUrl = removeCoverImage
    ? null
    : coverImagePreview || existingCoverUrl;

  return (
    <CategoryModal
      open={open}
      title="Edit category"
      description="Update the category details."
      onClose={onClose}
    >
      <div className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Cover Image Upload */}
        <div>
          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
            Cover Image
          </label>
          
          <div className="space-y-3">
            <div
              onClick={() => !currentImageUrl && fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-lg overflow-hidden
                ${currentImageUrl ? 'border-[hsl(var(--border))]' : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] cursor-pointer'}
                ${!currentImageUrl ? 'bg-[hsl(var(--muted))]' : ''}
              `}
            >
              {currentImageUrl ? (
                <div className="relative aspect-[4/5] w-full max-w-xs">
                  <Image
                    src={currentImageUrl}
                    alt={coverImageAlt || name || "Category cover"}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage();
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="aspect-[4/5] w-full max-w-xs flex flex-col items-center justify-center p-6 text-center">
                  <ImageIcon className="h-12 w-12 text-[hsl(var(--muted-foreground))] mb-3" />
                  <p className="text-sm font-medium text-[hsl(var(--foreground))] mb-1">
                    Click to upload cover image
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    PNG, JPG, WEBP up to 5MB<br />
                    Recommended: 800x1000px
                  </p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {currentImageUrl && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-[hsl(var(--border))] rounded-md hover:bg-[hsl(var(--muted))] transition-colors"
              >
                <Upload className="h-4 w-4" />
                Change Image
              </button>
            )}

            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">
                Image Alt Text
              </label>
              <input
                type="text"
                value={coverImageAlt}
                onChange={(e) => setCoverImageAlt(e.target.value)}
                placeholder={name || "Describe the image"}
                className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">Name</label>
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
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            className="mt-1 h-10 w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm"
          />
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            URL: /{slug}
          </p>
        </div>

        {/* Parent */}
        <div>
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">
            Parent Category
          </label>
          <select
            value={parentId ?? ""}
            onChange={(e) => setParentId(e.target.value || null)}
            className="mt-1 h-10 w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm"
          >
            <option value="">None (top-level)</option>
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
            disabled={saving}
            onClick={handleSave}
            className="h-9 rounded-[var(--radius)] bg-[hsl(var(--primary))] px-4 text-sm text-[hsl(var(--primary-foreground))] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </CategoryModal>
  );
}