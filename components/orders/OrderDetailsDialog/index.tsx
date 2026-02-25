'use client';

import { useState } from 'react';
import { AdminOrder, OrderStatus } from '@/lib/orders/types';

/**
 * Order Details Dialog
 * Displays customer info, shipping details, and items.
 * Update logic is now handled via the parent component or local state.
 */
export function OrderDetailsDialog({ order, open, onOpenChange }: { 
  order: AdminOrder; 
  open: boolean; 
  onOpenChange: (open: boolean) => void 
}) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [tracking, setTracking] = useState(order.tracking_number || '');

  const handleSave = async () => {
    setLoading(true);
    try {
      // Logic for updating moved to parent component (e.g., via an onSave prop)
      console.log("Save triggered for order:", order.id, { status, tracking });
      onOpenChange(false);
    } catch (err) {
      alert("Failed to update order");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Order {order.order_number}</h2>
          <button onClick={() => onOpenChange(false)} className="text-gray-500 hover:text-black text-xl">✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Customer & Shipping */}
          <div className="space-y-4">
            <section>
              <h3 className="font-semibold text-xs uppercase text-gray-400 tracking-wider">Customer</h3>
              <p className="font-medium">{order.email}</p>
            </section>
            <section>
              <h3 className="font-semibold text-xs uppercase text-gray-400 tracking-wider">Shipping Address</h3>
              <div className="text-sm bg-gray-50 p-3 rounded-md border border-gray-100 mt-2">
                <pre className="font-sans whitespace-pre-wrap leading-relaxed">
                  {JSON.stringify(order.shipping_address, null, 2)}
                </pre>
              </div>
            </section>
          </div>

          {/* Right: Management Form */}
          <div className="space-y-4 border-l pl-0 md:pl-8 border-transparent md:border-gray-100">
            <section>
              <label className="block text-sm font-semibold mb-1.5">Fulfillment Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full p-2.5 border rounded-md bg-white focus:ring-2 focus:ring-black outline-none transition-all"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </section>
            <section>
              <label className="block text-sm font-semibold mb-1.5">Tracking Number</label>
              <input 
                type="text" 
                value={tracking} 
                onChange={(e) => setTracking(e.target.value)}
                placeholder="UPS / FedEx / USPS"
                className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-black outline-none transition-all"
              />
            </section>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-md font-bold hover:bg-zinc-800 disabled:bg-zinc-400 transition-colors mt-4"
            >
              {loading ? "Updating..." : "Update Order"}
            </button>
          </div>
        </div>

        {/* Line Items */}
        <div className="mt-8 border-t pt-6">
          <h3 className="font-bold text-sm uppercase tracking-widest mb-4">Order Items</h3>
          <div className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <div className="flex flex-col">
                  <span className="font-medium">{item.title}</span>
                  <span className="text-xs text-gray-400">SKU: {item.sku} × {item.quantity}</span>
                </div>
                <span className="font-mono">${(item.price_cents / 100).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between items-center bg-gray-50 p-3 rounded-md">
            <span className="font-bold">Total Amount</span>
            <span className="font-bold text-lg">${(order.total_cents / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}