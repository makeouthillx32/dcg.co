'use client';

// components/orders/OrderGrid/index.tsx

import React, { useState } from 'react';
import { AdminOrder, FulfillmentStatus } from '@/lib/orders/types';
import { OrderContextMenu } from '../ContextMenu';
import { MoreHorizontal, Printer, CheckCircle2, User, Star } from 'lucide-react';

interface OrderGridProps {
  orders: AdminOrder[];
  selectedIds: string[];
  onSelectChange: (ids: string[]) => void;
  onRowClick: (order: AdminOrder) => void;
  onFulfill: (order: AdminOrder, trackingNumber?: string) => Promise<void>;
  onPrint: (order: AdminOrder) => void;
}

// ── Fulfillment badge ──────────────────────────────────────────────
const FULFILLMENT_STYLES: Record<FulfillmentStatus, string> = {
  unfulfilled: 'bg-amber-50 text-amber-700 border-amber-200',
  partial:     'bg-blue-50 text-blue-700 border-blue-200',
  fulfilled:   'bg-green-50 text-green-700 border-green-200',
  returned:    'bg-red-50 text-red-700 border-red-200',
  cancelled:   'bg-gray-100 text-gray-500 border-gray-200',
};
const FULFILLMENT_LABEL: Record<FulfillmentStatus, string> = {
  unfulfilled: 'Unfulfilled',
  partial:     'Partial',
  fulfilled:   'Fulfilled',
  returned:    'Returned',
  cancelled:   'Cancelled',
};

