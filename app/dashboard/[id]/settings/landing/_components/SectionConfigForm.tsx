// app/dashboard/[id]/settings/landing/_components/SectionConfigForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import "./landing.scss";

interface SectionConfigFormProps {
  type: string;
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

interface CollectionOption {
  id: string;
  name: string;
  slug: string;
  product_count?: number;
}

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  product_count?: number;
}

export function SectionConfigForm({ type, config, onChange }: SectionConfigFormProps) {
  const [collections, setCollections] = useState<CollectionOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
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
    // Handle empty strings as null for optional fields
    const cleanValue = value === '' ? null : value;
    
    // Remove the field entirely if it's null/undefined
    if (cleanValue === null || cleanValue === undefined) {
      const newConfig = { ...config };
      delete newConfig[field];
      onChange(newConfig);
    } else {
      onChange({ ...config, [field]: cleanValue });
    }
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
      <div className="custom-component-notice">
        <div className="notice-icon">ℹ️</div>
        <div className="notice-content">
          <h4>Custom Component by unenter</h4>
          <p>
            This section uses a custom-built component that doesn't require configuration. 
            The announcement banner is managed directly in the component code.
          </p>
          <p className="notice-hint">
            Simply add this section to your landing page - it will work automatically.
          </p>
        </div>
      </div>
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
          <label className="form-label">Specific Categories (optional)</label>
          <p className="form-hint">Leave empty to show all categories, or select specific ones (Hold Ctrl/Cmd for multiple)</p>
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
          {config.categoryIds && config.categoryIds.length > 0 && (
            <p className="form-hint">
              Selected: {config.categoryIds.length} {config.categoryIds.length === 1 ? 'category' : 'categories'}
            </p>
          )}
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
    const selectedCollection = collections.find(c => c.slug === config.collection);
    
    return (
      <>
        {/* Summary Box - Only show if collection is selected */}
        {config.collection && (
          <div className="config-summary">
            <p className="config-summary-title">Section Preview:</p>
            <p className="config-summary-text">
              Showing {config.limit || 8} products from collection "{selectedCollection?.name || config.collection}"
              {config.featured && ' (featured only)'}
              {' - sorted by '}
              {config.sortBy === 'newest' && 'newest first'}
              {config.sortBy === 'featured' && 'featured first'}
              {config.sortBy === 'price-asc' && 'price (low to high)'}
              {config.sortBy === 'price-desc' && 'price (high to low)'}
              {!config.sortBy && 'newest first'}
            </p>
          </div>
        )}
        
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
          <label className="form-label">Collection (Required)</label>
          <select
            value={config.collection || ''}
            onChange={(e) => {
              const newCollection = e.target.value;
              updateField('collection', newCollection || null);
              // Auto-update viewAllHref when collection changes
              if (newCollection && !config.viewAllHref) {
                updateField('viewAllHref', `/collections/${newCollection}`);
              }
            }}
            className="form-select"
          >
            <option value="">-- Select a Collection --</option>
            {collections.map(col => (
              <option key={col.id} value={col.slug}>
                {col.name}
                {col.product_count !== undefined && ` (${col.product_count} products)`}
              </option>
            ))}
          </select>
          <p className="form-hint">
            {config.collection 
              ? `Displaying products from "${selectedCollection?.name || config.collection}" collection` 
              : 'Please select a collection to display products from'}
          </p>
        </div>

        <div className="form-field">
          <label className="form-label">Number of Products to Show</label>
          <input
            type="number"
            min="1"
            max="50"
            value={config.limit || 8}
            onChange={(e) => updateField('limit', parseInt(e.target.value) || 8)}
            className="form-input"
          />
          <p className="form-hint">Maximum number of products to display in this section</p>
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
              onChange={(e) => updateField('featured', e.target.checked || null)}
              className="form-checkbox"
            />
            Show only featured products
          </label>
          <p className="form-hint">If checked, only products marked as "featured" will be shown</p>
        </div>

        <div className="form-field">
          <label className="form-label">"View All" Link (Optional)</label>
          <div className="input-with-button">
            <input
              type="text"
              value={config.viewAllHref || ''}
              onChange={(e) => updateField('viewAllHref', e.target.value || null)}
              className="form-input"
              placeholder={
                config.collection 
                  ? `/collections/${config.collection}` 
                  : '/shop'
              }
            />
            {config.collection && (
              <button
                type="button"
                onClick={() => updateField('viewAllHref', `/collections/${config.collection}`)}
                className="auto-fill-btn"
                title="Auto-fill with collection link"
              >
                Auto-fill
              </button>
            )}
          </div>
          <p className="form-hint">
            {config.collection 
              ? `Suggested: /collections/${config.collection} (links to this collection's page)` 
              : 'Suggested: /shop (links to main shop page). Leave empty to hide button.'}
          </p>
        </div>
      </>
    );
  }

  // HERO CAROUSEL FORM (Category Carousel)
  if (type === 'hero_carousel') {
    return (
      <div className="custom-component-notice">
        <div className="notice-icon">ℹ️</div>
        <div className="notice-content">
          <h4>Custom Component by unenter</h4>
          <p>
            This section displays a carousel of category images. It's a custom-built component 
            that automatically pulls category images from your database.
          </p>
          <p className="notice-hint">
            No configuration needed - the component handles everything automatically.
          </p>
        </div>
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
