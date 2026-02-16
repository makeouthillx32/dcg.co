// components/cart/CartDrawer.tsx
"use client";

import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import CartItem from "./CartItem";
import EmptyCart from "./EmptyCart";
import { ArrowRight } from "lucide-react";

export default function CartDrawer() {
  const router = useRouter();
  const { isOpen, closeCart, items, itemCount, subtotal } = useCart();

  // Handle checkout navigation
  const handleCheckout = () => {
    closeCart(); // Close the drawer
    router.push('/checkout'); // Navigate to checkout
  };

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="text-2xl font-bold">
            Your Cart
            {itemCount > 0 && (
              <span className="text-muted-foreground text-base ml-2">
                ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Cart Items - Scrollable */}
        <ScrollArea className="flex-1 px-6">
          {items.length === 0 ? (
            <EmptyCart />
          ) : (
            <div className="space-y-4 py-4">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer - Subtotal + Checkout */}
        {items.length > 0 && (
          <div className="border-t px-6 py-4 space-y-4 bg-muted/30">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-lg">
              <span className="font-medium">Subtotal</span>
              <span className="font-bold">
                ${(subtotal / 100).toFixed(2)}
              </span>
            </div>

            <Separator />

            {/* Tax Notice */}
            <p className="text-xs text-muted-foreground text-center">
              Taxes and shipping calculated at checkout
            </p>

            {/* Checkout Button */}
            <Button 
              size="lg" 
              className="w-full"
              onClick={handleCheckout}
            >
              <span className="flex items-center justify-center gap-2">
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </span>
            </Button>

            {/* Continue Shopping */}
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={closeCart}
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}