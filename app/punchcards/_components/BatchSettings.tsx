// app/punchcards/_components/BatchSettings.tsx
"use client";

import React from 'react';

interface BatchSettingsProps {
  cardCount: number;
  onCardCountChange: (count: number) => void;
  batchName: string;
  onBatchNameChange: (name: string) => void;
}

const BatchSettings: React.FC<BatchSettingsProps> = ({
  cardCount,
  onCardCountChange,
  batchName,
  onBatchNameChange
}) => {
  const layoutOptions = [
    { count: 4, layout: '2×2', description: 'Small batch, more spacing' },
    { count: 6, layout: '2×3', description: 'Medium batch, good spacing' },
    { count: 8, layout: '2×4', description: 'Full A4, maximum efficiency' }
  ];

  const handleQuickCounts = (count: number) => {
    onCardCountChange(count);
  };

  const calculateSheets = (totalCards: number, cardsPerSheet: number) => {
    return Math.ceil(totalCards / cardsPerSheet);
  };

  return (
    <div className="space-y-6">
      {/* Batch Name */}
      <div>
        <label htmlFor="batch-name" className="block text-sm font-medium text-gray-700 mb-2">
          Batch Name
        </label>
        <input
          id="batch-name"
          type="text"
          value={batchName}
          onChange={(e) => onBatchNameChange(e.target.value)}
          placeholder="e.g., Employee Cards Q1"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Layout Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Cards per A4 Sheet
        </label>
        <div className="space-y-2">
          {layoutOptions.map(option => (
            <div
              key={option.count}
              onClick={() => handleQuickCounts(option.count)}
              className={`cursor-pointer rounded-lg border-2 p-3 transition-colors ${
                cardCount === option.count
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{option.count} cards</span>
                  <span className="text-gray-500 ml-2">({option.layout})</span>
                </div>
                <div className="text-xs text-gray-400">
                  {option.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Card Count */}
      <div>
        <label htmlFor="card-count" className="block text-sm font-medium text-gray-700 mb-2">
          Total Cards Needed
        </label>
        <div className="flex items-center space-x-3">
          <input
            id="card-count"
            type="number"
            min="1"
            max="1000"
            value={cardCount}
            onChange={(e) => onCardCountChange(parseInt(e.target.value) || 1)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-sm text-gray-500">
            cards
          </div>
        </div>
      </div>

      {/* Quick Count Buttons */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Select
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[10, 25, 50, 100, 200, 500].map(count => (
            <button
              key={count}
              onClick={() => handleQuickCounts(count)}
              className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* Sheet Calculator */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Print Summary</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Total cards:</span>
            <span className="font-medium">{cardCount}</span>
          </div>
          <div className="flex justify-between">
            <span>A4 sheets needed:</span>
            <span className="font-medium">
              {calculateSheets(cardCount, 8)} sheets
            </span>
          </div>
          <div className="flex justify-between">
            <span>Cards per sheet:</span>
            <span className="font-medium">8 (2×4 layout)</span>
          </div>
          {cardCount % 8 !== 0 && (
            <div className="flex justify-between text-orange-600">
              <span>Last sheet:</span>
              <span className="font-medium">{cardCount % 8} cards</span>
            </div>
          )}
        </div>
      </div>

      {/* Print Tips */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Print Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use A4 paper (210×297mm)</li>
          <li>• Set printer to 100% scale</li>
          <li>• Enable duplex for front/back printing</li>
          <li>• Cut along dotted lines</li>
        </ul>
      </div>
    </div>
  );
};

export default BatchSettings;