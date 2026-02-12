'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { HeroSlideModal } from './HeroSlideModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { LoadingState } from './LoadingState';
import { ErrorAlert } from './ErrorAlert';

type HeroSlide = {
  id: string;
  bucket_name: string;
  object_path: string;
  alt_text: string | null;
  pill_text: string | null;
  headline_line1: string;
  headline_line2: string | null;
  subtext: string | null;
  primary_button_label: string;
  primary_button_href: string;
  secondary_button_label: string | null;
  secondary_button_href: string | null;
  text_alignment: 'left' | 'center' | 'right';
  text_color: 'dark' | 'light';
  position: number;
  is_active: boolean;
  blurhash: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
  updated_at: string;
};

export function HeroCarouselManager() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlide, setSelectedSlide] = useState<HeroSlide | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [draggedSlide, setDraggedSlide] = useState<HeroSlide | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchSlides();
  }, []);

  async function fetchSlides() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;
      setSlides(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleActive(slide: HeroSlide) {
    try {
      const { error } = await supabase
        .from('hero_slides')
        .update({ is_active: !slide.is_active })
        .eq('id', slide.id);

      if (error) throw error;
      await fetchSlides();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete() {
    if (!selectedSlide) return;

    try {
      // Delete image from storage
      const { error: storageError } = await supabase.storage
        .from(selectedSlide.bucket_name)
        .remove([selectedSlide.object_path]);

      if (storageError) throw storageError;

      // Delete database record
      const { error: dbError } = await supabase
        .from('hero_slides')
        .delete()
        .eq('id', selectedSlide.id);

      if (dbError) throw dbError;

      setIsDeleteModalOpen(false);
      setSelectedSlide(null);
      await fetchSlides();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleReorder(newOrder: HeroSlide[]) {
    try {
      // Update positions in database
      const updates = newOrder.map((slide, index) => ({
        id: slide.id,
        position: index,
      }));

      for (const update of updates) {
        await supabase
          .from('hero_slides')
          .update({ position: update.position })
          .eq('id', update.id);
      }

      await fetchSlides();
    } catch (err: any) {
      setError(err.message);
    }
  }

  function handleDragStart(slide: HeroSlide) {
    setDraggedSlide(slide);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(targetSlide: HeroSlide) {
    if (!draggedSlide || draggedSlide.id === targetSlide.id) return;

    const newSlides = [...slides];
    const draggedIndex = newSlides.findIndex(s => s.id === draggedSlide.id);
    const targetIndex = newSlides.findIndex(s => s.id === targetSlide.id);

    // Remove dragged item
    const [removed] = newSlides.splice(draggedIndex, 1);
    // Insert at target position
    newSlides.splice(targetIndex, 0, removed);

    handleReorder(newSlides);
    setDraggedSlide(null);
  }

  function getImageUrl(slide: HeroSlide): string {
    const { data } = supabase.storage
      .from(slide.bucket_name)
      .getPublicUrl(slide.object_path);
    return data.publicUrl;
  }

  if (loading) return <LoadingState />;

  return (
    <div className="hero-carousel-manager">
      {/* Action Bar */}
      <div className="hero-carousel-manager__actions">
        <button
          className="btn btn--primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add New Slide
        </button>

        <div className="hero-carousel-manager__info">
          <span className="badge">{slides.length} total slides</span>
          <span className="badge badge--success">
            {slides.filter(s => s.is_active).length} active
          </span>
        </div>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      {/* Slides Grid */}
      {slides.length === 0 ? (
        <div className="hero-carousel-manager__empty">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
          <h3>No hero slides yet</h3>
          <p>Create your first hero slide to get started with the carousel</p>
          <button
            className="btn btn--primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Add First Slide
          </button>
        </div>
      ) : (
        <div className="hero-carousel-manager__grid">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className={`hero-slide-card ${!slide.is_active ? 'hero-slide-card--inactive' : ''}`}
              draggable
              onDragStart={() => handleDragStart(slide)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(slide)}
            >
              {/* Drag Handle */}
              <div className="hero-slide-card__drag-handle">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="9" cy="5" r="1" />
                  <circle cx="9" cy="12" r="1" />
                  <circle cx="9" cy="19" r="1" />
                  <circle cx="15" cy="5" r="1" />
                  <circle cx="15" cy="12" r="1" />
                  <circle cx="15" cy="19" r="1" />
                </svg>
              </div>

              {/* Image Preview */}
              <div className="hero-slide-card__image">
                <img src={getImageUrl(slide)} alt={slide.alt_text || ''} />
                {!slide.is_active && (
                  <div className="hero-slide-card__inactive-badge">Inactive</div>
                )}
              </div>

              {/* Content */}
              <div className="hero-slide-card__content">
                <div className="hero-slide-card__position">#{slide.position + 1}</div>
                {slide.pill_text && (
                  <div className="hero-slide-card__pill">{slide.pill_text}</div>
                )}
                <h3 className="hero-slide-card__headline">{slide.headline_line1}</h3>
                {slide.headline_line2 && (
                  <h4 className="hero-slide-card__subheadline">{slide.headline_line2}</h4>
                )}
                {slide.subtext && <p className="hero-slide-card__subtext">{slide.subtext}</p>}

                {/* Metadata */}
                <div className="hero-slide-card__meta">
                  <span className={`badge badge--${slide.text_alignment}`}>
                    {slide.text_alignment}
                  </span>
                  <span className={`badge badge--${slide.text_color}`}>
                    {slide.text_color} text
                  </span>
                  {slide.width && slide.height && (
                    <span className="badge">{slide.width}×{slide.height}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="hero-slide-card__actions">
                <button
                  className="btn btn--icon"
                  onClick={() => handleToggleActive(slide)}
                  title={slide.is_active ? 'Deactivate' : 'Activate'}
                >
                  {slide.is_active ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>

                <button
                  className="btn btn--icon"
                  onClick={() => {
                    setSelectedSlide(slide);
                    setIsEditModalOpen(true);
                  }}
                  title="Edit slide"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>

                <button
                  className="btn btn--icon btn--danger"
                  onClick={() => {
                    setSelectedSlide(slide);
                    setIsDeleteModalOpen(true);
                  }}
                  title="Delete slide"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {isCreateModalOpen && (
        <HeroSlideModal
          mode="create"
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchSlides();
          }}
        />
      )}

      {isEditModalOpen && selectedSlide && (
        <HeroSlideModal
          mode="edit"
          slide={selectedSlide}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedSlide(null);
          }}
          onSuccess={() => {
            setIsEditModalOpen(false);
            setSelectedSlide(null);
            fetchSlides();
          }}
        />
      )}

      {isDeleteModalOpen && selectedSlide && (
        <DeleteConfirmModal
          title="Delete Hero Slide"
          message={`Are you sure you want to delete the slide "${selectedSlide.headline_line1}"? This action cannot be undone and will also delete the image from storage.`}
          onConfirm={handleDelete}
          onCancel={() => {
            setIsDeleteModalOpen(false);
            setSelectedSlide(null);
          }}
        />
      )}
    </div>
  );
}