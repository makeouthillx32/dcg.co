'use client';

import { useState } from 'react';
import { OrderGrid } from './OrderGrid';
import { OrderToolbar } from './Toolbar';
import { OrderDetailsDialog } from './OrderDetailsDialog';
import { AdminOrder } from '@/lib/orders/types';

export function OrdersManager({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingOrder, setEditingOrder] = useState<AdminOrder | null>(null);

  const handleRowClick = (order: AdminOrder) => {
    setEditingOrder(order);
  };

  return (
    <div className="space-y-4">
      <OrderToolbar 
        selectedCount={selectedIds.length} 
        onBatchAction={(action) => console.log('Batch:', action, selectedIds)}
      />
      
      <OrderGrid 
        orders={orders} 
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        onRowClick={handleRowClick}
      />

      {editingOrder && (
        <OrderDetailsDialog 
          order={editingOrder} 
          open={!!editingOrder} 
          onOpenChange={(open) => !open && setEditingOrder(null)} 
        />
      )}
    </div>
  );
}