// app/api/cart/items/route.ts
import { createServerClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { variant_id, quantity = 1 } = body;

    if (!variant_id) {
      return NextResponse.json(
        { error: 'variant_id is required' },
        { status: 400 }
      );
    }

    if (quantity < 1 || quantity > 99) {
      return NextResponse.json(
        { error: 'Quantity must be between 1 and 99' },
        { status: 400 }
      );
    }

    // Get variant details (to get current price and validate stock)
    const { data: variant, error: variantError } = await supabase
      .from('product_variants')
      .select(`
        id,
        product_id,
        price_cents,
        inventory_qty,
        is_active
      `)
      .eq('id', variant_id)
      .single();

    if (variantError || !variant) {
      return NextResponse.json(
        { error: 'Variant not found' },
        { status: 404 }
      );
    }

    if (!variant.is_active) {
      return NextResponse.json(
        { error: 'This product variant is no longer available' },
        { status: 400 }
      );
    }

    // Check stock
    if (variant.inventory_qty < quantity) {
      return NextResponse.json(
        { error: `Only ${variant.inventory_qty} items in stock` },
        { status: 400 }
      );
    }

    // Find or create cart
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

    let { data: cart } = await cartQuery;

    // Create cart if doesn't exist
    if (!cart) {
      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert({
          user_id: userId || null,
          session_id: sessionId || null,
          status: 'active',
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Failed to create cart:', createError);
        return NextResponse.json(
          { error: 'Failed to create cart' },
          { status: 500 }
        );
      }

      cart = newCart;
    }

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cart.id)
      .eq('variant_id', variant_id)
      .single();

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;

      // Check stock for new quantity
      if (variant.inventory_qty < newQuantity) {
        return NextResponse.json(
          { error: `Only ${variant.inventory_qty} items in stock` },
          { status: 400 }
        );
      }

      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id);

      if (updateError) {
        console.error('Failed to update cart item:', updateError);
        return NextResponse.json(
          { error: 'Failed to update cart item' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Item quantity updated',
        item_id: existingItem.id,
      });
    }

    // Add new item to cart
    const { data: newItem, error: insertError } = await supabase
      .from('cart_items')
      .insert({
        cart_id: cart.id,
        product_id: variant.product_id,
        variant_id: variant.id,
        quantity,
        price_cents: variant.price_cents,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to add item to cart:', insertError);
      return NextResponse.json(
        { error: 'Failed to add item to cart' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Item added to cart',
      item_id: newItem.id,
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}