// app/checkout/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/Layouts/overlays/cart/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, X, Tag } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, itemCount, subtotal, removeItem, updateQuantity } = useCart();
  
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState<any>(null);
  const [promoError, setPromoError] = useState("");
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [discountCents, setDiscountCents] = useState(0);

  // Redirect if cart is empty
  useEffect(() => {
    if (itemCount === 0) {
      router.push("/shop");
    }
  }, [itemCount, router]);

  // Calculate totals
  const subtotalCents = subtotal;
  const totalCents = subtotalCents - discountCents;

  // Handle promo code validation
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    setIsValidatingPromo(true);
    setPromoError("");

    try {
      const response = await fetch('/api/checkout/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCode,
          subtotal_cents: subtotalCents,
        }),
      });

      const data = await response.json();

      if (data.valid) {
        setPromoApplied(data.promo_code);
        setDiscountCents(data.discount_cents);
        setPromoError("");
      } else {
        setPromoError(data.error);
        setPromoApplied(null);
        setDiscountCents(0);
      }
    } catch (error) {
      console.error('Failed to validate promo:', error);
      setPromoError('Failed to validate promo code');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  // Remove promo code
  const handleRemovePromo = () => {
    setPromoCode("");
    setPromoApplied(null);
    setDiscountCents(0);
    setPromoError("");
  };

  // Proceed to shipping
  const handleContinue = () => {
    // Store promo code in session storage for next step
    if (promoApplied) {
      sessionStorage.setItem('promo_code', promoCode);
      sessionStorage.setItem('discount_cents', discountCents.toString());
    } else {
      sessionStorage.removeItem('promo_code');
      sessionStorage.removeItem('discount_cents');
    }
    router.push('/checkout/shipping');
  };

  if (itemCount === 0) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold">
            Desert Cowgirl
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <Link 
          href="/shop"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Continue Shopping
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
              <p className="text-muted-foreground">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>

            {/* Cart Items */}
            <div className="space-y-4">
              {items.map((item) => (
                <div 
                  key={item.id}
                  className="flex gap-4 p-4 border rounded-lg bg-card"
                >
                  {/* Image */}
                  <div className="relative w-24 h-24 flex-shrink-0 bg-muted rounded-md overflow-hidden">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.product_title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-4">
                      <div>
                        <h3 className="font-medium line-clamp-2">
                          {item.product_title}
                        </h3>
                        {item.variant_title && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.variant_title}
                          </p>
                        )}
                        {item.variant_sku && (
                          <p className="text-xs text-muted-foreground mt-1">
                            SKU: {item.variant_sku}
                          </p>
                        )}
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="h-8 w-8 flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Quantity & Price */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </Button>
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= 99}
                        >
                          +
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">
                          ${((item.price_cents * item.quantity) / 100).toFixed(2)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-muted-foreground">
                            ${(item.price_cents / 100).toFixed(2)} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Promo Code */}
              <div className="p-6 border rounded-lg bg-card">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Promo Code
                </h3>

                {!promoApplied ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                      />
                      <Button 
                        onClick={handleApplyPromo}
                        disabled={isValidatingPromo || !promoCode.trim()}
                      >
                        {isValidatingPromo ? 'Checking...' : 'Apply'}
                      </Button>
                    </div>
                    {promoError && (
                      <p className="text-sm text-destructive">{promoError}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-md border border-green-200 dark:border-green-800">
                    <div>
                      <p className="font-medium text-green-700 dark:text-green-300">
                        {promoApplied.code}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        {promoApplied.description}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRemovePromo}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="p-6 border rounded-lg bg-card space-y-4">
                <h3 className="font-semibold text-lg">Order Summary</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${(subtotalCents / 100).toFixed(2)}</span>
                  </div>

                  {promoApplied && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Discount ({promoApplied.code})</span>
                      <span>-${(discountCents / 100).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>Calculated at next step</span>
                  </div>

                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax</span>
                    <span>Calculated at next step</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${(totalCents / 100).toFixed(2)}</span>
                </div>

                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={handleContinue}
                >
                  Continue to Shipping
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Taxes and shipping calculated at checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}