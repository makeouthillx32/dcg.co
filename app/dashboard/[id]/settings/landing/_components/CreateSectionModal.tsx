// app/dashboard/[id]/settings/landing/_components/CreateSectionModal.tsx
"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import "./landing.scss";

interface CreateSectionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SECTION_TYPES = [
  { 
    value: "top_banner", 
    label: "Top Banner", 
    description: "Announcement bar at the very top of the page",
    config: {
      message: "Free Shipping on Orders Over $75",
      link: "/shop",
      linkText: "Shop Now",
      backgroundColor: "accent",
      dismissible: true
    }
  },
  { 
    value: "hero_carousel", 
    label: "Hero Carousel", 
    description: "Large rotating image slider with call-to-action buttons",
    config: {
      slides: [
        {
          image: "/hero-1.jpg",
          title: "New Western Collection",
          subtitle: "Authentic cowgirl style for modern women",
          buttonText: "Shop Collection",
          buttonLink: "/new-releases"
        },
        {
          image: "/hero-2.jpg",
          title: "Desert Girl Exclusives",
          subtitle: "Limited edition pieces you won't find anywhere else",
          buttonText: "Explore Exclusives",
          buttonLink: "/desert-girl-exclusives"
        }
      ],
      autoplay: true,
      interval: 5000
    }
  },
  { 
    value: "categories_grid", 
    label: "Categories Grid", 
    description: "Display product categories in a grid layout",
    config: { 
      title: "Shop by Category", 
      columns: 3,
      showImages: true,
      categoryIds: [] // Leave empty to show all categories
    } 
  },
  { 
    value: "static_html", 
    label: "Static HTML Page", 
    description: "Embed a custom static page by its slug",
    config: { 
      slug: "landing-qr-download",
      showTitle: false,
      containerWidth: "full" // "full" | "contained" | "narrow"
    } 
  },
  { 
    value: "products_grid", 
    label: "Products Grid", 
    description: "Display products in a grid with filtering options",
    config: { 
      title: "Shop Bestsellers", 
      description: "Our most-loved Western wear pieces",
      limit: 8, 
      startIndex: 0, 
      viewAllHref: "/shop",
      collection: "", // Optional: filter by collection slug
      category: "", // Optional: filter by category slug
      featured: false, // Show only featured products
      sortBy: "newest" // "newest" | "featured" | "price-asc" | "price-desc"
    } 
  },
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
      {/* Backdrop */}
      <div className="modal-backdrop" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="modal-overlay">
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <div>
              <h2 className="modal-title">Add Section</h2>
              <p className="modal-subtitle">
                Create a new section for your landing page
              </p>
            </div>
            <button onClick={onClose} className="modal-close">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="modal-body">
            {error && (
              <div className="modal-error">
                {error}
              </div>
            )}

            {/* Section Type */}
            <div className="form-field">
              <label className="form-label">
                Section Type
              </label>
              <select
                value={type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="form-select"
              >
                {SECTION_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {SECTION_TYPES.find(t => t.value === type)?.description && (
                <p className="form-hint">
                  {SECTION_TYPES.find(t => t.value === type)?.description}
                </p>
              )}
            </div>

            {/* Active Checkbox */}
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

            {/* Config Textarea */}
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
              {saving ? 'Creating...' : 'Create Section'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}