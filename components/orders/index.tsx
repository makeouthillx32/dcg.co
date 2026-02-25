'use client';

import React, { useState } from 'react';
import { AdminOrder, FulfillmentStatus } from '@/lib/orders/types';
import { OrderStatusIcon, PaymentIcon } from './icons';
import { OrderContextMenu } from './ContextMenu';
import { MoreHorizontal } from 'lucide-react';

interface OrderGridProps {
  orders: AdminOrder[];
  selectedIds: string[];
  onSelectChange: (ids: string[]) => void;
  onRowClick: (order: AdminOrder) => void;
}

// Fulfillment badge — default state is "unfulfilled" (amber)
function FulfillmentBadge({ status }: { status: FulfillmentStatus }) {
  const styles: Record<FulfillmentStatus, string> = {
    unfulfilled: 'bg-amber-50 text-amber-700 border-amber-200',
    fulfilled:   'bg-green-50 text-green-700 border-green-200',
    partial:     'bg-blue-50 text-blue-700 border-blue-200',
    returned:    'bg-red-50 text-red-700 border-red-200',
  };

  const labels: Record<FulfillmentStatus, string> = {
    unfulfilled: 'Unfulfilled',
    fulfilled:   'Fulfilled',
    partial:     'Partial',
    returned:    'Returned',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[status] ?? styles.unfulfilled}`}>
      {labels[status] ?? 'Unfulfilled'}
    </span>
  );
}

export function OrderGrid({ orders, selectedIds, onSelectChange, onRowClick }: OrderGridProps) {
  const [menu, setMenu] = useState<{ x: number; y: number; order: AdminOrder } | null>(null);

  const toggleAll = () => {
    if (selectedIds.length === orders.length) {
      onSelectChange([]);
    } else {
      onSelectChange(orders.map((o) => o.id));
    }
  };

  const toggleOne = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      onSelectChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectChange([...selectedIds, id]);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, order: AdminOrder) => {
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY, order });
  };

  return (
    <div className="relative overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm text-gray-500">
        <thead className="bg-gray-50 text-xs uppercase text-gray-700">
          <tr>
            <th className="w-12 px-4 py-4">
              <div className="flex items-center">
                <input
                  id="select-all-orders"
                  type="checkbox"
                  title="Select all orders"
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                  checked={orders.length > 0 && selectedIds.length === orders.length}
                  onChange={toggleAll}
                />
                <label htmlFor="select-all-orders" className="sr-only">Select all orders</label>
              </div>
            </th>
            <th className="px-4 py-4 font-semibold">Order</th>
            <th className="px-4 py-4 font-semibold">Date</th>
            <th className="px-4 py-4 font-semibold">Customer</th>
            <th className="px-4 py-4 font-semibold">Fulfillment</th>
            <th className="px-4 py-4 font-semibold">Payment</th>
            <th className="px-4 py-4 font-semibold text-right">Total</th>
            <th className="w-10 px-4 py-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((order) => {
            const isSelected = selectedIds.includes(order.id);
            const orderIdAttr = `select-order-${order.id}`;
            const customerName = [order.customer_first_name, order.customer_last_name]
              .filter(Boolean).join(' ') || null;

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
                <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center">
                    <input
                      id={orderIdAttr}
                      type="checkbox"
                      title={`Select order ${order.order_number}`}
                      className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                      checked={isSelected}
                      onChange={(e: any) => toggleOne(e, order.id)}
                    />
                    <label htmlFor={orderIdAttr} className="sr-only">
                      Select order {order.order_number}
                    </label>
                  </div>
                </td>

                {/* Order number */}
                <td className="px-4 py-4 font-mono font-bold text-gray-900">
                  #{order.order_number}
                </td>

                {/* Date — newest first from query */}
                <td className="px-4 py-4 whitespace-nowrap text-gray-600">
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </td>

                {/* Customer */}
                <td className="px-4 py-4">
                  <div className="flex flex-col">
                    <span className="text-gray-900 font-medium truncate max-w-[180px]">
                      {order.email}
                    </span>
                    {customerName && (
                      <span className="text-[10px] text-gray-400 uppercase tracking-tight">
                        {customerName}
                      </span>
                    )}
                  </div>
                </td>

                {/* Fulfillment tag */}
                <td className="px-4 py-4">
                  <FulfillmentBadge status={order.fulfillment_status ?? 'unfulfilled'} />
                </td>

                {/* Payment */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1.5">
                    <PaymentIcon method="card" size="sm" className="opacity-60" />
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                      order.payment_status === 'paid'
                        ? 'bg-green-50 text-green-700 border-green-100'
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {order.payment_status.toUpperCase()}
                    </span>
                  </div>
                </td>

                {/* Total */}
                <td className="px-4 py-4 text-right font-mono font-bold text-gray-900">
                  ${(order.total_cents / 100).toFixed(2)}
                </td>

                {/* Actions */}
                <td className="px-4 py-4 text-right">
                  <button
                    type="button"
                    title="Order actions"
                    onClick={(e) => { e.stopPropagation(); handleContextMenu(e, order); }}
                    className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-md transition-all"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                    <span className="sr-only">Actions for order {order.order_number}</span>
                  </button>
                </td>
              </tr>
            );
          })}

          {orders.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-20 text-center text-gray-400 italic">
                No orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {menu && (
        <OrderContextMenu
          {...menu}
          onClose={() => setMenu(null)}
          onAction={(action, order) => {
            if (action === 'view') onRowClick(order);
          }}
        />
      )}
    </div>
  );
}