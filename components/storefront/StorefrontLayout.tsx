// components/storefront/StorefrontLayout.tsx
"use client";

import Header from "@/components/Layouts/shop/Header";
import Footer from "@/components/Layouts/footer";
import { CartProvider } from "@/lib/cart-context";
import CartButton from "@/components/cart/CartButton";
import CartDrawer from "@/components/cart/CartDrawer";
import { useState } from "react";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // For storefront pages, navigateTo can use Next.js Link navigation
  const navigateTo = (page: string) => (e?: React.MouseEvent) => {
    // This will be handled by Next.js routing instead of hash navigation
    // Categories and products use real URLs now
    console.log("Storefront navigation to:", page);
  };

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Header
          theme="light"
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          navigateTo={navigateTo}
        />

        <main className="flex-grow">
          {children}
        </main>

        <Footer />
        
        {/* Floating Cart Button - appears on all storefront pages */}
        <CartButton />
        
        {/* Cart Drawer - slide-out overlay */}
        <CartDrawer />
      </div>
    </CartProvider>
  );
}