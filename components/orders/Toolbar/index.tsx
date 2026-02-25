'use client';

// components/orders/Toolbar/index.tsx

import { FulfillmentStatus, PaymentStatus } from '@/lib/orders/types';
import { Printer, CheckCircle2, Search, SlidersHorizontal } from 'lucide-react';

interface OrderToolbarProps {
  selectedCount: number;
  fulfillmentFilter: FulfillmentStatus | 'all';
  paymentFilter: PaymentStatus | 'all';
  searchQuery: string;
  onFulfillmentFilter: (v: FulfillmentStatus | 'all') => void;
  onPaymentFilter: (v: PaymentStatus | 'all') => void;
  onSearch: (v: string) => void;
  onBatchAction: (action: string) => void;
}

export function OrderToolbar({
  selectedCount,
  fulfillmentFilter,
  paymentFilter,
  searchQuery,
  onFulfillmentFilter,
  onPaymentFilter,
  onSearch,
  onBatchAction,
}: OrderToolbarProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-3 shadow-sm">
      {/* Search row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search orders, email, name…"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
          />
        </div>
      </div>

      {/* Filters + batch row */}
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" />

        {/* Fulfillment filter */}
        <select
          value={fulfillmentFilter}
          onChange={(e) => onFulfillmentFilter(e.target.value as FulfillmentStatus | 'all')}
          className="text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
        >
          <option value="all">All Fulfillment</option>
          <option value="unfulfilled">Unfulfilled</option>
          <option value="partial">Partial</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* Payment filter */}
        <select
          value={paymentFilter}
          onChange={(e) => onPaymentFilter(e.target.value as PaymentStatus | 'all')}
          className="text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
        >
          <option value="all">All Payments</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
        </select>

        {/* Batch actions — only show when items selected */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-gray-500 font-medium">{selectedCount} selected</span>
            <button
              onClick={() => onBatchAction('print')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Slip</span>
            </button>
            <button
              onClick={() => onBatchAction('fulfill')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-black text-white hover:bg-gray-800 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span className="hidden sm:inline">Mark Fulfilled</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}