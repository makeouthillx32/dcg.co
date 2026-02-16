// app/checkout/confirmation/[order_id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Package, Mail } from "lucide-react";

export default function OrderConfirmationPage({ params }: { params: Promise<{ order_id: string }> }) {
  const resolvedParams = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    // Clear checkout session storage
    sessionStorage.removeItem('checkout_email');
    sessionStorage.removeItem('checkout_shipping_address');
    sessionStorage.removeItem('checkout_billing_address');
    sessionStorage.removeItem('checkout_shipping_rate_id');
    sessionStorage.removeItem('promo_code');
    sessionStorage.removeItem('discount_cents');
  }, []);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${resolvedParams.order_id}`);
      const data = await response.json();
      
      if (data.order) {
        setOrder(data.order);
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Order not found</p>
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold">Desert Cowgirl</Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your order. We've sent a confirmation email to{' '}
            <span className="font-medium text-foreground">{order.email}</span>
          </p>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5" />
              <h2 className="font-semibold">Order Details</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Order Number</span>
                <p className="font-mono font-semibold">{order.order_number}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status</span>
                <p className="capitalize">{order.status}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Total</span>
                <p className="font-semibold">${(order.total_cents / 100).toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="p-6 border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5" />
              <h2 className="font-semibold">Shipping Address</h2>
            </div>
            {order.shipping_address && (
              <div className="text-sm">
                <p>{order.shipping_address.firstName} {order.shipping_address.lastName}</p>
                <p>{order.shipping_address.address1}</p>
                {order.shipping_address.address2 && <p>{order.shipping_address.address2}</p>}
                <p>
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}
                </p>
                <p>{order.shipping_address.country}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="p-6 border rounded-lg bg-card mb-8">
          <h2 className="font-semibold mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items && order.items.map((item: any) => (
              <div key={item.id} className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{item.title}</p>
                  {item.variant_title && (
                    <p className="text-sm text-muted-foreground">{item.variant_title}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold">
                  ${((item.price_cents * item.quantity) / 100).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${(order.subtotal_cents / 100).toFixed(2)}</span>
            </div>
            {order.discount_cents > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-${(order.discount_cents / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>${(order.shipping_cents / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>${(order.tax_cents / 100).toFixed(2)}</span>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>${(order.total_cents / 100).toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
          <Button asChild>
            <Link href={`/account/orders/${order.id}`}>View Order Details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}