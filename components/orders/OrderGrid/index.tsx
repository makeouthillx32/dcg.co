export function OrderGrid({ orders, selectedIds, onSelectChange, onRowClick }: any) {
  const toggleAll = () => {
    if (selectedIds.length === orders.length) onSelectChange([]);
    else onSelectChange(orders.map((o: any) => o.id));
  };

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) onSelectChange(selectedIds.filter((i: string) => i !== id));
    else onSelectChange([...selectedIds, id]);
  };

  return (
    <div className="rounded-md border bg-white">
      <table className="w-full text-sm">
        <thead className="border-b bg-gray-50/50">
          <tr className="h-10 text-left font-medium">
            <th className="w-10 px-4"><input type="checkbox" onChange={toggleAll} /></th>
            <th className="px-4">Order #</th>
            <th className="px-4">Date</th>
            <th className="px-4">Customer</th>
            <th className="px-4">Status</th>
            <th className="px-4 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order: any) => (
            <tr 
              key={order.id} 
              className="border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => onRowClick(order)}
            >
              <td className="px-4" onClick={(e) => e.stopPropagation()}>
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(order.id)} 
                  onChange={() => toggleOne(order.id)} 
                />
              </td>
              <td className="px-4 font-mono font-medium">{order.order_number}</td>
              <td className="px-4 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
              <td className="px-4">{order.email}</td>
              <td className="px-4">
                 <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusStyle(order.status)}`}>
                   {order.status}
                 </span>
              </td>
              <td className="px-4 text-right">${(order.total_cents / 100).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'shipped': return 'bg-blue-100 text-blue-700';
    case 'delivered': return 'bg-green-100 text-green-700';
    case 'processing': return 'bg-orange-100 text-orange-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}