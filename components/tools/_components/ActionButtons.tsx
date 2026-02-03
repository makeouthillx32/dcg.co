// components/tools/_components/ActionButtons.tsx
import React from 'react';

interface ActionButtonsProps {
  customDayName: string;
  onCustomDayNameChange: (name: string) => void;
  onAddDay: () => void;
  onAddFullWeek: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  customDayName,
  onCustomDayNameChange,
  onAddDay,
  onAddFullWeek,
}) => {
  return (
    <div className="action-buttons">
      <div className="custom-day-input">
        <input
          type="text"
          placeholder="Custom day name"
          value={customDayName}
          onChange={(e) => onCustomDayNameChange(e.target.value)}
        />
      </div>
      <button className="add-button" onClick={onAddDay}>
        Add Day
      </button>
      <button className="add-button" onClick={onAddFullWeek}>
        Add Remaining Weekdays
      </button>
    </div>
  );
};