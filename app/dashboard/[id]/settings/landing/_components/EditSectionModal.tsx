// app/dashboard/[id]/settings/landing/_components/EditSectionModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { LandingSectionRow } from "./types";

interface EditSectionModalProps {
  open: boolean;
  section: LandingSectionRow | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditSectionModal({ open, section, onClose, onSuccess }: EditSectionModalProps) {
  const [type, setType] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [configText, setConfigText] = useState("{}");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (section) {
      setType(section.type);
      setIsActive(section.is_active);
      setConfigText(JSON.stringify(section.config || {}, null, 2));
      setError(null);
    }
  }, [section]);

  if (!open || !section) return null;

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
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: section.id,
          type,
          is_active: isActive,
          config,
        }),
      });

      const data = await res.json();
      
      if (!res.ok || !data.ok) {
        throw new Error(data.error?.message || 'Failed to update section');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update section');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-2xl"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Edit Section</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
              Update section configuration
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              Section Type
            </label>
            <input
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-gray-100 dark:bg-gray-950"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                opacity: 0.6
              }}
              disabled
            />
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
              Type cannot be changed after creation
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ borderColor: 'var(--border)' }}
              />
              Active (show on landing page)
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              Configuration (JSON)
            </label>
            <textarea
              value={configText}
              onChange={(e) => setConfigText(e.target.value)}
              className="w-full h-64 px-3 py-2 rounded-lg border bg-white dark:bg-gray-950 font-mono text-sm"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)'
              }}
              spellCheck={false}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-lg border bg-white dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)'
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}