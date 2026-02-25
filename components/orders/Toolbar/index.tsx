'use client';

export function OrderToolbar({ selectedCount, onBatchAction }: { 
  selectedCount: number; 
  onBatchAction: (action: string) => void 
}) {
  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-md border">
      <div className="flex gap-4">
        <input 
          type="text" 
          placeholder="Search orders..." 
          className="px-3 py-1 border rounded-md w-64"
        />
        <select className="px-3 py-1 border rounded-md bg-white">
          <option>All Statuses</option>
          <option>Processing</option>
          <option>Shipped</option>
        </select>
      </div>

      <div className="flex gap-2">
        {selectedCount > 0 && (
          <div className="flex gap-2 animate-in fade-in slide-in-from-right-4">
            <span className="text-sm self-center mr-2 text-gray-500">{selectedCount} selected</span>
            <button 
              onClick={() => onBatchAction('print')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
            >
              Print Labels
            </button>
            <button 
              onClick={() => onBatchAction('ship')}
              className="px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm"
            >
              Mark Shipped
            </button>
          </div>
        )}
      </div>
    </div>
  );
}