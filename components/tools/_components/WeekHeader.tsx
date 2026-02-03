// components/tools/_components/WeekHeader.tsx
import React from 'react';
import { WeekData } from '../../../types/timesheet';

interface WeekHeaderProps {
  week: WeekData;
  onWeekRename: (weekId: number, newName: string) => void;
  onAddWeekWithSchedule: (weekId: number) => void;
}

export const WeekHeader: React.FC<WeekHeaderProps> = ({
  week,
  onWeekRename,
  onAddWeekWithSchedule,
}) => {
  return (
    <div className="week-header">
      <input
        type="text"
        className="week-name-input"
        value={week.name}
        onChange={(e) => onWeekRename(week.id, e.target.value)}
      />
      
      <div className="week-actions">
        <button 
          className="add-week-from-current"
          onClick={() => onAddWeekWithSchedule(week.id)}
        >
          Add Week with Same Schedule
        </button>
      </div>
    </div>
  );
};