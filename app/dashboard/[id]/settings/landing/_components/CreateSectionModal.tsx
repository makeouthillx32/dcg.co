// app/dashboard/[id]/settings/landing/_components/CreateSectionModal.tsx
"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

interface CreateSectionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SECTION_TYPES = [
  { value: "top_banner", label: "Top Banner", config: {} },
  { value: "hero_carousel", label: "Hero Carousel", config: {} },
  { value: "categories_grid", label: "Categories Grid", config: { title: "Shop by Category", columns: 3 } },
  { value: "static_html", label: "Static HTML", config: { slug: "landing-qr-download" } },
  { value: "products_grid", label: "Products Grid", config: { title: "Shop Bestsellers", limit: 4, startIndex: 0, viewAllHref: "/shop" } },
];

export function CreateSectionModal({ open, onClose, onSuccess }: CreateSectionModalProps) {
  const [type, setType] = useState("static_html");
  const [isActive, setIsActive] = useState(true);
  const [configText, setConfigText] = useState(JSON.stringify(SECTION_TYPES.find(t => t.value === "static_html")?.config, null, 2));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function handleTypeChange(newType: string) {
    setType(newType);
    const preset = SECTION_TYPES.find(t => t.value === newType);
    setConfigText(JSON.stringify(preset?.config || {}, null, 2));
  }

  async function handleSave() {
    setError(null);
    
    let config;
    try {
      config = JSON.parse(configText);
    } catch {
      setError("Invalid JSON in config");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/landing/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position: 999, // Will be reordered
          type,
          is_active: isActive,
          config,
        }),
      });

      const data = await res.json();
      
      if (!res.ok || !data.ok) {
        throw new Error(data.error?.message || 'Failed to create section');
      }

      onSuccess();
      onClose();
      
      // Reset form
      setType("static_html");
      setIsActive(true);
      setConfigText(JSON.stringify(SECTION_TYPES[3].config, null, 2));
    } catch (err: any) {
      setError(err.message || 'Failed to create section');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Add Section</h2>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Create a new section for your landing page
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--accent)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Section Type
            </label>
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
            >
              {SECTION_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--border)]"
              />
              Active (show on landing page)
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Configuration (JSON)
            </label>
            <textarea
              value={configText}
              onChange={(e) => setConfigText(e.target.value)}
              className="w-full h-64 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] font-mono text-sm"
              spellCheck={false}
            />
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Configure section-specific options like title, slug, limit, etc.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--border)]">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity font-medium"
          >
            {saving ? 'Creating...' : 'Create Section'}
          </button>
        </div>
      </div>
    </div>
  );
}
