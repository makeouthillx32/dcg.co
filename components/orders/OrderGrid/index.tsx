'use client';

import React, { useState } from 'react';
import { AdminOrder } from '@/lib/orders/types';
import { OrderStatusIcon, PaymentIcon } from '../icons';
import { OrderContextMenu } from '../ContextMenu';
import { MoreHorizontal } from 'lucide-react';

interface OrderGridProps {
  orders: AdminOrder[];
  selectedIds: string[];
  onSelectChange: (ids: string[]) => void;
  onRowClick: (order: AdminOrder) => void;
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
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                checked={orders.length > 0 && selectedIds.length === orders.length}
                onChange={toggleAll}
              />
            </th>
            <th className="px-4 py-4 font-semibold">Order</th>
            <th className="px-4 py-4 font-semibold">Date</th>
            <th className="px-4 py-4 font-semibold">Customer</th>
            <th className="px-4 py-4 font-semibold">Status</th>
            <th className="px-4 py-4 font-semibold">Payment</th>
            <th className="px-4 py-4 font-semibold text-right">Total</th>
            <th className="w-10 px-4 py-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((order) => (
            <tr
              key={order.id}
              onContextMenu={(e) => handleContextMenu(e, order)}
              onClick={() => onRowClick(order)}
              className={`group cursor-pointer transition-colors hover:bg-gray-50 ${
                selectedIds.includes(order.id) ? 'bg-blue-50/30 hover:bg-blue-50/50' : ''
              }`}
            >
              <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                  checked={selectedIds.includes(order.id)}
                  onChange={(e: any) => toggleOne(e, order.id)}
                />
              </td>
              <td className="px-4 py-4 font-mono font-bold text-gray-900">
                #{order.order_number}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                {new Date(order.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-col">
                  <span className="text-gray-900 truncate max-w-[150px]">{order.email}</span>
                  {order.shipping_address?.name && (
                    <span className="text-[10px] text-gray-400 uppercase tracking-tight">
                      {order.shipping_address.name}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <OrderStatusIcon status={order.status} size="sm" />
                  <span className="capitalize">{order.status}</span>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-1.5">
                  <PaymentIcon method="card" size="sm" className="opacity-60" />
                  <span className={`text-xs font-medium ${
                    order.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {order.payment_status.toUpperCase()}
                  </span>
                </div>
              </td>
              <td className="px-4 py-4 text-right font-medium text-gray-900">
                ${(order.total_cents / 100).toFixed(2)}
              </td>
              <td className="px-4 py-4 text-right">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleContextMenu(e, order); }}
                  className="p-1 text-gray-400 hover:text-black hover:bg-gray-200 rounded transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {menu && (
        <OrderContextMenu
          {...menu}
          onClose={() => setMenu(null)}
          onAction={(action, order) => {
            if (action === 'view') onRowClick(order);
            console.log(`Context Action: ${action} for ${order.order_number}`);
          }}
        />
      )}
    </div>
  );
}