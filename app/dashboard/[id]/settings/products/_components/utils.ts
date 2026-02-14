// Shared utility functions used by both create and manage flows
// Location: app/dashboard/[id]/settings/products/_components/shared-utils.ts

// Money conversion utilities
export function centsToMoney(cents: number, currency: string = "USD") {
  const amt = (cents ?? 0) / 100;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amt);
  } catch {
    return `$${amt.toFixed(2)}`;
  }
}

export function moneyToCents(value: string) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

// Slug generation
export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Safe JSON parsing
export async function safeReadJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, error: { code: "NON_JSON_RESPONSE", message: text.slice(0, 300) } };
  }
}

// File extension utilities
export function fileExt(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "jpg";
}

export function safeExtFromFile(file: File) {
  const type = (file.type || "").toLowerCase();
  if (type.includes("jpeg")) return "jpg";
  if (type.includes("jpg")) return "jpg";
  if (type.includes("png")) return "png";
  if (type.includes("webp")) return "webp";
  if (type.includes("gif")) return "gif";
  if (type.includes("avif")) return "avif";
  if (type.includes("heic") || type.includes("heif")) return "heic";

  const name = file.name || "";
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "jpg";
}

// Object path builder for Supabase storage
export function buildObjectPath(productId: string, index1Based: number, ext: string) {
  return `products/${productId}/${index1Based}.${ext}`;
}

// Random ID generators
export function randId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export function generateId() {
  return Math.random().toString(36).substring(7);
}