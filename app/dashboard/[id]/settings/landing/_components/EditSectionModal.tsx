// app/dashboard/[id]/settings/landing/_components/EditSectionModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { LandingSectionRow } from "./types";
import "./landing.scss";

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
    <>
      {/* Backdrop */}
      <div className="modal-backdrop" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="modal-overlay">
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <div>
              <h2 className="modal-title">Edit Section</h2>
              <p className="modal-subtitle">
                Update section configuration
              </p>
            </div>
            <button onClick={onClose} className="modal-close">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="modal-body">
            {error && (
              <div className="modal-error">
                {error}
              </div>
            )}

            <div className="form-field">
              <label className="form-label">
                Section Type
              </label>
              <div className="section-type-display">
                <span className={`type-badge type-${type}`}>
                  {type}
                </span>
                <span className="section-type-label">
                  {type === 'top_banner' && 'Announcement bar at the very top of the page'}
                  {type === 'hero_carousel' && 'Large rotating image slider with call-to-action buttons'}
                  {type === 'categories_grid' && 'Display product categories in a grid layout'}
                  {type === 'static_html' && 'Embed a custom static page by its slug'}
                  {type === 'products_grid' && 'Display products in a grid with filtering options'}
                </span>
              </div>
              <p className="form-hint">
                Type cannot be changed after creation
              </p>
            </div>

            <div className="form-field">
              <label className="form-checkbox-label">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="form-checkbox"
                />
                Active (show on landing page)
              </label>
            </div>

            <div className="form-field">
              <label className="form-label">
                Configuration (JSON)
              </label>
              <textarea
                value={configText}
                onChange={(e) => setConfigText(e.target.value)}
                className="form-textarea mono"
                spellCheck={false}
              />
              <p className="form-hint">
                {type === 'top_banner' && 'Configure message, link, background color, and dismissibility'}
                {type === 'hero_carousel' && 'Configure slides with images, titles, subtitles, and CTA buttons'}
                {type === 'categories_grid' && 'Configure title, number of columns, and which categories to display'}
                {type === 'static_html' && 'Specify the slug of your static page to embed'}
                {type === 'products_grid' && 'Configure title, filters (collection/category), limit, and sorting'}
                {!type && 'Edit the JSON configuration for this section'}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              onClick={onClose}
              disabled={saving}
              className="btn"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}