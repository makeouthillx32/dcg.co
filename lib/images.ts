/**
 * Central image helpers for Supabase Storage
 *
 * Assumptions:
 * - Images are stored in Supabase Storage
 * - You store `storage_path` in the DB (NOT full URLs)
 *   example: "products/abc123/main.jpg"
 */

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL ??
  "";

if (!SUPABASE_URL) {
  console.warn("⚠️ NEXT_PUBLIC_SUPABASE_URL is not set");
}

/**
 * CHANGE THIS to your actual bucket name
 * Common values:
 * - "public"
 * - "product-images"
 * - "images"
 */
export const PRODUCT_IMAGE_BUCKET = "product-images";

/**
 * Build a public Supabase Storage URL from a storage path
 *
 * @example
 * storagePathToUrl("products/123/main.jpg")
 * → https://xyz.supabase.co/storage/v1/object/public/product-images/products/123/main.jpg
 */
export function storagePathToUrl(storagePath?: string | null): string | null {
  if (!storagePath) return null;
  if (!SUPABASE_URL) return null;

  return `${SUPABASE_URL}/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/${storagePath}`;
}

/**
 * Returns the first image URL (or fallback)
 */
export function getPrimaryImageUrl(
  images: { storage_path: string }[] | null | undefined,
  fallback: string = "/images/placeholder.png"
): string {
  if (!images || images.length === 0) return fallback;

  const url = storagePathToUrl(images[0].storage_path);
  return url ?? fallback;
}