function FulfillmentBadge({ status }: { status: FulfillmentStatus }) {
  const s = FULFILLMENT_STYLES[status] ?? FULFILLMENT_STYLES.unfulfilled;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${s}`}>
      {FULFILLMENT_LABEL[status] ?? 'Unfulfilled'}
    </span>
  );
}

// ── Customer type badge ────────────────────────────────────────────
function CustomerTypeBadge({ order }: { order: AdminOrder }) {
  if (order.is_member) {
    return (
      <span
        title={`Member · ${order.points_earned} pts earned`}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border bg-yellow-50 text-yellow-700 border-yellow-200"
      >
        <Star className="w-2.5 h-2.5 fill-yellow-500 text-yellow-500" />
        Member
      </span>
    );
  }
  return (
    <span
      title="Guest order"
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border bg-gray-50 text-gray-500 border-gray-200"
    >
      <User className="w-2.5 h-2.5" />
      Guest
    </span>
  );
}

// ── Mobile card ────────────────────────────────────────────────────
function OrderCard({
  order, isSelected, onSelect, onRowClick, onFulfill, onPrint,
}: {
  order: AdminOrder;
  isSelected: boolean;
  onSelect: () => void;
  onRowClick: () => void;
  onFulfill: () => void;
  onPrint: () => void;
}) {
  const customerName = [order.customer_first_name, order.customer_last_name]
    .filter(Boolean).join(' ') || null;

  return (
    <div
      className={`rounded-lg border p-4 cursor-pointer transition-colors ${
        isSelected ? 'border-black bg-gray-50' : 'border-gray-200 bg-white hover:bg-gray-50'
      }`}
      onClick={onRowClick}
    >
      {/* Top row: checkbox + order # + total */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => { e.stopPropagation(); onSelect(); }}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 rounded border-gray-300 shrink-0"
          />
          <span className="font-mono font-bold text-gray-900 truncate">#{order.order_number}</span>
          <CustomerTypeBadge order={order} />
        </div>
        <span className="font-mono font-bold text-gray-900 shrink-0">
          ${(order.total_cents / 100).toFixed(2)}
        </span>
      </div>

      {/* Customer info */}
      <div className="mt-2 space-y-0.5">
        <div className="text-sm text-gray-700 truncate">{order.email}</div>
        {customerName && (
          <div className="text-xs text-gray-400 uppercase tracking-tight">{customerName}</div>
        )}
        <div className="text-xs text-gray-400">
          {new Date(order.created_at).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          })}
        </div>
      </div>

      {/* Bottom row: badges + quick actions */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <FulfillmentBadge status={order.fulfillment_status ?? 'unfulfilled'} />
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
            order.payment_status === 'paid'
              ? 'bg-green-50 text-green-700 border-green-100'
              : 'bg-amber-50 text-amber-700 border-amber-100'
          }`}>
            {order.payment_status?.toUpperCase()}
          </span>
          {/* Points pill on mobile */}
          {order.is_member && order.points_earned > 0 && (
            <span className="text-[10px] text-yellow-600 font-semibold">+{order.points_earned} pts</span>
          )}
        </div>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button title="Print slip" onClick={onPrint}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
            <Printer className="w-4 h-4" />
          </button>
          {order.fulfillment_status !== 'fulfilled' && (
            <button title="Mark fulfilled" onClick={onFulfill}
              className="p-1.5 rounded hover:bg-green-50 text-gray-400 hover:text-green-700 transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main grid ──────────────────────────────────────────────────────
export function OrderGrid({ orders, selectedIds, onSelectChange, onRowClick, onFulfill, onPrint }: OrderGridProps) {
  const [menu, setMenu] = useState<{ x: number; y: number; order: AdminOrder } | null>(null);
  const [fulfilling, setFulfilling] = useState<string | null>(null);

  const toggleAll = () => {
    if (selectedIds.length === orders.length) onSelectChange([]);
    else onSelectChange(orders.map((o) => o.id));
  };

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) onSelectChange(selectedIds.filter((i) => i !== id));
    else onSelectChange([...selectedIds, id]);
  };

  const handleContextMenu = (e: React.MouseEvent, order: AdminOrder) => {
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY, order });
  };

  const handleFulfillClick = async (e: React.MouseEvent, order: AdminOrder) => {
    e.stopPropagation();
    setFulfilling(order.id);
    try {
      await onFulfill(order);
    } catch (err: any) {
      alert(err.message ?? 'Failed to fulfill order');
    } finally {
      setFulfilling(null);
    }
  };

  const handleContextAction = async (action: string, order: AdminOrder) => {
    if (action === 'view') onRowClick(order);
    if (action === 'print_receipt') onPrint(order);
    if (action === 'mark_shipped') {
      setFulfilling(order.id);
      try { await onFulfill(order); } catch (err: any) { alert(err.message); } finally { setFulfilling(null); }
    }
    if (action === 'copy_id') navigator.clipboard.writeText(order.id).catch(() => {});
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 italic text-sm bg-white border border-gray-200 rounded-lg">
        No orders match the current filters.
      </div>
    );
  }

  return (
    <div className="relative">
      {/* ── MOBILE cards ── */}
      <div className="md:hidden space-y-3">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            isSelected={selectedIds.includes(order.id)}
            onSelect={() => toggleOne(order.id)}
            onRowClick={() => onRowClick(order)}
            onFulfill={() => onFulfill(order)}
            onPrint={() => onPrint(order)}
          />
        ))}
      </div>

      {/* ── DESKTOP table ── */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th className="w-12 px-4 py-3">
                <input type="checkbox" title="Select all"
                  className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                  checked={orders.length > 0 && selectedIds.length === orders.length}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Fulfillment</th>
              <th className="px-4 py-3 font-semibold">Payment</th>
              <th className="px-4 py-3 font-semibold text-right">Total</th>
              <th className="px-4 py-3 text-center w-28">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => {
              const isSelected = selectedIds.includes(order.id);
              const customerName = [order.customer_first_name, order.customer_last_name]
                .filter(Boolean).join(' ') || null;
              const isBusy = fulfilling === order.id;

              return (
                <tr
                  key={order.id}
                  onContextMenu={(e) => handleContextMenu(e, order)}
                  onClick={() => onRowClick(order)}
                  className={`group cursor-pointer transition-colors hover:bg-gray-50 ${
                    isSelected ? 'bg-blue-50/30 hover:bg-blue-50/50' : ''
                  }`}
                >
                  {/* Checkbox */}
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                      checked={isSelected}
                      onChange={() => toggleOne(order.id)}
                    />
                  </td>

                  {/* Order # */}
                  <td className="px-4 py-3 font-mono font-bold text-gray-900">
                    #{order.order_number}
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600 text-xs">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </td>

                  {/* Customer — with type badge */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <CustomerTypeBadge order={order} />
                        {order.is_member && order.points_earned > 0 && (
                          <span className="text-[10px] text-yellow-600 font-semibold">
                            +{order.points_earned} pts
                          </span>
                        )}
                      </div>
                      <span className="font-medium text-gray-900 truncate max-w-[160px]">{order.email}</span>
                      {customerName && (
                        <span className="text-[10px] text-gray-400 uppercase tracking-tight">{customerName}</span>
                      )}
                    </div>
                  </td>

                  {/* Fulfillment */}
                  <td className="px-4 py-3">
                    <FulfillmentBadge status={order.fulfillment_status ?? 'unfulfilled'} />
                  </td>

                  {/* Payment */}
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                      order.payment_status === 'paid'
                        ? 'bg-green-50 text-green-700 border-green-100'
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {order.payment_status?.toUpperCase()}
                    </span>
                  </td>

                  {/* Total */}
                  <td className="px-4 py-3 text-right font-mono font-bold text-gray-900">
                    ${(order.total_cents / 100).toFixed(2)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      <button title="Print slip" onClick={() => onPrint(order)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <Printer className="w-4 h-4" />
                      </button>
                      {order.fulfillment_status !== 'fulfilled' && (
                        <button
                          title="Mark fulfilled"
                          disabled={isBusy}
                          onClick={(e) => handleFulfillClick(e, order)}
                          className="p-1.5 rounded hover:bg-green-50 text-gray-400 hover:text-green-700 disabled:opacity-40 transition-colors"
                        >
                          <CheckCircle2 className={`w-4 h-4 ${isBusy ? 'animate-spin' : ''}`} />
                        </button>
                      )}
                      <button
                        title="More actions"
                        onClick={(e) => { e.stopPropagation(); handleContextMenu(e, order); }}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {menu && (
        <OrderContextMenu
          {...menu}
          onClose={() => setMenu(null)}
          onAction={(action, order) => handleContextAction(action, order)}
        />
      )}
    </div>
  );
}