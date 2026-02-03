// components/tools/_components/TotalsSection.tsx
import React from 'react';
import { WeekData } from '../../../types/timesheet';
import { calculateWeekTotal } from '../../../utils/timesheetUtils';

interface TotalsSectionProps {
  weeks: WeekData[];
  totalHours: number;
  hourlyRate: number;
  showPayCalculation: boolean;
  onHourlyRateChange: (rate: number) => void;
  onTogglePayCalculation: () => void;
}

export const TotalsSection: React.FC<TotalsSectionProps> = ({
  weeks,
  totalHours,
  hourlyRate,
  showPayCalculation,
  onHourlyRateChange,
  onTogglePayCalculation,
}) => {
  const totalPay = totalHours * hourlyRate;

  return (
    <div className="totals-section">
      <div className="week-summaries">
        <h3>All Weeks Summary</h3>
        <div className="week-summary-list">
          {weeks.map((week) => (
            <div key={week.id} className="week-summary-item">
              <span>{week.name}:</span>
              <span>{calculateWeekTotal(week).toFixed(2)} hours</span>
            </div>
          ))}
        </div>
        <div className="all-weeks-total">
          <strong>Total Hours (All Weeks):</strong> {totalHours.toFixed(2)}
        </div>
      </div>
      
      <div className="hourly-rate-section">
        <label htmlFor="hourly-rate">Hourly Rate ($): </label>
        <input
          id="hourly-rate"
          type="number"
          min="0"
          step="0.01"
          value={hourlyRate}
          onChange={(e) => onHourlyRateChange(parseFloat(e.target.value) || 0)}
        />
        <button 
          className="calculate-pay-button"
          onClick={onTogglePayCalculation}
        >
          {showPayCalculation ? "Hide Pay" : "Calculate Pay"}
        </button>
      </div>
      
      {showPayCalculation && (
        <div className="pay-calculation">
          <div className="pay-detail">
            <span>Hours worked:</span>
            <span>{totalHours.toFixed(2)}</span>
          </div>
          <div className="pay-detail">
            <span>Hourly rate:</span>
            <span>${hourlyRate.toFixed(2)}</span>
          </div>
          <div className="pay-total">
            <span>Total pay:</span>
            <span>${totalPay.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};