'use client';

// components/orders/index.tsx

import { useState, useMemo, useCallback } from 'react';
import { OrderGrid } from './OrderGrid';
import { OrderToolbar } from './Toolbar';
import { OrderDetailsDialog } from './OrderDetailsDialog';
import { ShippingSlip } from './Print';
import { PackagePicker } from './PackagePicker';
import { AdminOrder, FulfillmentStatus, PaymentStatus } from '@/lib/orders/types';

interface OrdersManagerProps {
  initialOrders: AdminOrder[];
}

export function OrdersManager({ initialOrders }: OrdersManagerProps) {
  const [orders, setOrders]           = useState<AdminOrder[]>(initialOrders);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingOrder, setEditingOrder] = useState<AdminOrder | null>(null);

  // Packing slip (HTML) — still available from context menu / grid printer icon
  const [slipOrder, setSlipOrder]     = useState<AdminOrder | null>(null);

  // Label generation — opened from grid printer icon (bypasses detail dialog)
  const [labelOrder, setLabelOrder]   = useState<AdminOrder | null>(null);

  // Filters
  const [fulfillmentFilter, setFulfillmentFilter] = useState<FulfillmentStatus | 'all'>('all');
  const [paymentFilter, setPaymentFilter]         = useState<PaymentStatus | 'all'>('all');
  const [customerTypeFilter, setCustomerTypeFilter] = useState<'all' | 'member' | 'guest'>('all');
  const [searchQuery, setSearchQuery]             = useState('');

  // ── Fulfill ───────────────────────────────────────────────────
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
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? { ...o, fulfillment_status: 'fulfilled', tracking_number: trackingNumber ?? o.tracking_number }
          : o
      )
    );
    setEditingOrder((prev) =>
      prev?.id === order.id
        ? { ...prev, fulfillment_status: 'fulfilled', tracking_number: trackingNumber ?? prev.tracking_number }
        : prev
    );
  }, []);

  // ── Grid "print" icon → open PackagePicker directly ──────────
  // If order already has a stored label, opens detail dialog instead
  // (where they can hit Reprint)
  const handlePrint = useCallback((order: AdminOrder) => {
    if ((order as any).label_pdf_path) {
      // Already has a label — open the detail dialog so they can reprint
      setEditingOrder(order);
    } else {
      // No label yet — open picker to generate one
      setLabelOrder(order);
    }
  }, []);

  // Called by PackagePicker (grid-level, not inside detail dialog)
  const handleLabelSuccess = useCallback((trackingNumber: string, trackingUrl: string) => {
    if (!labelOrder) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === labelOrder.id
          ? { ...o, tracking_number: trackingNumber, tracking_url: trackingUrl }
          : o
      )
    );
    setLabelOrder(null);
  }, [labelOrder]);

  // ── Packing slip (HTML browser print) ────────────────────────
  const handlePackingSlip = useCallback((order: AdminOrder) => {
    setSlipOrder(order);
    setTimeout(() => {
      window.print();
      setSlipOrder(null);
    }, 300);
  }, []);

  // ── Batch ─────────────────────────────────────────────────────
  const handleBatchPrint = useCallback(() => {
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

  // ── Filters ───────────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (fulfillmentFilter !== 'all' && o.fulfillment_status !== fulfillmentFilter) return false;
      if (paymentFilter !== 'all' && o.payment_status !== paymentFilter) return false;
      if (customerTypeFilter === 'member' && !o.is_member) return false;
      if (customerTypeFilter === 'guest' && !o.is_guest) return false;
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
  }, [orders, fulfillmentFilter, paymentFilter, customerTypeFilter, searchQuery]);

  return (
    <>
      {/* HTML packing slip — hidden from screen, shown only to printer */}
      {slipOrder && (
        <div className="hidden print:block">
          <ShippingSlip order={slipOrder} />
        </div>
      )}

      {/* PackagePicker — opened from grid printer icon when no label exists */}
      {labelOrder && (
        <PackagePicker
          order={labelOrder}
          onSuccess={handleLabelSuccess}
          onClose={() => setLabelOrder(null)}
        />
      )}

      <div className="space-y-4 print:hidden">
        <OrderToolbar
          selectedCount={selectedIds.length}
          fulfillmentFilter={fulfillmentFilter}
          paymentFilter={paymentFilter}
          customerTypeFilter={customerTypeFilter}
          searchQuery={searchQuery}
          onFulfillmentFilter={setFulfillmentFilter}
          onPaymentFilter={setPaymentFilter}
          onCustomerTypeFilter={setCustomerTypeFilter}
          onSearch={setSearchQuery}
          onBatchAction={(action) => {
            if (action === 'print')   handleBatchPrint();
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
          onOpenChange={(open) => { if (!open) setEditingOrder(null); }}
          onFulfill={handleFulfill}
          onPrint={handlePrint}
        />
      )}
    </>
  );
}