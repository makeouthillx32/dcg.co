// lib/cart-context.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// Types
export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  price_cents: number;

  // Denormalized for display
  product_title: string;
  product_slug: string;
  variant_title?: string;
  variant_sku?: string;

  // What the UI expects
  image_url?: string;

  // Optional extras
  options?: Record<string, any>;
  added_note?: string;

  // Allow extra fields from API without breaking
  [key: string]: any;
}

export interface Cart {
  id: string;
  items: CartItem[];
  item_count: number;
  subtotal_cents: number;
  share_token?: string;
  share_enabled?: boolean;
  share_url?: string;

  // Allow extra fields from API without breaking
  [key: string]: any;
}

interface CartContextValue {
  // State
  cart: Cart | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
  isOpen: boolean;

  // Actions
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;

  // Drawer controls
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Sharing
  enableSharing: (name?: string, message?: string) => Promise<string>;
  disableSharing: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}

// Session ID management
function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";

  let sessionId = localStorage.getItem("dcg_session_id");

  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("dcg_session_id", sessionId);
  }

  return sessionId;
}

/**
 * Normalize various API response shapes into a Cart.
 * Supports:
 *  - cart object directly
 *  - { ok: true, data: cart }
 */
function normalizeCartResponse(raw: any): Cart | null {
  if (!raw) return null;

  const cartCandidate: any =
    raw?.ok === true && raw?.data ? raw.data : raw;

  if (!cartCandidate || typeof cartCandidate !== "object") return null;
  if (!cartCandidate.id) return null;

  const itemsRaw: any[] = Array.isArray(cartCandidate.items) ? cartCandidate.items : [];

  const items: CartItem[] = itemsRaw.map((it: any) => {
    // Try to locate an image URL from common shapes:
    const image_url =
      it?.image_url ??
      it?.imageUrl ??
      it?.image ??
      it?.product_image_url ??
      it?.primary_image_url ??
      it?.product?.image_url ??
      it?.product?.primary_image_url ??
      it?.product?.imageUrl ??
      it?.product?.image ??
      // sometimes API returns product_images arrays
      it?.product_images?.[0]?.image_url ??
      it?.product_images?.[0]?.url ??
      it?.product?.product_images?.[0]?.image_url ??
      it?.product?.product_images?.[0]?.url ??
      undefined;

    return {
      ...it,
      image_url,
    } as CartItem;
  });

  // Prefer existing counts if present; otherwise compute safe defaults
  const item_count =
    typeof cartCandidate.item_count === "number"
      ? cartCandidate.item_count
      : items.reduce((sum, i) => sum + (i.quantity ?? 0), 0);

  const subtotal_cents =
    typeof cartCandidate.subtotal_cents === "number"
      ? cartCandidate.subtotal_cents
      : items.reduce((sum, i) => sum + (i.price_cents ?? 0) * (i.quantity ?? 0), 0);

  return {
    ...cartCandidate,
    items,
    item_count,
    subtotal_cents,
  } as Cart;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch cart from API
  const refreshCart = useCallback(async () => {
    try {
      const sessionId = getOrCreateSessionId();
      const response = await fetch("/api/cart", {
        headers: {
          "x-session-id": sessionId,
        },
      });

      if (response.ok) {
        const raw = await response.json();
        const normalized = normalizeCartResponse(raw);
        setCart(normalized);
      } else {
        // If API errors, keep app stable
        setCart(null);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load cart on mount
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Add item to cart
  const addItem = useCallback(
    async (variantId: string, quantity: number = 1) => {
      try {
        const sessionId = getOrCreateSessionId();
        const response = await fetch("/api/cart/items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-session-id": sessionId,
          },
          body: JSON.stringify({ variant_id: variantId, quantity }),
        });

        if (response.ok) {
          await refreshCart();
          setIsOpen(true); // Open cart drawer on add
        } else {
          const raw = await response.json().catch(() => null);
          throw new Error(raw?.error?.message || raw?.message || "Failed to add item");
        }
      } catch (error) {
        console.error("Failed to add item:", error);
        throw error;
      }
    },
    [refreshCart]
  );

  // Remove item from cart
  const removeItem = useCallback(
    async (itemId: string) => {
      try {
        const sessionId = getOrCreateSessionId();
        const response = await fetch(`/api/cart/items/${itemId}`, {
          method: "DELETE",
          headers: {
            "x-session-id": sessionId,
          },
        });

        if (response.ok) {
          await refreshCart();
        } else {
          const raw = await response.json().catch(() => null);
          throw new Error(raw?.error?.message || raw?.message || "Failed to remove item");
        }
      } catch (error) {
        console.error("Failed to remove item:", error);
        throw error;
      }
    },
    [refreshCart]
  );

  // Update item quantity
  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (quantity < 1) return removeItem(itemId);

      try {
        const sessionId = getOrCreateSessionId();
        const response = await fetch(`/api/cart/items/${itemId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-session-id": sessionId,
          },
          body: JSON.stringify({ quantity }),
        });

        if (response.ok) {
          await refreshCart();
        } else {
          const raw = await response.json().catch(() => null);
          throw new Error(raw?.error?.message || raw?.message || "Failed to update quantity");
        }
      } catch (error) {
        console.error("Failed to update quantity:", error);
        throw error;
      }
    },
    [refreshCart, removeItem]
  );

  // Clear entire cart
  const clearCart = useCallback(async () => {
    try {
      const sessionId = getOrCreateSessionId();
      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: {
          "x-session-id": sessionId,
        },
      });

      if (response.ok) {
        await refreshCart();
      } else {
        const raw = await response.json().catch(() => null);
        throw new Error(raw?.error?.message || raw?.message || "Failed to clear cart");
      }
    } catch (error) {
      console.error("Failed to clear cart:", error);
      throw error;
    }
  }, [refreshCart]);

  // Enable cart sharing
  const enableSharing = useCallback(
    async (name?: string, message?: string): Promise<string> => {
      if (!cart) throw new Error("No cart to share");

      try {
        const sessionId = getOrCreateSessionId();
        const response = await fetch("/api/cart/share", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-session-id": sessionId,
          },
          body: JSON.stringify({
            cart_id: cart.id,
            share_name: name,
            share_message: message,
          }),
        });

        if (response.ok) {
          const raw = await response.json();
          await refreshCart();
          return raw?.share_url || raw?.data?.share_url || "";
        }

        const raw = await response.json().catch(() => null);
        throw new Error(raw?.error?.message || raw?.message || "Failed to enable sharing");
      } catch (error) {
        console.error("Failed to enable sharing:", error);
        throw error;
      }
    },
    [cart, refreshCart]
  );

  // Disable cart sharing
  const disableSharing = useCallback(async () => {
    if (!cart) return;

    try {
      const sessionId = getOrCreateSessionId();
      const response = await fetch("/api/cart/share", {
        method: "DELETE",
        headers: {
          "x-session-id": sessionId,
        },
      });

      if (response.ok) {
        await refreshCart();
      } else {
        const raw = await response.json().catch(() => null);
        throw new Error(raw?.error?.message || raw?.message || "Failed to disable sharing");
      }
    } catch (error) {
      console.error("Failed to disable sharing:", error);
      throw error;
    }
  }, [cart, refreshCart]);

  // Drawer controls
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  // Computed values
  const items = cart?.items || [];
  const itemCount = cart?.item_count || 0;
  const subtotal = cart?.subtotal_cents || 0;

  const value: CartContextValue = {
    cart,
    items,
    itemCount,
    subtotal,
    isLoading,
    isOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    refreshCart,
    openCart,
    closeCart,
    toggleCart,
    enableSharing,
    disableSharing,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}