'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';

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
};

type Props = {
  mode: 'create' | 'edit';
  slide?: HeroSlide;
  onClose: () => void;
  onSuccess: () => void;
};

const RECOMMENDED_WIDTH = 2880;
const RECOMMENDED_HEIGHT = 1050;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function HeroSlideModal({ mode, slide, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    pill_text: slide?.pill_text || '',
    headline_line1: slide?.headline_line1 || '',
    headline_line2: slide?.headline_line2 || '',
    subtext: slide?.subtext || '',
    primary_button_label: slide?.primary_button_label || 'Shop Now',
    primary_button_href: slide?.primary_button_href || '/shop',
    secondary_button_label: slide?.secondary_button_label || '',
    secondary_button_href: slide?.secondary_button_href || '',
    alt_text: slide?.alt_text || '',
    text_alignment: slide?.text_alignment || 'left' as const,
    text_color: slide?.text_color || 'dark' as const,
    is_active: slide?.is_active ?? true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    slide ? null : null // We'll fetch the URL if editing
  );
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('Image must be smaller than 10MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });

        // Warn if dimensions don't match recommended size
        if (img.width !== RECOMMENDED_WIDTH || img.height !== RECOMMENDED_HEIGHT) {
          setError(
            `⚠️ Recommended size is ${RECOMMENDED_WIDTH}×${RECOMMENDED_HEIGHT}px. Your image is ${img.width}×${img.height}px.`
          );
        } else {
          setError(null);
        }
      };
      img.src = e.target?.result as string;
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setImageFile(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);
    setError(null);

    try {
      let objectPath = slide?.object_path || '';

      // Upload new image if file was selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `slide-${Date.now()}.${fileExt}`;
        const filePath = `slides/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('hero-images')
          .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;
        objectPath = filePath;

        // If editing, delete old image
        if (mode === 'edit' && slide?.object_path) {
          await supabase.storage
            .from('hero-images')
            .remove([slide.object_path]);
        }
      } else if (mode === 'create') {
        throw new Error('Please select an image');
      }

      // Prepare database payload
      const payload = {
        bucket_name: 'hero-images',
        object_path: objectPath,
        alt_text: formData.alt_text || null,
        pill_text: formData.pill_text || null,
        headline_line1: formData.headline_line1,
        headline_line2: formData.headline_line2 || null,
        subtext: formData.subtext || null,
        primary_button_label: formData.primary_button_label,
        primary_button_href: formData.primary_button_href,
        secondary_button_label: formData.secondary_button_label || null,
        secondary_button_href: formData.secondary_button_href || null,
        text_alignment: formData.text_alignment,
        text_color: formData.text_color,
        is_active: formData.is_active,
        width: imageDimensions?.width || RECOMMENDED_WIDTH,
        height: imageDimensions?.height || RECOMMENDED_HEIGHT,
      };

      if (mode === 'create') {
        // Get next position
        const { data: maxPos } = await supabase
          .from('hero_slides')
          .select('position')
          .order('position', { ascending: false })
          .limit(1)
          .single();

        const { error: insertError } = await supabase
          .from('hero_slides')
          .insert({
            ...payload,
            position: (maxPos?.position ?? -1) + 1,
          });

        if (insertError) throw insertError;
      } else {
        const { error: updateError } = await supabase
          .from('hero_slides')
          .update(payload)
          .eq('id', slide!.id);

        if (updateError) throw updateError;
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--large" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>{mode === 'create' ? 'Add New Hero Slide' : 'Edit Hero Slide'}</h2>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal__body">
          {error && (
            <div className={`alert ${error.startsWith('⚠️') ? 'alert--warning' : 'alert--error'}`}>
              {error}
            </div>
          )}

          {/* Image Upload */}
          <div className="form-group">
            <label className="form-label">
              Hero Image *
              <span className="form-hint">
                Recommended: {RECOMMENDED_WIDTH}×{RECOMMENDED_HEIGHT}px (2880×1050px) • Max 10MB
              </span>
            </label>

            <div className="image-uploader">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="image-uploader__input"
              />

              {imagePreview ? (
                <div className="image-uploader__preview">
                  <img src={imagePreview} alt="Preview" />
                  <div className="image-uploader__overlay">
                    <button
                      type="button"
                      className="btn btn--secondary btn--sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change Image
                    </button>
                  </div>
                  {imageDimensions && (
                    <div className="image-uploader__dimensions">
                      {imageDimensions.width} × {imageDimensions.height}px
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  className="image-uploader__placeholder"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>Click to upload hero image</span>
                  <span className="image-uploader__hint">PNG, JPG, WebP • 2880×1050px recommended</span>
                </button>
              )}
            </div>
          </div>

          {/* Alt Text */}
          <div className="form-group">
            <label className="form-label" htmlFor="alt_text">
              Alt Text
              <span className="form-hint">Accessibility description of the image</span>
            </label>
            <input
              id="alt_text"
              type="text"
              className="form-input"
              value={formData.alt_text}
              onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
              placeholder="e.g., Western boots on desert sand"
            />
          </div>

          {/* Text Content Section */}
          <div className="form-section">
            <h3 className="form-section__title">Text Overlay</h3>

            <div className="form-group">
              <label className="form-label" htmlFor="pill_text">
                Pill Text (Optional)
                <span className="form-hint">Small eyebrow text above headline</span>
              </label>
              <input
                id="pill_text"
                type="text"
                className="form-input"
                value={formData.pill_text}
                onChange={(e) => setFormData({ ...formData, pill_text: e.target.value })}
                placeholder="e.g., Desert Cowgirl • Western-inspired"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="headline_line1">
                Headline Line 1 *
              </label>
              <input
                id="headline_line1"
                type="text"
                className="form-input"
                value={formData.headline_line1}
                onChange={(e) => setFormData({ ...formData, headline_line1: e.target.value })}
                placeholder="e.g., Wear the desert."
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="headline_line2">
                Headline Line 2 (Optional)
              </label>
              <input
                id="headline_line2"
                type="text"
                className="form-input"
                value={formData.headline_line2}
                onChange={(e) => setFormData({ ...formData, headline_line2: e.target.value })}
                placeholder="e.g., Keep it classic."
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="subtext">
                Subtext (Optional)
              </label>
              <textarea
                id="subtext"
                className="form-textarea"
                rows={2}
                value={formData.subtext}
                onChange={(e) => setFormData({ ...formData, subtext: e.target.value })}
                placeholder="e.g., Curated Western-inspired pieces for modern living"
              />
            </div>
          </div>

          {/* Text Styling */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Text Alignment</label>
              <div className="radio-group">
                {(['left', 'center', 'right'] as const).map((alignment) => (
                  <label key={alignment} className="radio-label">
                    <input
                      type="radio"
                      name="text_alignment"
                      value={alignment}
                      checked={formData.text_alignment === alignment}
                      onChange={(e) =>
                        setFormData({ ...formData, text_alignment: e.target.value as any })
                      }
                    />
                    <span className="radio-label__text">{alignment}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Text Color</label>
              <div className="radio-group">
                {(['dark', 'light'] as const).map((color) => (
                  <label key={color} className="radio-label">
                    <input
                      type="radio"
                      name="text_color"
                      value={color}
                      checked={formData.text_color === color}
                      onChange={(e) =>
                        setFormData({ ...formData, text_color: e.target.value as any })
                      }
                    />
                    <span className="radio-label__text">{color}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Call-to-Action Buttons */}
          <div className="form-section">
            <h3 className="form-section__title">Call-to-Action Buttons</h3>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="primary_button_label">
                  Primary Button Label *
                </label>
                <input
                  id="primary_button_label"
                  type="text"
                  className="form-input"
                  value={formData.primary_button_label}
                  onChange={(e) =>
                    setFormData({ ...formData, primary_button_label: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="primary_button_href">
                  Primary Button Link *
                </label>
                <input
                  id="primary_button_href"
                  type="text"
                  className="form-input"
                  value={formData.primary_button_href}
                  onChange={(e) =>
                    setFormData({ ...formData, primary_button_href: e.target.value })
                  }
                  placeholder="/shop"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="secondary_button_label">
                  Secondary Button Label (Optional)
                </label>
                <input
                  id="secondary_button_label"
                  type="text"
                  className="form-input"
                  value={formData.secondary_button_label}
                  onChange={(e) =>
                    setFormData({ ...formData, secondary_button_label: e.target.value })
                  }
                  placeholder="New Releases"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="secondary_button_href">
                  Secondary Button Link
                </label>
                <input
                  id="secondary_button_href"
                  type="text"
                  className="form-input"
                  value={formData.secondary_button_href}
                  onChange={(e) =>
                    setFormData({ ...formData, secondary_button_href: e.target.value })
                  }
                  placeholder="/collections/new-releases"
                  disabled={!formData.secondary_button_label}
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <span>Active (visible in carousel)</span>
            </label>
          </div>

          {/* Actions */}
          <div className="modal__footer">
            <button type="button" className="btn btn--secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={uploading}>
              {uploading ? 'Uploading...' : mode === 'create' ? 'Create Slide' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}