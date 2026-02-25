import { AdminOrder } from '@/lib/orders/types';

export function ReceiptPrint({ order }: { order: AdminOrder }) {
  return (
    <div className="p-8 bg-white text-black max-w-[800px] mx-auto print:p-0">
      <div className="flex justify-between border-b-2 border-black pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tighter">Your Store Name</h1>
          <p className="text-sm">Receipt for Order {order.order_number}</p>
        </div>
        <div className="text-right">
          <p className="font-bold">{new Date(order.created_at).toLocaleDateString()}</p>
          <p className={`text-sm ${order.payment_status === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
            {order.payment_status.toUpperCase()}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xs uppercase font-bold text-gray-500 mb-2">Ship To:</h2>
        <p className="text-sm">{order.email}</p>
        {/* Render shipping address fields here */}
      </div>

      <table className="w-full text-left mb-8">
        <thead>
          <tr className="border-b border-gray-200 text-xs uppercase">
            <th className="py-2">Item</th>
            <th className="py-2 text-center">Qty</th>
            <th className="py-2 text-right">Price</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {order.items?.map((item) => (
            <tr key={item.id} className="border-b border-gray-100">
              <td className="py-2">{item.title}</td>
              <td className="py-2 text-center">{item.quantity}</td>
              <td className="py-2 text-right">${(item.price_cents / 100).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-48 space-y-1">
          <div className="flex justify-between text-sm">
            <span>Total:</span>
            <span className="font-bold">${(order.total_cents / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}