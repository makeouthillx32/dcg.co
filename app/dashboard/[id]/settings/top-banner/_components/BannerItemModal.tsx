// app/settings/top-banner/_components/BannerItemModal.tsx
"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { BannerItemRow } from "./BannerItemsTable";

type Props = {
  open: boolean;
  item?: BannerItemRow | null;
  onClose: () => void;
  onSave: (data: { text: string }) => Promise<void> | void;
};

export function BannerItemModal({ open, item, onClose, onSave }: Props) {
  const [text, setText] = useState(item?.text ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setText(item?.text ?? "");
  }, [item]);

  if (!open) return null;

  const handleSave = async () => {
    if (!text.trim()) return;
    try {
      setSaving(true);
      await onSave({ text: text.trim() });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <button
        aria-label="Close"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute left-1/2 top-1/2 w-[calc(100%-24px)] max-w-lg -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[var(--shadow-lg)]">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-4 py-3">
            <h2 className="text-sm font-semibold text-[hsl(var(--foreground))]">
              {item ? "Edit banner message" : "Add banner message"}
            </h2>
            <button
              onClick={onClose}
              className="rounded-[var(--radius)] p-1.5 hover:bg-[hsl(var(--muted))]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                Message text
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2 text-sm"
              />
            </div>

            <div className="flex justify-end gap-2">
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
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}