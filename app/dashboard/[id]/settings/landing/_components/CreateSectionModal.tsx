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
          position: 999,
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
    <>
      {/* Backdrop - separate element for proper layering */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
        }}
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          pointerEvents: 'none',
          zIndex: 9999,
        }}
      >
        <div
          style={{
            pointerEvents: 'auto',
            width: '100%',
            maxWidth: '672px',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '24px',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                Add Section
              </h2>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                Create a new section for your landing page
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: '#6b7280',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: '24px', backgroundColor: '#ffffff' }}>
            {error && (
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                fontSize: '14px',
                marginBottom: '16px',
              }}>
                {error}
              </div>
            )}

            {/* Section Type */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}>
                Section Type
              </label>
              <select
                value={type}
                onChange={(e) => handleTypeChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  backgroundColor: '#ffffff',
                  color: '#111827',
                  fontSize: '14px',
                }}
              >
                {SECTION_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Active Checkbox */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={{ width: '16px', height: '16px', borderRadius: '4px' }}
                />
                Active (show on landing page)
              </label>
            </div>

            {/* Config Textarea */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}>
                Configuration (JSON)
              </label>
              <textarea
                value={configText}
                onChange={(e) => setConfigText(e.target.value)}
                style={{
                  width: '100%',
                  height: '256px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  backgroundColor: '#ffffff',
                  color: '#111827',
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: '13px',
                  resize: 'vertical',
                }}
                spellCheck={false}
              />
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                Configure section-specific options like title, slug, limit, etc.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: '24px',
              borderTop: '1px solid #e5e7eb',
              backgroundColor: '#ffffff',
            }}
          >
            <button
              onClick={onClose}
              disabled={saving}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                backgroundColor: '#ffffff',
                color: '#374151',
                fontSize: '14px',
                fontWeight: 500,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.5 : 1,
              }}
              onMouseEnter={(e) => !saving && (e.currentTarget.style.backgroundColor = '#f9fafb')}
              onMouseLeave={(e) => !saving && (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 500,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
              }}
              onMouseEnter={(e) => !saving && (e.currentTarget.style.backgroundColor = '#2563eb')}
              onMouseLeave={(e) => !saving && (e.currentTarget.style.backgroundColor = '#3b82f6')}
            >
              {saving ? 'Creating...' : 'Create Section'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}