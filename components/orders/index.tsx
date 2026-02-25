'use client';

// components/orders/index.tsx

import { useState, useMemo, useCallback } from 'react';
import { OrderGrid } from './OrderGrid';
import { OrderToolbar } from './Toolbar';
import { OrderDetailsDialog } from './OrderDetailsDialog';
import { ShippingSlip } from './Print';
import { AdminOrder, FulfillmentStatus, PaymentStatus } from '@/lib/orders/types';

interface OrdersManagerProps {
  initialOrders: AdminOrder[];
}

export function OrdersManager({ initialOrders }: OrdersManagerProps) {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingOrder, setEditingOrder] = useState<AdminOrder | null>(null);
  const [printOrder, setPrintOrder] = useState<AdminOrder | null>(null);

  // Filters
  const [fulfillmentFilter, setFulfillmentFilter] = useState<FulfillmentStatus | 'all'>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Optimistic fulfill — updates local state immediately
  const handleFulfill = useCallback(async (order: AdminOrder, trackingNumber?: string) => {
    const res = await fetch(`/api/orders/${order.id}/fulfill`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tracking_number: trackingNumber }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error ?? 'Failed to mark fulfilled');
    }
    // Optimistic update
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? { ...o, fulfillment_status: 'fulfilled', tracking_number: trackingNumber ?? o.tracking_number }
          : o
      )
    );
    // Sync editing dialog if open
    setEditingOrder((prev) =>
      prev?.id === order.id
        ? { ...prev, fulfillment_status: 'fulfilled', tracking_number: trackingNumber ?? prev.tracking_number }
        : prev
    );
  }, []);

  const handlePrint = useCallback((order: AdminOrder) => {
    setPrintOrder(order);
    setTimeout(() => {
      window.print();
      setPrintOrder(null);
    }, 300);
  }, []);

  const handleBatchPrint = useCallback(() => {
    if (selectedIds.length === 0) return;
    // For batch: open print with first selected, chain is handled in the browser
    const first = orders.find((o) => selectedIds.includes(o.id));
    if (first) handlePrint(first);
  }, [selectedIds, orders, handlePrint]);

  const handleBatchFulfill = useCallback(async () => {
    const toFulfill = orders.filter(
      (o) => selectedIds.includes(o.id) && o.fulfillment_status !== 'fulfilled'
    );
    await Promise.allSettled(toFulfill.map((o) => handleFulfill(o)));
    setSelectedIds([]);
  }, [selectedIds, orders, handleFulfill]);

  // Filtered + searched orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (fulfillmentFilter !== 'all' && o.fulfillment_status !== fulfillmentFilter) return false;
      if (paymentFilter !== 'all' && o.payment_status !== paymentFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = [o.customer_first_name, o.customer_last_name].join(' ').toLowerCase();
        if (
          !o.order_number.toLowerCase().includes(q) &&
          !o.email.toLowerCase().includes(q) &&
          !name.includes(q)
        ) return false;
      }
      return true;
    });
  }, [orders, fulfillmentFilter, paymentFilter, searchQuery]);

  return (
    <>
      {/* Print overlay — hidden on screen, visible only when printing */}
      {printOrder && (
        <div className="hidden print:block">
          <ShippingSlip order={printOrder} />
        </div>
      )}

      <div className="space-y-4 print:hidden">
        <OrderToolbar
          selectedCount={selectedIds.length}
          fulfillmentFilter={fulfillmentFilter}
          paymentFilter={paymentFilter}
          searchQuery={searchQuery}
          onFulfillmentFilter={setFulfillmentFilter}
          onPaymentFilter={setPaymentFilter}
          onSearch={setSearchQuery}
          onBatchAction={(action) => {
            if (action === 'print') handleBatchPrint();
            if (action === 'fulfill') handleBatchFulfill();
          }}
        />

        <OrderGrid
          orders={filteredOrders}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          onRowClick={setEditingOrder}
          onFulfill={handleFulfill}
          onPrint={handlePrint}
        />
      </div>

      {editingOrder && (
        <OrderDetailsDialog
          order={editingOrder}
          open={!!editingOrder}
          onOpenChange={(open) => !open && setEditingOrder(null)}
          onFulfill={handleFulfill}
          onPrint={handlePrint}
        />
      )}
    </>
  );
}

export default OrdersManager;