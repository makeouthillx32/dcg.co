// app/settings/collections/_components/CreateCollectionModal.tsx
"use client";

import { useState } from "react";
import { CollectionModal } from "./CollectionModal";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    slug: string;
    description: string | null;
    is_home_section: boolean;
  }) => Promise<void> | void;
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function CreateCollectionModal({ open, onClose, onCreate }: Props) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState<string>("");
  const [isHome, setIsHome] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !slug.trim()) return;
    try {
      setSubmitting(true);
      await onCreate({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() ? description.trim() : null,
        is_home_section: isHome,
      });
      setName("");
      setSlug("");
      setDescription("");
      setIsHome(true);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CollectionModal
      open={open}
      title="Create collection"
      description="Create a storefront collection (used in /collections/* and footer links)."
      onClose={onClose}
    >
      <div className="space-y-4">
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

        <div>
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            className="mt-1 h-10 w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm"
          />
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            URL: /collections/{slug || "your-slug"}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2 text-sm"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-[hsl(var(--foreground))]">
          <input
            type="checkbox"
            checked={isHome}
            onChange={(e) => setIsHome(e.target.checked)}
            className="h-4 w-4 rounded border-[hsl(var(--border))]"
          />
          Show on homepage (is_home_section)
        </label>

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
    </CollectionModal>
  );
}