// components/settings/timesheet-calculator-settings.tsx
"use client";

import React from 'react';

const TimesheetCalculatorSettings: React.FC = () => {
  return (
    <div 
      className="p-6 text-center"
      style={{ 
        fontFamily: 'var(--font-sans)',
        color: 'hsl(var(--muted-foreground))'
      }}
    >
      <h2 
        className="text-xl font-medium mb-4"
        style={{ 
          color: 'hsl(var(--foreground))',
          fontFamily: 'var(--font-sans)'
        }}
      >
        Timesheet Calculator Settings
      </h2>
      <p>This is a placeholder.</p>
    </div>
  );
};

export default TimesheetCalculatorSettings;