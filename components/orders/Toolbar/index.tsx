'use client';

export function OrderToolbar({ selectedCount, onBatchAction }: { 
  selectedCount: number; 
  onBatchAction: (action: string) => void 
}) {
  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-md border">
      <div className="flex gap-4">
        {/* Added Label for Accessibility */}
        <div className="flex flex-col">
          <label htmlFor="order-search" className="sr-only">Search Orders</label>
          <input 
            id="order-search"
            type="text" 
            placeholder="Search orders..." 
            className="px-3 py-1 border rounded-md w-64 focus:ring-2 focus:ring-black outline-none"
          />
        </div>

        {/* Added Label for Accessibility */}
        <div className="flex flex-col">
          <label htmlFor="status-filter" className="sr-only">Filter by Status</label>
          <select 
            id="status-filter"
            className="px-3 py-1 border rounded-md bg-white focus:ring-2 focus:ring-black outline-none"
          >
            <option>All Statuses</option>
            <option>Processing</option>
            <option>Shipped</option>
          </select>
        </div>
      </div>
      {/* ... rest of component */}
    </div>
  );
}