// components/tools/_components/WeekTabs.tsx
import React from 'react';
import { WeekData } from '../../../types/timesheet';

interface WeekTabsProps {
  weeks: WeekData[];
  activeWeekId: number;
  onWeekSelect: (weekId: number) => void;
  onWeekRemove: (weekId: number) => void;
  onAddWeek: () => void;
}

export const WeekTabs: React.FC<WeekTabsProps> = ({
  weeks,
  activeWeekId,
  onWeekSelect,
  onWeekRemove,
  onAddWeek,
}) => {
  return (
    <div className="week-tabs">
      {weeks.map((week) => (
        <button
          key={week.id}
          className={`week-tab ${activeWeekId === week.id ? 'active' : ''}`}
          onClick={() => onWeekSelect(week.id)}
        >
          {week.name}
          {weeks.length > 1 && (
            <span 
              className="remove-week-button"
              onClick={(e) => {
                e.stopPropagation();
                onWeekRemove(week.id);
              }}
            >
              ×
            </span>
          )}
        </button>
      ))}
      <button className="week-tab add-week" onClick={onAddWeek}>
        + New Week
      </button>
    </div>
  );
};