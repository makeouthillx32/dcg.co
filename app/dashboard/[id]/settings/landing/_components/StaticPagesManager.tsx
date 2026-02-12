'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LoadingState } from './LoadingState';
import { ErrorAlert } from './ErrorAlert';

type StaticPage = {
  id: string;
  slug: string;
  title: string;
  content: string;
  content_format: 'html' | 'markdown';
  meta_description: string | null;
  meta_keywords: string[] | null;
  is_published: boolean;
  published_at: string | null;
  version: number;
  created_at: string;
  updated_at: string;
};

const PAGE_CONFIGS = [
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    icon: '🔒',
    description: 'How we collect and use customer information',
  },
  {
    slug: 'terms-and-conditions',
    title: 'Terms & Conditions',
    icon: '📜',
    description: 'Rules and agreements for using the store',
  },
  {
    slug: 'about-us',
    title: 'About Us',
    icon: '✨',
    description: 'Your brand story and mission',
  },
];

export function StaticPagesManager() {
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<StaticPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    meta_description: '',
    is_published: true,
  });

  const supabase = createClient();

  useEffect(() => {
    fetchPages();
  }, []);

  async function fetchPages() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('static_pages')
        .select('*')
        .order('slug', { ascending: true });

      if (error) throw error;
      setPages(data || []);

      // Auto-select first page
      if (data && data.length > 0) {
        selectPage(data[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function selectPage(page: StaticPage) {
    setSelectedPage(page);
    setEditForm({
      title: page.title,
      content: page.content,
      meta_description: page.meta_description || '',
      is_published: page.is_published,
    });
  }

  async function handleSave() {
    if (!selectedPage) return;

    try {
      setSaving(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('static_pages')
        .update({
          title: editForm.title,
          content: editForm.content,
          meta_description: editForm.meta_description || null,
          is_published: editForm.is_published,
          version: selectedPage.version + 1,
          published_at: editForm.is_published ? new Date().toISOString() : null,
        })
        .eq('id', selectedPage.id);

      if (updateError) throw updateError;

      setSuccessMessage('Page saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);

      await fetchPages();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function getPageConfig(slug: string) {
    return PAGE_CONFIGS.find((p) => p.slug === slug);
  }

  if (loading) return <LoadingState />;

  return (
    <div className="static-pages-manager">
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      {successMessage && (
        <div className="alert alert--success">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {successMessage}
        </div>
      )}

      <div className="static-pages-manager__layout">
        {/* Sidebar - Page List */}
        <aside className="static-pages-manager__sidebar">
          <h3 className="static-pages-manager__sidebar-title">Pages</h3>

          <div className="static-pages-manager__page-list">
            {pages.map((page) => {
              const config = getPageConfig(page.slug);
              return (
                <button
                  key={page.id}
                  className={`page-list-item ${selectedPage?.id === page.id ? 'active' : ''}`}
                  onClick={() => selectPage(page)}
                >
                  <div className="page-list-item__icon">{config?.icon || '📄'}</div>
                  <div className="page-list-item__content">
                    <div className="page-list-item__title">{page.title}</div>
                    <div className="page-list-item__meta">
                      {page.is_published ? (
                        <span className="badge badge--success badge--sm">Published</span>
                      ) : (
                        <span className="badge badge--warning badge--sm">Draft</span>
                      )}
                      <span className="page-list-item__version">v{page.version}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {pages.length === 0 && (
            <div className="static-pages-manager__sidebar-empty">
              <p>No pages found. Run the migration to create default pages.</p>
            </div>
          )}
        </aside>

        {/* Main Editor */}
        <main className="static-pages-manager__editor">
          {selectedPage ? (
            <>
              <div className="static-pages-manager__header">
                <div>
                  <h2 className="static-pages-manager__page-title">
                    {getPageConfig(selectedPage.slug)?.icon} {editForm.title}
                  </h2>
                  <p className="static-pages-manager__page-description">
                    {getPageConfig(selectedPage.slug)?.description}
                  </p>
                </div>

                <div className="static-pages-manager__actions">
                  <a
                    href={`/${selectedPage.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--secondary btn--sm"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    Preview
                  </a>

                  <button
                    className="btn btn--primary btn--sm"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="page-title">
                  Page Title
                </label>
                <input
                  id="page-title"
                  type="text"
                  className="form-input"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="page-content">
                  Content
                  <span className="form-hint">HTML or Markdown supported</span>
                </label>
                <textarea
                  id="page-content"
                  className="form-textarea form-textarea--large"
                  rows={20}
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  placeholder="Enter your page content here..."
                  style={{ fontFamily: 'monospace', fontSize: '14px' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="meta-description">
                  Meta Description (SEO)
                  <span className="form-hint">Brief description for search engines (max 160 chars)</span>
                </label>
                <textarea
                  id="meta-description"
                  className="form-textarea"
                  rows={2}
                  maxLength={160}
                  value={editForm.meta_description}
                  onChange={(e) => setEditForm({ ...editForm, meta_description: e.target.value })}
                  placeholder="A short description of this page..."
                />
                <div className="form-hint" style={{ textAlign: 'right' }}>
                  {editForm.meta_description.length} / 160
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editForm.is_published}
                    onChange={(e) =>
                      setEditForm({ ...editForm, is_published: e.target.checked })
                    }
                  />
                  <span>Published (visible to visitors)</span>
                </label>
              </div>

              <div className="static-pages-manager__metadata">
                <div className="metadata-item">
                  <span className="metadata-item__label">Slug:</span>
                  <code className="metadata-item__value">/{selectedPage.slug}</code>
                </div>
                <div className="metadata-item">
                  <span className="metadata-item__label">Version:</span>
                  <span className="metadata-item__value">v{selectedPage.version}</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-item__label">Last updated:</span>
                  <span className="metadata-item__value">
                    {new Date(selectedPage.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="static-pages-manager__empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <h3>No page selected</h3>
              <p>Select a page from the sidebar to begin editing</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}