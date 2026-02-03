// components/tools/_components/DataManagement.tsx
import React, { useRef } from 'react';

interface DataManagementProps {
  onClearAll: () => void;
  onExport: () => string;
  onImport: (data: string) => boolean;
}

export const DataManagement: React.FC<DataManagementProps> = ({
  onClearAll,
  onExport,
  onImport,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = onExport();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timesheet-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = onImport(content);
      if (success) {
        alert('Data imported successfully!');
      } else {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.onerror = () => {
      alert('Error reading file.');
    };
    reader.readAsText(file);

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all timesheet data? This cannot be undone.')) {
      onClearAll();
      alert('All data has been cleared.');
    }
  };

  return (
    <div className="data-management">
      <h3>Data Management</h3>
      <div className="data-management-buttons">
        <button 
          className="export-button"
          onClick={handleExport}
          title="Download your timesheet data as a JSON file"
        >
          📥 Export Data
        </button>
        
        <label className="import-button" title="Import timesheet data from a JSON file">
          📤 Import Data
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </label>
        
        <button 
          className="clear-button"
          onClick={handleClearAll}
          title="Clear all timesheet data and start fresh"
        >
          🗑️ Clear All Data
        </button>
      </div>
      
      <div className="data-info">
        <small>
          💡 Your data is automatically saved to your browser session and will persist until you close the browser tab.
        </small>
      </div>
    </div>
  );
};