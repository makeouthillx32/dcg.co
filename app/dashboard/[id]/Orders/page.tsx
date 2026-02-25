import { getAdminOrders } from '@/lib/orders/admin';
import { OrdersManager } from '@/components/orders';

export default async function OrdersPage() {
  // Server-side gate and initial fetch
  const initialOrders = await getAdminOrders();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
      </div>
      <OrdersManager initialOrders={initialOrders} />
    </div>
  );
}