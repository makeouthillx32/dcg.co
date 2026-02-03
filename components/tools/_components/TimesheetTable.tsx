// components/tools/_components/TimesheetTable.tsx
import React from 'react';
import { WeekData, RowData } from '../../../types/timesheet';
import { calculateWeekTotal } from '../../../utils/timesheetUtils';
import { TimesheetRow } from './TimesheetRow';

interface TimesheetTableProps {
  week: WeekData;
  onRowChange: <T extends keyof RowData>(
    weekId: number,
    rowIndex: number,
    field: T,
    value: RowData[T]
  ) => void;
  onRemoveRow: (weekId: number, rowIndex: number) => void;
}

export const TimesheetTable: React.FC<TimesheetTableProps> = ({
  week,
  onRowChange,
  onRemoveRow,
}) => {
  if (week.rows.length === 0) {
    return (
      <div className="no-days-message">
        No days added to {week.name} yet. Click "Add Day" or "Add Remaining Weekdays" to start.
      </div>
    );
  }

  return (
    <div className="timesheet-table">
      {week.rows.map((row, index) => (
        <TimesheetRow
          key={index}
          row={row}
          index={index}
          onRowChange={(field, value) => onRowChange(week.id, index, field, value)}
          onRemoveRow={() => onRemoveRow(week.id, index)}
        />
      ))}
      <div className="week-total-row">
        <div className="week-total-label">Week Total:</div>
        <div className="week-total-hours">{calculateWeekTotal(week).toFixed(2)} hours</div>
      </div>
    </div>
  );
};