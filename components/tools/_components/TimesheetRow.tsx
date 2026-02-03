// components/tools/_components/TimesheetRow.tsx (Mobile-Friendly Version)
import React from 'react';
import { RowData } from '../../../types/timesheet';
import { calculateTotal } from '../../../utils/timesheetUtils';

interface TimesheetRowProps {
  row: RowData;
  index: number;
  onRowChange: <T extends keyof RowData>(field: T, value: RowData[T]) => void;
  onRemoveRow: () => void;
}

export const TimesheetRow: React.FC<TimesheetRowProps> = ({
  row,
  index,
  onRowChange,
  onRemoveRow,
}) => {
  return (
    <div 
      className={`timesheet-row ${index % 2 === 1 ? 'row-alternate' : ''}`}
    >
      <div className="row-header">
        <div className="day-label">{row.day}</div>
        <div className="hours-total-mobile">
          {calculateTotal(row).toFixed(2)}h
        </div>
        <button 
          className="remove-row-button" 
          onClick={onRemoveRow}
          aria-label={`Remove ${row.day}`}
        >
          ×
        </button>
      </div>
      
      <div className="time-section">
        <div className="time-row">
          <div className="time-group">
            <label className="time-label">Start Time</label>
            <div className="time-input">
              <select
                className="hour-select"
                aria-label={`Start Hour for ${row.day}`}
                value={row.starthour}
                onChange={(e) => onRowChange("starthour", parseInt(e.target.value))}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
              <span className="time-separator">:</span>
              <select
                className="minute-select"
                aria-label={`Start Minute for ${row.day}`}
                value={row.startminute}
                onChange={(e) => onRowChange("startminute", parseInt(e.target.value))}
              >
                <option value={0}>00</option>
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={45}>45</option>
              </select>
              <select
                className="ampm-select"
                aria-label={`AM/PM for Start Time of ${row.day}`}
                value={row.startampm}
                onChange={(e) => onRowChange("startampm", e.target.value)}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
          
          <div className="time-group">
            <label className="time-label">End Time</label>
            <div className="time-input">
              <select
                className="hour-select"
                aria-label={`End Hour for ${row.day}`}
                value={row.endhour}
                onChange={(e) => onRowChange("endhour", parseInt(e.target.value))}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
              <span className="time-separator">:</span>
              <select
                className="minute-select"
                aria-label={`End Minute for ${row.day}`}
                value={row.endminute}
                onChange={(e) => onRowChange("endminute", parseInt(e.target.value))}
              >
                <option value={0}>00</option>
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={45}>45</option>
              </select>
              <select
                className="ampm-select"
                aria-label={`AM/PM for End Time of ${row.day}`}
                value={row.endampm}
                onChange={(e) => onRowChange("endampm", e.target.value)}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="break-row">
          <div className="break-group">
            <label className="break-label">Break Time</label>
            <div className="break-input">
              <select
                className="break-select"
                aria-label={`Break Time for ${row.day}`}
                value={row.breaktime}
                onChange={(e) => onRowChange("breaktime", parseInt(e.target.value))}
              >
                <option value={0}>0 min</option>
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
              </select>
            </div>
          </div>
          
          <div className="hours-total-desktop">
            <label className="hours-label">Total Hours</label>
            <div className="hours-value">
              {calculateTotal(row).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};