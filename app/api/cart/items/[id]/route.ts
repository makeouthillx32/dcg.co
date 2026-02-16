// app/api/cart/items/[id]/route.ts
import { createServerClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const { quantity } = body;

    if (!quantity || quantity < 1 || quantity > 99) {
      return NextResponse.json(
        { error: 'Quantity must be between 1 and 99' },
        { status: 400 }
      );
    }

    // Get cart item with variant details
    const { data: cartItem, error: itemError } = await supabase
      .from('cart_items')
      .select(`
        id,
        cart_id,
        variant_id,
        quantity,
        carts!inner (
          id,
          user_id,
          session_id
        ),
        product_variants (
          inventory_qty,
          is_active
        )
      `)
      .eq('id', id)
      .single();

    if (itemError || !cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }

    // Verify cart ownership
    const cart = (cartItem as any).carts;
    const isOwner = userId 
      ? cart.user_id === userId 
      : cart.session_id === sessionId;

    if (!isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check variant stock
    const variant = (cartItem as any).product_variants;
    if (!variant.is_active) {
      return NextResponse.json(
        { error: 'This product variant is no longer available' },
        { status: 400 }
      );
    }

    if (variant.inventory_qty < quantity) {
      return NextResponse.json(
        { error: `Only ${variant.inventory_qty} items in stock` },
        { status: 400 }
      );
    }

    // Update quantity
    const { error: updateError } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', id);

    if (updateError) {
      console.error('Failed to update cart item:', updateError);
      return NextResponse.json(
        { error: 'Failed to update cart item' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Quantity updated',
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Get cart item to verify ownership
    const { data: cartItem, error: itemError } = await supabase
      .from('cart_items')
      .select(`
        id,
        carts!inner (
          id,
          user_id,
          session_id
        )
      `)
      .eq('id', id)
      .single();

    if (itemError || !cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }

    // Verify cart ownership
    const cart = (cartItem as any).carts;
    const isOwner = userId 
      ? cart.user_id === userId 
      : cart.session_id === sessionId;

    if (!isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete item
    const { error: deleteError } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Failed to delete cart item:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete cart item' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart',
    });
  } catch (error) {
    console.error('Delete cart item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}