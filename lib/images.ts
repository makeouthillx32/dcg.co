/**
 * Central image helpers for Supabase Storage + Next image optimization
 *
 * Your DB stores:
 * - bucket_name
 * - object_path
 *
 * We build public:
 *   {base}/storage/v1/object/public/{bucket_name}/{object_path}
 *
 * And optionally build an optimized URL via Next:
 *   /_next/image?url=<encoded-public-url>&w=<width>&q=<quality>
 *
 * Base priority:
 * 1) NEXT_PUBLIC_SUPABASE_URL (classic)
 * 2) SUPABASE_S3_ENDPOINT (derive base by removing /storage/v1/s3)
 */

export type DbImage = {
  bucket_name: string | null;
  object_path: string | null;
  alt_text?: string | null;
  sort_order?: number | null;
  position?: number | null;
  is_primary?: boolean | null;
  is_public?: boolean | null;
};

export type ImagePickOptions = {
  /** if true, return a Next-optimized URL (/_next/image?...) */
  optimized?: boolean;
  /** width used by Next optimizer */
  width?: number;
  /** quality used by Next optimizer (1-100) */
  quality?: number;
};

function deriveStorageBaseFromS3Endpoint(s3?: string | null) {
  if (!s3) return "";
  // example: https://xxxx.storage.supabase.co/storage/v1/s3
  return s3.replace(/\/storage\/v1\/s3\/?$/, "");
}

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL ??
  "";

const STORAGE_BASE =
  SUPABASE_URL || deriveStorageBaseFromS3Endpoint(process.env.SUPABASE_S3_ENDPOINT ?? "");

if (!STORAGE_BASE) {
  console.warn(
    "⚠️ No Supabase base URL found. Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_S3_ENDPOINT."
  );
}

/** Build a public URL for a DB image row */
export function supabasePublicUrlFromImage(img?: DbImage | null): string | null {
  if (!img?.bucket_name || !img?.object_path) return null;
  if (!STORAGE_BASE) return null;

  return `${STORAGE_BASE}/storage/v1/object/public/${img.bucket_name}/${img.object_path}`;
}

/**
 * Choose the primary image:
 * - prefer is_primary=true
 * - else lowest sort_order
 * - else lowest position
 */
export function pickPrimaryImage(images?: DbImage[] | null): DbImage | null {
  if (!images?.length) return null;

  const publicOnly = images.filter((i) => i && (i.is_public ?? true));
  const arr = publicOnly.length ? publicOnly : images;

  const primary = arr.find((i) => i?.is_primary);
  if (primary) return primary;

  const bySort = [...arr].sort((a, b) => {
    const as = a?.sort_order ?? 999999;
    const bs = b?.sort_order ?? 999999;
    if (as !== bs) return as - bs;

    const ap = a?.position ?? 999999;
    const bp = b?.position ?? 999999;
    return ap - bp;
  });

  return bySort[0] ?? null;
}

/**
 * Build a Next.js optimized image URL from any absolute public URL.
 * This forces the browser to download the optimized asset (usually webp/avif).
 */
export function toNextOptimizedImageUrl(
  absoluteUrl: string,
  opts?: { width?: number; quality?: number }
): string {
  const w = Math.max(16, Math.min(4096, Number(opts?.width ?? 800)));
  const q = Math.max(1, Math.min(100, Number(opts?.quality ?? 80)));

  // IMPORTANT: this is a *relative* path so it works in any env (localhost/vercel)
  const encoded = encodeURIComponent(absoluteUrl);
  return `/_next/image?url=${encoded}&w=${w}&q=${q}`;
}

/**
 * Returns:
 * - public url by default
 * - OR Next optimized url if options.optimized = true
 *
 * IMPORTANT: returns null if missing. No fake placeholder path.
 */
export function getPrimaryImageUrl(
  images?: DbImage[] | null,
  options?: ImagePickOptions
): string | null {
  const img = pickPrimaryImage(images);
  const publicUrl = supabasePublicUrlFromImage(img);
  if (!publicUrl) return null;

  if (options?.optimized) {
    return toNextOptimizedImageUrl(publicUrl, {
      width: options.width,
      quality: options.quality,
    });
  }

  return publicUrl;
}