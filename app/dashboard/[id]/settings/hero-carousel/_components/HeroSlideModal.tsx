'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
        width: imageDimensions?.width || null,
        height: imageDimensions?.height || null,
      };

      if (mode === 'create') {
        // Get max position
        const { data: maxData } = await supabase
          .from('hero_slides')
          .select('position')
          .order('position', { ascending: false })
          .limit(1);

        const { error: insertError } = await supabase
          .from('hero_slides')
          .insert({
            ...payload,
            position: (maxData?.[0]?.position ?? -1) + 1,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="relative w-full max-w-3xl rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-lg my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-6">
          <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
            {mode === 'create' ? 'Add New Hero Slide' : 'Edit Hero Slide'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className={`rounded-lg border p-4 ${
              error.startsWith('⚠️')
                ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-500/20 dark:bg-yellow-500/10'
                : 'border-[hsl(var(--destructive))] bg-[hsl(var(--destructive))]/10'
            }`}>
              <p className={`text-sm ${
                error.startsWith('⚠️')
                  ? 'text-yellow-800 dark:text-yellow-200'
                  : 'text-[hsl(var(--destructive))]'
              }`}>
                {error}
              </p>
            </div>
          )}

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[hsl(var(--foreground))]">
              Hero Image *
            </label>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Recommended: {RECOMMENDED_WIDTH}×{RECOMMENDED_HEIGHT}px • Max 10MB
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative aspect-[21/9] overflow-hidden rounded-lg border border-[hsl(var(--border))]">
                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Change Image
                  </Button>
                </div>
                {imageDimensions && (
                  <div className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white backdrop-blur-sm">
                    {imageDimensions.width} × {imageDimensions.height}px
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-12 transition-colors hover:bg-[hsl(var(--muted))]/50"
              >
                <ImageIcon className="h-12 w-12 text-[hsl(var(--muted-foreground))]" />
                <div className="text-center">
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                    Click to upload image
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    PNG, JPG, WEBP up to 10MB
                  </p>
                </div>
              </button>
            )}
          </div>

          {/* Text Overlay Section */}
          <div className="space-y-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 p-4">
            <h3 className="font-semibold text-[hsl(var(--foreground))]">Text Overlay</h3>

            {/* Pill Text */}
            <div className="space-y-2">
              <label htmlFor="pill_text" className="block text-sm font-medium text-[hsl(var(--foreground))]">
                Pill Text (Optional)
              </label>
              <input
                id="pill_text"
                type="text"
                className="w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--ring))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]/20"
                value={formData.pill_text}
                onChange={(e) => setFormData({ ...formData, pill_text: e.target.value })}
                placeholder="Desert Cowgirl • Western-inspired"
              />
            </div>

            {/* Headline Line 1 */}
            <div className="space-y-2">
              <label htmlFor="headline_line1" className="block text-sm font-medium text-[hsl(var(--foreground))]">
                Headline Line 1 *
              </label>
              <input
                id="headline_line1"
                type="text"
                required
                className="w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--ring))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]/20"
                value={formData.headline_line1}
                onChange={(e) => setFormData({ ...formData, headline_line1: e.target.value })}
                placeholder="Where Desert Meets Style"
              />
            </div>

            {/* Headline Line 2 */}
            <div className="space-y-2">
              <label htmlFor="headline_line2" className="block text-sm font-medium text-[hsl(var(--foreground))]">
                Headline Line 2 (Optional)
              </label>
              <input
                id="headline_line2"
                type="text"
                className="w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--ring))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]/20"
                value={formData.headline_line2}
                onChange={(e) => setFormData({ ...formData, headline_line2: e.target.value })}
                placeholder="Authentic Western Fashion"
              />
            </div>

            {/* Subtext */}
            <div className="space-y-2">
              <label htmlFor="subtext" className="block text-sm font-medium text-[hsl(var(--foreground))]">
                Subtext (Optional)
              </label>
              <textarea
                id="subtext"
                rows={2}
                className="w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--ring))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]/20"
                value={formData.subtext}
                onChange={(e) => setFormData({ ...formData, subtext: e.target.value })}
                placeholder="Discover timeless pieces for the modern cowgirl"
              />
            </div>

            {/* Alt Text */}
            <div className="space-y-2">
              <label htmlFor="alt_text" className="block text-sm font-medium text-[hsl(var(--foreground))]">
                Alt Text (SEO)
              </label>
              <input
                id="alt_text"
                type="text"
                className="w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--ring))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]/20"
                value={formData.alt_text}
                onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                placeholder="Woman in western boots and denim"
              />
            </div>
          </div>

          {/* Text Styling */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[hsl(var(--foreground))]">
                Text Alignment
              </label>
              <div className="flex gap-2">
                {(['left', 'center', 'right'] as const).map((alignment) => (
                  <label
                    key={alignment}
                    className="flex flex-1 cursor-pointer items-center justify-center rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm transition-colors hover:bg-[hsl(var(--muted))]/50 has-[:checked]:border-[hsl(var(--ring))] has-[:checked]:bg-[hsl(var(--primary))]/10 has-[:checked]:text-[hsl(var(--primary))]"
                  >
                    <input
                      type="radio"
                      name="text_alignment"
                      value={alignment}
                      checked={formData.text_alignment === alignment}
                      onChange={(e) => setFormData({ ...formData, text_alignment: e.target.value as any })}
                      className="sr-only"
                    />
                    <span className="capitalize">{alignment}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[hsl(var(--foreground))]">
                Text Color
              </label>
              <div className="flex gap-2">
                {(['dark', 'light'] as const).map((color) => (
                  <label
                    key={color}
                    className="flex flex-1 cursor-pointer items-center justify-center rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm transition-colors hover:bg-[hsl(var(--muted))]/50 has-[:checked]:border-[hsl(var(--ring))] has-[:checked]:bg-[hsl(var(--primary))]/10 has-[:checked]:text-[hsl(var(--primary))]"
                  >
                    <input
                      type="radio"
                      name="text_color"
                      value={color}
                      checked={formData.text_color === color}
                      onChange={(e) => setFormData({ ...formData, text_color: e.target.value as any })}
                      className="sr-only"
                    />
                    <span className="capitalize">{color}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Call-to-Action Buttons */}
          <div className="space-y-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 p-4">
            <h3 className="font-semibold text-[hsl(var(--foreground))]">Call-to-Action Buttons</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="primary_button_label" className="block text-sm font-medium text-[hsl(var(--foreground))]">
                  Primary Button Label *
                </label>
                <input
                  id="primary_button_label"
                  type="text"
                  required
                  className="w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:border-[hsl(var(--ring))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]/20"
                  value={formData.primary_button_label}
                  onChange={(e) => setFormData({ ...formData, primary_button_label: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="primary_button_href" className="block text-sm font-medium text-[hsl(var(--foreground))]">
                  Primary Button Link *
                </label>
                <input
                  id="primary_button_href"
                  type="text"
                  required
                  className="w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:border-[hsl(var(--ring))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]/20"
                  value={formData.primary_button_href}
                  onChange={(e) => setFormData({ ...formData, primary_button_href: e.target.value })}
                  placeholder="/shop"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="secondary_button_label" className="block text-sm font-medium text-[hsl(var(--foreground))]">
                  Secondary Button Label (Optional)
                </label>
                <input
                  id="secondary_button_label"
                  type="text"
                  className="w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:border-[hsl(var(--ring))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]/20"
                  value={formData.secondary_button_label}
                  onChange={(e) => setFormData({ ...formData, secondary_button_label: e.target.value })}
                  placeholder="New Releases"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="secondary_button_href" className="block text-sm font-medium text-[hsl(var(--foreground))]">
                  Secondary Button Link
                </label>
                <input
                  id="secondary_button_href"
                  type="text"
                  className="w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:border-[hsl(var(--ring))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]/20"
                  value={formData.secondary_button_href}
                  onChange={(e) => setFormData({ ...formData, secondary_button_href: e.target.value })}
                  placeholder="/collections/new-releases"
                  disabled={!formData.secondary_button_label}
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-[hsl(var(--input))] text-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--ring))]/20"
            />
            <span className="text-sm font-medium text-[hsl(var(--foreground))]">
              Active (visible in carousel)
            </span>
          </label>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[hsl(var(--border))] p-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={uploading}>
            {uploading ? 'Uploading...' : mode === 'create' ? 'Create Slide' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}