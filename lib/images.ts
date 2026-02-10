/**
 * Central image helpers for Supabase Storage
 *
 * Your DB stores:
 * - bucket_name
 * - object_path
 *
 * We build:
 *   {base}/storage/v1/object/public/{bucket_name}/{object_path}
 *
 * Base priority:
 * 1) NEXT_PUBLIC_SUPABASE_URL (classic)
 * 2) SUPABASE_S3_ENDPOINT (derive base by removing /storage/v1/s3)
 */

type DbImage = {
  bucket_name: string | null;
  object_path: string | null;
  alt_text?: string | null;
  sort_order?: number | null;
  position?: number | null;
  is_primary?: boolean | null;
  is_public?: boolean | null;
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

/**
 * Build a public URL for a DB image row
 */
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
    const as = a.sort_order ?? 999999;
    const bs = b.sort_order ?? 999999;
    if (as !== bs) return as - bs;

    const ap = a.position ?? 999999;
    const bp = b.position ?? 999999;
    return ap - bp;
  });

  return bySort[0] ?? null;
}

/**
 * Returns a URL or null.
 * IMPORTANT: returns null if missing. No fake placeholder path.
 */
export function getPrimaryImageUrl(images?: DbImage[] | null): string | null {
  const img = pickPrimaryImage(images);
  return supabasePublicUrlFromImage(img);
}
