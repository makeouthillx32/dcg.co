// app/products/[slug]/page.tsx
//
// ✅ VERIFIED against descowgrl Supabase (efglhzzageijqhfwvsub)
//    - product_images.bucket_name = "product-images" (confirmed in live data)
//    - product_images.object_path = "products/{id}/{n}.webp"
//    - is_primary, sort_order, position, is_public all exist on product_images
//    - products has is_featured (not "featured")

import { createServerClient, createServiceClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetailClient from "./_components/ProductDetailClient";

// ─── Constants ────────────────────────────────────────────────────────────────

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://efglhzzageijqhfwvsub.supabase.co";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://desertcowgirl.co";

// ─── Image helpers ────────────────────────────────────────────────────────────

type RawImage = {
  bucket_name: string | null;
  object_path: string | null;
  is_primary?: boolean | null;
  is_public?: boolean | null;
  sort_order?: number | null;
  position?: number | null;
};

/** Builds a Supabase public storage URL from a product_images row. */
function buildStorageUrl(img: RawImage | null): string | null {
  if (!img?.bucket_name || !img?.object_path) return null;
  const encodedPath = img.object_path
    .split("/")
    .filter(Boolean)
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  return `${SUPABASE_URL}/storage/v1/object/public/${img.bucket_name}/${encodedPath}`;
}

/**
 * Picks the best image to use for OG/Twitter:
 *   1. is_primary = true
 *   2. lowest sort_order
 *   3. lowest position
 */
function pickPrimaryImage(images: RawImage[]): RawImage | null {
  if (!images?.length) return null;
  const pub = images.filter((i) => i.is_public ?? true);
  const arr = pub.length ? pub : images;
  const primary = arr.find((i) => i.is_primary);
  if (primary) return primary;
  return [...arr].sort((a, b) => {
    const as = a.sort_order ?? a.position ?? 999999;
    const bs = b.sort_order ?? b.position ?? 999999;
    return as - bs;
  })[0] ?? null;
}

// ─── Static params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const supabase = createServiceClient();
  const { data: products } = await supabase
    .from("products")
    .select("slug")
    .eq("status", "active");

  return products?.map((p) => ({ slug: p.slug })) ?? [];
}

// ─── Metadata + OpenGraph ─────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerClient();

  const { data: product } = await supabase
    .from("products")
    .select(`
      title,
      slug,
      description,
      price_cents,
      badge,
      product_images (
        bucket_name,
        object_path,
        is_primary,
        is_public,
        sort_order,
        position
      )
    `)
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (!product) {
    return { title: "Product Not Found" };
  }

  const title = product.title;
  const ogTitle = `${title} | Desert Cowgirl`;
  const description =
    product.description?.slice(0, 155) ??
    `Shop ${title} at Desert Cowgirl — western-inspired boutique fashion.`;
  const url = `${SITE_URL}/products/${slug}`;

  // Pull the primary product image as the og:image / twitter:image
  // next/og's opengraph-image.tsx generates the branded card automatically.
  // This raw URL is a supplemental fallback for platforms that don't render dynamic OG images.
  const primaryImg = pickPrimaryImage(product.product_images ?? []);
  const rawImageUrl = buildStorageUrl(primaryImg);

  return {
    title,
    description,
    openGraph: {
      title: ogTitle,
      description,
      url,
      siteName: "Desert Cowgirl",
      type: "website",
      ...(rawImageUrl && {
        images: [
          {
            url: rawImageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      ...(rawImageUrl && { images: [rawImageUrl] }),
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createServerClient();

  const { data: product, error } = await supabase
    .from("products")
    .select(`
      id,
      title,
      slug,
      description,
      status,
      brand,
      is_featured,
      badge,
      price_cents,
      compare_at_price_cents,
      currency,
      material,
      made_in,
      created_at,
      updated_at,
      product_images (
        id,
        bucket_name,
        object_path,
        alt_text,
        sort_order,
        position,
        is_primary,
        is_public
      ),
      product_variants (
        id,
        sku,
        title,
        options,
        price_cents,
        compare_at_price_cents,
        inventory_qty,
        weight_grams,
        position,
        is_active
      ),
      product_categories (
        categories (
          id,
          name,
          slug
        )
      )
    `)
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error) {
    console.error("Error fetching product:", error);
    notFound();
  }

  if (!product) {
    notFound();
  }

  const formattedProduct = {
    ...product,
    // Sort images by sort_order, then position
    images: (product.product_images || []).sort(
      (a: any, b: any) =>
        (a.sort_order ?? a.position ?? 0) - (b.sort_order ?? b.position ?? 0)
    ),
    variants: (product.product_variants || [])
      .filter((v: any) => v.is_active !== false)
      .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
      .map((v: any) => ({
        id: v.id,
        sku: v.sku,
        title: v.title,
        options: v.options || {},
        price_cents: v.price_cents,
        compare_at_price_cents: v.compare_at_price_cents,
        inventory_quantity: v.inventory_qty || 0,
        weight_grams: v.weight_grams,
        position: v.position,
      })),
    categories: (product.product_categories || [])
      .map((pc: any) => pc.categories)
      .filter(Boolean),
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <ProductDetailClient product={formattedProduct} />
    </div>
  );
}

// Revalidate every hour
export const revalidate = 3600;