// app/api/cart/route.ts
import { createServerClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // Get session ID from headers (for guests)
    const sessionId = request.headers.get('x-session-id');
    
    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    // Must have either user_id or session_id
    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: 'No user or session identified' },
        { status: 400 }
      );
    }

    // Try to find existing cart
    let cartQuery = supabase
      .from('carts')
      .select(`
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
      `)
      .eq('status', 'active')
      .single();

    // Filter by user_id or session_id
    if (userId) {
      cartQuery = cartQuery.eq('user_id', userId);
    } else {
      cartQuery = cartQuery.eq('session_id', sessionId);
    }

    let { data: cart, error } = await cartQuery;

    // If no cart exists, create one
    if (error || !cart) {
      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert({
          user_id: userId || null,
          session_id: sessionId || null,
          status: 'active',
        })
        .select()
        .single();

      if (createError) {
        console.error('Failed to create cart:', createError);
        return NextResponse.json(
          { error: 'Failed to create cart' },
          { status: 500 }
        );
      }

      cart = { ...newCart, cart_items: [] };
    }

    // Format cart items for frontend
    const items = (cart.cart_items || []).map((item: any) => {
      const product = item.products;
      const variant = item.product_variants;
      
      // Get image URL if available (we'll need to add this logic)
      const imageUrl = null; // TODO: Fetch product image

      return {
        id: item.id,
        cart_id: cart.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price_cents: item.price_cents,
        product_title: product?.title || 'Unknown Product',
        product_slug: product?.slug || '',
        variant_title: variant?.title || null,
        variant_sku: variant?.sku || null,
        options: variant?.options || null,
        image_url: imageUrl,
        added_note: item.added_note,
      };
    });

    // Calculate totals
    const itemCount = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    const subtotalCents = items.reduce(
      (sum: number, item: any) => sum + (item.price_cents * item.quantity),
      0
    );

    // Build share URL if sharing is enabled
    const shareUrl = cart.share_enabled && cart.share_token
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
    console.error('Cart API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    const sessionId = request.headers.get('x-session-id');
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: 'No user or session identified' },
        { status: 400 }
      );
    }

    // Find cart
    let cartQuery = supabase
      .from('carts')
      .select('id')
      .eq('status', 'active')
      .single();

    if (userId) {
      cartQuery = cartQuery.eq('user_id', userId);
    } else {
      cartQuery = cartQuery.eq('session_id', sessionId);
    }

    const { data: cart } = await cartQuery;

    if (cart) {
      // Delete all cart items
      await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cart.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clear cart error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}