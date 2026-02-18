// components/cart/CartItem.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart, CartItem as CartItemType } from "@/components/Layouts/overlays/cart/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Minus, Plus } from "lucide-react";

interface CartItemProps {
  item: CartItemType;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isLocalImageUrl(url: string) {
  // Next/Image is safest for local public assets or same-origin paths
  return url.startsWith("/");
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;

    setIsUpdating(true);
    try {
      await updateQuantity(item.id, newQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      await removeItem(item.id);
    } finally {
      setIsUpdating(false);
    }
  };

  const itemTotal = (item.price_cents * item.quantity) / 100;

  const imageUrl = isNonEmptyString(item.image_url) ? item.image_url.trim() : null;

  return (
    <div className="flex gap-4 py-4 border-b last:border-0">
      {/* Product Image */}
      <Link
        href={`/products/${item.product_slug}`}
        className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border bg-muted"
      >
        {imageUrl ? (
          isLocalImageUrl(imageUrl) ? (
            <Image
              src={imageUrl}
              alt={item.product_title}
              fill
              sizes="96px"
              className="object-cover"
              priority={false}
            />
          ) : (
            // External URLs (Supabase public URL, CDN, etc.)
            // Using <img> avoids Next/Image remotePatterns/domain blocking.
            <img
              src={imageUrl}
              alt={item.product_title}
              className="h-full w-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            No image
          </div>
        )}
      </Link>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Title & Remove */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <Link
              href={`/products/${item.product_slug}`}
              className="font-medium hover:underline line-clamp-2"
            >
              {item.product_title}
            </Link>

            {/* Variant Info */}
            {item.variant_title && (
              <p className="text-sm text-muted-foreground mt-1">{item.variant_title}</p>
            )}

            {/* SKU */}
            {item.variant_sku && (
              <p className="text-xs text-muted-foreground mt-1">SKU: {item.variant_sku}</p>
            )}
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 -mt-1 -mr-2"
            onClick={handleRemove}
            disabled={isUpdating}
            aria-label="Remove item"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Price & Quantity Controls */}
        <div className="flex items-center justify-between mt-2">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>

            <Input
              type="number"
              min="1"
              max="99"
              value={item.quantity}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value)) handleQuantityChange(value);
              }}
              className="h-8 w-14 text-center"
              disabled={isUpdating}
            />

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isUpdating || item.quantity >= 99}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Item Total */}
          <div className="text-right">
            <p className="font-semibold">${itemTotal.toFixed(2)}</p>
            {item.quantity > 1 && (
              <p className="text-xs text-muted-foreground">
                ${(item.price_cents / 100).toFixed(2)} each
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}