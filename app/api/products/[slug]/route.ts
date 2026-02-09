import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";

type Params = {
  params: { slug: string };
};

/**
 * GET /api/products/[slug]
 * Public product detail (active products only)
 *
 * Optional query:
 *  - include=inventory  -> includes variant inventory fields (if present in schema)
 */
export async function GET(req: NextRequest, { params }: Params) {
  const supabase = createServerClient();

  const slug = params.slug;
  if (!slug) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "INVALID_SLUG", message: "Missing slug" },
      },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(req.url);
  const include = searchParams.get("include");
  const includeInventory = include === "inventory";

  // Base select (safe for storefront)
  // Note: we keep inventory optional so we don't leak internal fields by default.
  const variantsSelect = includeInventory
    ? `
      id,
      product_id,
      title,
      sku,
      price_cents,
      compare_at_price_cents,
      position,
      inventory_enabled,
      stock_on_hand,
      low_stock_threshold,
      created_at
    `
    : `
      id,
      product_id,
      title,
      sku,
      price_cents,
      compare_at_price_cents,
      position,
      created_at
    `;

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      slug,
      title,
      description,
      price_cents,
      compare_at_price_cents,
      currency,
      badge,
      is_featured,
      seo_title,
      seo_description,
      og_image_override_url,
      created_at,
      updated_at,

      product_images (
        id,
        storage_path,
        alt,
        position,
        created_at
      ),

      product_variants (${variantsSelect}),

      product_categories (
        categories (
          id,
          slug,
          name,
          parent_id
        )
      )
    `
    )
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error) {
    // If not found, Supabase usually returns an error for .single()
    const status =
      error.code === "PGRST116" || /0 rows/i.test(error.message) ? 404 : 500;

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: status === 404 ? "NOT_FOUND" : "PRODUCT_FETCH_FAILED",
          message:
            status === 404
              ? "Product not found"
              : error.message ?? "Failed to fetch product",
        },
      },
      { status }
    );
  }

  // Normalize category shape (flatten product_categories -> categories[])
  const categories =
    data?.product_categories?.map((pc: any) => pc.categories).filter(Boolean) ??
    [];

  // Normalize images + variants order
  const images = (data?.product_images ?? []).slice().sort((a: any, b: any) => {
    const pa = typeof a.position === "number" ? a.position : 0;
    const pb = typeof b.position === "number" ? b.position : 0;
    return pa - pb;
  });

  const variants = (data?.product_variants ?? [])
    .slice()
    .sort((a: any, b: any) => {
      const pa = typeof a.position === "number" ? a.position : 0;
      const pb = typeof b.position === "number" ? b.position : 0;
      return pa - pb;
    });

  // Primary image (first by position)
  const primary_image = images.length > 0 ? images[0] : null;

  return NextResponse.json({
    ok: true,
    data: {
      ...data,
      product_images: images,
      product_variants: variants,
      categories,
      primary_image,
    },
  });
}
