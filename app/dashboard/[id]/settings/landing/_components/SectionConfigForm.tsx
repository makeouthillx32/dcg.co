// app/dashboard/[id]/settings/landing/_components/SectionConfigForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import "./landing.scss";

interface SectionConfigFormProps {
  type: string;
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export function SectionConfigForm({ type, config, onChange }: SectionConfigFormProps) {
  const [collections, setCollections] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Fetch collections and categories on mount
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [collectionsRes, categoriesRes] = await Promise.all([
          fetch('/api/collections'),
          fetch('/api/categories')
        ]);
        
        if (collectionsRes.ok) {
          const collectionsData = await collectionsRes.json();
          setCollections(collectionsData.data || collectionsData.collections || []);
        }
        
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.data || categoriesData.categories || []);
        }
      } catch (error) {
        console.error('Failed to fetch options:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const updateField = (field: string, value: any) => {
    onChange({ ...config, [field]: value });
  };

  if (loading) {
    return (
      <div className="form-field">
        <p className="form-hint">Loading configuration options...</p>
      </div>
    );
  }

  // TOP BANNER FORM
  if (type === 'top_banner') {
    return (
      <>
        <div className="form-field">
          <label className="form-label">Banner Message</label>
          <input
            type="text"
            value={config.message || ''}
            onChange={(e) => updateField('message', e.target.value)}
            className="form-input"
            placeholder="Free Shipping on Orders Over $75"
          />
        </div>

        <div className="form-field">
          <label className="form-label">Link URL</label>
          <input
            type="text"
            value={config.link || ''}
            onChange={(e) => updateField('link', e.target.value)}
            className="form-input"
            placeholder="/shop"
          />
        </div>

        <div className="form-field">
          <label className="form-label">Link Text</label>
          <input
            type="text"
            value={config.linkText || ''}
            onChange={(e) => updateField('linkText', e.target.value)}
            className="form-input"
            placeholder="Shop Now"
          />
        </div>

        <div className="form-field">
          <label className="form-label">Background Color</label>
          <select
            value={config.backgroundColor || 'accent'}
            onChange={(e) => updateField('backgroundColor', e.target.value)}
            className="form-select"
          >
            <option value="accent">Accent</option>
            <option value="primary">Primary</option>
            <option value="muted">Muted</option>
          </select>
        </div>

        <div className="form-field">
          <label className="form-checkbox-label">
            <input
              type="checkbox"
              checked={config.dismissible !== false}
              onChange={(e) => updateField('dismissible', e.target.checked)}
              className="form-checkbox"
            />
            User can dismiss banner
          </label>
        </div>
      </>
    );
  }

  // CATEGORIES GRID FORM
  if (type === 'categories_grid') {
    return (
      <>
        <div className="form-field">
          <label className="form-label">Section Title</label>
          <input
            type="text"
            value={config.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            className="form-input"
            placeholder="Shop by Category"
          />
        </div>

        <div className="form-field">
          <label className="form-label">Number of Columns</label>
          <select
            value={config.columns || 3}
            onChange={(e) => updateField('columns', parseInt(e.target.value))}
            className="form-select"
          >
            <option value="2">2 Columns</option>
            <option value="3">3 Columns</option>
            <option value="4">4 Columns</option>
            <option value="6">6 Columns</option>
          </select>
        </div>

        <div className="form-field">
          <label className="form-checkbox-label">
            <input
              type="checkbox"
              checked={config.showImages !== false}
              onChange={(e) => updateField('showImages', e.target.checked)}
              className="form-checkbox"
            />
            Show category images
          </label>
        </div>

        <div className="form-field">
          <label className="form-label">Specific Categories (leave empty for all)</label>
          <p className="form-hint">Hold Ctrl/Cmd to select multiple</p>
          <select
            multiple
            value={config.categoryIds || []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
              updateField('categoryIds', selected);
            }}
            className="form-select"
            style={{ minHeight: '120px' }}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </>
    );
  }

  // STATIC HTML FORM
  if (type === 'static_html') {
    return (
      <>
        <div className="form-field">
          <label className="form-label">Page Slug</label>
          <input
            type="text"
            value={config.slug || ''}
            onChange={(e) => updateField('slug', e.target.value)}
            className="form-input"
            placeholder="landing-qr-download"
          />
          <p className="form-hint">The slug of the static page to embed</p>
        </div>

        <div className="form-field">
          <label className="form-checkbox-label">
            <input
              type="checkbox"
              checked={config.showTitle === true}
              onChange={(e) => updateField('showTitle', e.target.checked)}
              className="form-checkbox"
            />
            Show page title
          </label>
        </div>

        <div className="form-field">
          <label className="form-label">Container Width</label>
          <select
            value={config.containerWidth || 'full'}
            onChange={(e) => updateField('containerWidth', e.target.value)}
            className="form-select"
          >
            <option value="full">Full Width</option>
            <option value="contained">Contained (max-width)</option>
            <option value="narrow">Narrow</option>
          </select>
        </div>
      </>
    );
  }

  // PRODUCTS GRID FORM
  if (type === 'products_grid') {
    return (
      <>
        <div className="form-field">
          <label className="form-label">Section Title</label>
          <input
            type="text"
            value={config.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            className="form-input"
            placeholder="Shop Bestsellers"
          />
        </div>

        <div className="form-field">
          <label className="form-label">Description (optional)</label>
          <input
            type="text"
            value={config.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            className="form-input"
            placeholder="Our most-loved Western wear pieces"
          />
        </div>

        <div className="form-field">
          <label className="form-label">Filter by Collection</label>
          <select
            value={config.collection || ''}
            onChange={(e) => updateField('collection', e.target.value)}
            className="form-select"
          >
            <option value="">All Products</option>
            {collections.map(col => (
              <option key={col.id} value={col.slug}>
                {col.name}
              </option>
            ))}
          </select>
          <p className="form-hint">Leave as "All Products" to show from all collections</p>
        </div>

        <div className="form-field">
          <label className="form-label">Filter by Category</label>
          <select
            value={config.category || ''}
            onChange={(e) => updateField('category', e.target.value)}
            className="form-select"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label">Number of Products</label>
          <input
            type="number"
            min="1"
            max="50"
            value={config.limit || 8}
            onChange={(e) => updateField('limit', parseInt(e.target.value) || 8)}
            className="form-input"
          />
        </div>

        <div className="form-field">
          <label className="form-label">Sort By</label>
          <select
            value={config.sortBy || 'newest'}
            onChange={(e) => updateField('sortBy', e.target.value)}
            className="form-select"
          >
            <option value="newest">Newest First</option>
            <option value="featured">Featured First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        <div className="form-field">
          <label className="form-checkbox-label">
            <input
              type="checkbox"
              checked={config.featured === true}
              onChange={(e) => updateField('featured', e.target.checked)}
              className="form-checkbox"
            />
            Show only featured products
          </label>
        </div>

        <div className="form-field">
          <label className="form-label">"View All" Link</label>
          <input
            type="text"
            value={config.viewAllHref || ''}
            onChange={(e) => updateField('viewAllHref', e.target.value)}
            className="form-input"
            placeholder="/shop"
          />
          <p className="form-hint">Leave empty to hide the "View All" button</p>
        </div>
      </>
    );
  }

  // HERO CAROUSEL FORM (simplified - users would manage slides elsewhere)
  if (type === 'hero_carousel') {
    return (
      <div className="form-field">
        <label className="form-label">Configuration</label>
        <p className="form-hint">
          Hero carousel configuration is complex and should be edited in JSON format.
          Use the advanced JSON editor below.
        </p>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="form-field">
      <p className="form-hint">No form available for this section type. Use JSON editor below.</p>
    </div>
  );
}
