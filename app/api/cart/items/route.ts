// app/api/cart/items/route.ts
import { createServerClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

function jsonOk(data: any, meta?: any) {
  return NextResponse.json({ ok: true, data, meta });
}

function jsonError(status: number, code: string, message: string, details?: any) {
  return NextResponse.json({ ok: false, error: { code, message, details } }, { status });
}

async function getIdentity(req: NextRequest, supabase: Awaited<ReturnType<typeof createServerClient>>) {
  const sessionId = req.headers.get("x-session-id");
  const { data: { user }, error } = await supabase.auth.getUser();

  // auth.getUser() can error in some edge/cookie scenarios — don’t hard fail unless no identity
  const userId = !error ? user?.id : undefined;

  if (!userId && !sessionId) return null;
  return { userId: userId ?? null, sessionId: sessionId ?? null };
}

async function getOrCreateActiveCartId(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  identity: { userId: string | null; sessionId: string | null },
  createIfMissing: boolean
) {
  let cartQuery = supabase
    .from("carts")
    .select("id")
    .eq("status", "active")
    .single();

  cartQuery = identity.userId ? cartQuery.eq("user_id", identity.userId) : cartQuery.eq("session_id", identity.sessionId);

  const { data: cart } = await cartQuery;
  if (cart?.id) return cart.id;

  if (!createIfMissing) return null;

  const { data: newCart, error: createError } = await supabase
    .from("carts")
    .insert({
      user_id: identity.userId,
      session_id: identity.sessionId,
      status: "active",
    })
    .select("id")
    .single();

  if (createError || !newCart?.id) return null;
  return newCart.id;
}

/**
 * Picks the “best” image for a product from a list:
 * - is_primary first
 * - then lowest position
 * - then lowest sort_order
 */
function pickPrimaryImage(images: any[]) {
  if (!images?.length) return null;
  const sorted = [...images].sort((a, b) => {
    const ap = a.is_primary ? 1 : 0;
    const bp = b.is_primary ? 1 : 0;
    if (bp !== ap) return bp - ap;

    const apos = a.position ?? 9999;
    const bpos = b.position ?? 9999;
    if (apos !== bpos) return apos - bpos;

    const aso = a.sort_order ?? 9999;
    const bso = b.sort_order ?? 9999;
    return aso - bso;
  });
  return sorted[0];
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const identity = await getIdentity(request, supabase);

    if (!identity) {
      return jsonError(400, "NO_IDENTITY", "No user or session identified");
    }

    const cartId = await getOrCreateActiveCartId(supabase, identity, false);
    if (!cartId) {
      // No cart yet — return empty cart state
      return jsonOk({ cart_id: null, items: [] });
    }

    // 1) Fetch cart items + product + variant (NO images yet)
    const { data: items, error: itemsError } = await supabase
      .from("cart_items")
      .select(`
        id,
        cart_id,
        product_id,
        variant_id,
        quantity,
        price_cents,
        created_at,
        products:products (
          id,
          title,
          slug
        ),
        variants:product_variants (
          id,
          sku,
          option_values,
          price_cents
        )
      `)
      .eq("cart_id", cartId)
      .order("created_at", { ascending: true });

    if (itemsError) {
      return jsonError(500, "CART_ITEMS_FETCH_FAILED", "Failed to fetch cart items", itemsError);
    }

    const productIds = Array.from(new Set((items ?? []).map((i: any) => i.product_id).filter(Boolean)));
    let imagesByProductId = new Map<string, any[]>();

    // 2) Fetch all product_images for products in cart (1 query)
    if (productIds.length) {
      const { data: images, error: imagesError } = await supabase
        .from("product_images")
        .select("id, product_id, bucket_name, object_path, alt_text, position, sort_order, is_primary, is_public")
        .in("product_id", productIds)
        .eq("is_public", true);

      if (imagesError) {
        return jsonError(500, "CART_IMAGES_FETCH_FAILED", "Failed to fetch product images for cart", imagesError);
      }

      for (const img of images ?? []) {
        const pid = img.product_id as string;
        const arr = imagesByProductId.get(pid) ?? [];
        arr.push(img);
        imagesByProductId.set(pid, arr);
      }
    }

    // 3) Attach image_url (public)
    const enriched = (items ?? []).map((item: any) => {
      const imgs = imagesByProductId.get(item.product_id) ?? [];
      const primary = pickPrimaryImage(imgs);

      let image_url: string | null = null;
      let image_alt: string | null = null;

      if (primary?.bucket_name && primary?.object_path) {
        const { data } = supabase.storage.from(primary.bucket_name).getPublicUrl(primary.object_path);
        image_url = data?.publicUrl ?? null;
        image_alt = primary.alt_text ?? null;
      }

      return {
        id: item.id,
        cart_id: item.cart_id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price_cents: item.price_cents,

        product: item.products ?? null,
        variant: item.variants ?? null,

        image_url,
        image_alt,
      };
    });

    return jsonOk({ cart_id: cartId, items: enriched });
  } catch (err) {
    console.error("Cart GET error:", err);
    return jsonError(500, "INTERNAL", "Internal server error", err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const identity = await getIdentity(request, supabase);

    if (!identity) {
      return jsonError(400, "NO_IDENTITY", "No user or session identified");
    }

    const body = await request.json();
    const { variant_id, quantity = 1 } = body ?? {};

    if (!variant_id) {
      return jsonError(400, "MISSING_VARIANT", "variant_id is required");
    }

    if (quantity < 1 || quantity > 99) {
      return jsonError(400, "BAD_QTY", "Quantity must be between 1 and 99");
    }

    // Get variant details (price + stock)
    const { data: variant, error: variantError } = await supabase
      .from("product_variants")
      .select("id, product_id, price_cents, inventory_qty, is_active")
      .eq("id", variant_id)
      .single();

    if (variantError || !variant) {
      return jsonError(404, "VARIANT_NOT_FOUND", "Variant not found", variantError);
    }

    if (!variant.is_active) {
      return jsonError(400, "VARIANT_INACTIVE", "This product variant is no longer available");
    }

    if (variant.inventory_qty < quantity) {
      return jsonError(400, "OUT_OF_STOCK", `Only ${variant.inventory_qty} items in stock`);
    }

    const cartId = await getOrCreateActiveCartId(supabase, identity, true);
    if (!cartId) {
      return jsonError(500, "CART_CREATE_FAILED", "Failed to create cart");
    }

    // Check existing item
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cartId)
      .eq("variant_id", variant_id)
      .single();

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (variant.inventory_qty < newQuantity) {
        return jsonError(400, "OUT_OF_STOCK", `Only ${variant.inventory_qty} items in stock`);
      }

      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", existingItem.id);

      if (updateError) {
        return jsonError(500, "CART_ITEM_UPDATE_FAILED", "Failed to update cart item", updateError);
      }

      return jsonOk({ item_id: existingItem.id, cart_id: cartId, updated: true });
    }

    // Insert new item
    const { data: newItem, error: insertError } = await supabase
      .from("cart_items")
      .insert({
        cart_id: cartId,
        product_id: variant.product_id,
        variant_id: variant.id,
        quantity,
        price_cents: variant.price_cents,
      })
      .select("id")
      .single();

    if (insertError || !newItem?.id) {
      return jsonError(500, "CART_ITEM_INSERT_FAILED", "Failed to add item to cart", insertError);
    }

    return jsonOk({ item_id: newItem.id, cart_id: cartId, created: true });
  } catch (err) {
    console.error("Add to cart error:", err);
    return jsonError(500, "INTERNAL", "Internal server error", err);
  }
}
