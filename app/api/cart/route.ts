// app/api/cart/route.ts
import { createServerClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

type ProductImageRow = {
  id?: string;
  product_id: string;
  variant_id?: string | null;
  bucket_name: string | null;
  object_path: string | null;
  is_public?: boolean | null;
  is_primary?: boolean | null;
  position?: number | null;
};

function pickBestImage(
  images: ProductImageRow[],
  productId: string,
  variantId?: string | null
) {
  if (!images?.length) return null;

  // Prefer variant-specific images first (only matters if your schema uses variant_id)
  const variantMatches =
    variantId ? images.filter((img) => img.variant_id === variantId) : [];

  // Product-level images (no variant_id)
  const productMatches = images.filter(
    (img) => img.product_id === productId && (img.variant_id == null)
  );

  const pool = variantMatches.length ? variantMatches : productMatches;
  if (!pool.length) return null;

  // Best-first: primary first, then position
  const sorted = pool.slice().sort((a, b) => {
    const ap = a.is_primary ? 1 : 0;
    const bp = b.is_primary ? 1 : 0;
    if (bp !== ap) return bp - ap;

    const apos = a.position ?? 9999;
    const bpos = b.position ?? 9999;
    if (apos !== bpos) return apos - bpos;

    return 0;
  });

  const best = sorted[0];
  if (!best?.bucket_name || !best?.object_path) return null;
  if (best.is_public === false) return null;

  return best;
}

function publicUrlFromImage(supabase: any, img: ProductImageRow | null) {
  if (!img?.bucket_name || !img?.object_path) return null;
  const { data } = supabase.storage.from(img.bucket_name).getPublicUrl(img.object_path);
  return data?.publicUrl ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Guest session ID
    const sessionId = request.headers.get("x-session-id");

    // Auth user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: "No user or session identified" },
        { status: 400 }
      );
    }

    // Find active cart
    let cartQuery = supabase
      .from("carts")
      .select(
        `
        id,
        status,
        share_token,
        share_enabled,
        share_name,
        share_message,
        cart_items (
          id,
          product_id,
          variant_id,
          quantity,
          price_cents,
          added_note,
          products (
            id,
            title,
            slug
          ),
          product_variants (
            id,
            sku,
            title,
            options
          )
        )
      `
      )
      .eq("status", "active")
      .single();

    cartQuery = userId
      ? cartQuery.eq("user_id", userId)
      : cartQuery.eq("session_id", sessionId);

    let { data: cart, error } = await cartQuery;

    // Create cart if missing
    if (error || !cart) {
      const { data: newCart, error: createError } = await supabase
        .from("carts")
        .insert({
          user_id: userId || null,
          session_id: sessionId || null,
          status: "active",
        })
        .select()
        .single();

      if (createError) {
        console.error("Failed to create cart:", createError);
        return NextResponse.json(
          { error: "Failed to create cart" },
          { status: 500 }
        );
      }

      cart = { ...newCart, cart_items: [] };
    }

    const cartItems = cart.cart_items || [];

    // -----------------------------------------
    // ✅ Fetch product images for cart items
    // -----------------------------------------
    const productIds = Array.from(
      new Set(cartItems.map((ci: any) => ci.product_id).filter(Boolean))
    );

    const imagesByProduct: Record<string, ProductImageRow[]> = {};

    if (productIds.length) {
      const { data: images, error: imgError } = await supabase
        .from("product_images")
        .select(
          "id, product_id, variant_id, bucket_name, object_path, is_public, is_primary, position"
        )
        .in("product_id", productIds);

      if (imgError) {
        console.error("Failed to fetch product images:", imgError);
      } else {
        for (const img of images || []) {
          if (!img?.product_id) continue;
          if (!imagesByProduct[img.product_id]) imagesByProduct[img.product_id] = [];
          imagesByProduct[img.product_id].push(img as any);
        }
      }
    }

    // Format items
    const items = cartItems.map((item: any) => {
      const product = item.products;
      const variant = item.product_variants;

      const productId = item.product_id as string;
      const variantId = (item.variant_id as string | null) ?? null;

      const productImages = imagesByProduct[productId] || [];
      const best = pickBestImage(productImages, productId, variantId);
      const image_url = publicUrlFromImage(supabase, best);

      return {
        id: item.id,
        cart_id: cart.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price_cents: item.price_cents,
        product_title: product?.title || "Unknown Product",
        product_slug: product?.slug || "",
        variant_title: variant?.title || null,
        variant_sku: variant?.sku || null,
        options: variant?.options || null,
        image_url, // ✅ now returns a real URL when product_images exist
        added_note: item.added_note,
      };
    });

    // Totals
    const itemCount = items.reduce((sum: number, i: any) => sum + i.quantity, 0);
    const subtotalCents = items.reduce(
      (sum: number, i: any) => sum + i.price_cents * i.quantity,
      0
    );

    const shareUrl =
      cart.share_enabled && cart.share_token
        ? `${request.nextUrl.origin}/share/cart/${cart.share_token}`
        : null;

    return NextResponse.json({
      id: cart.id,
      items,
      item_count: itemCount,
      subtotal_cents: subtotalCents,
      share_token: cart.share_token,
      share_enabled: cart.share_enabled,
      share_url: shareUrl,
      share_name: cart.share_name,
      share_message: cart.share_message,
    });
  } catch (error) {
    console.error("Cart API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    const sessionId = request.headers.get("x-session-id");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: "No user or session identified" },
        { status: 400 }
      );
    }

    let cartQuery = supabase
      .from("carts")
      .select("id")
      .eq("status", "active")
      .single();

    cartQuery = userId
      ? cartQuery.eq("user_id", userId)
      : cartQuery.eq("session_id", sessionId);

    const { data: cart } = await cartQuery;

    if (cart) {
      await supabase.from("cart_items").delete().eq("cart_id", cart.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clear cart error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}