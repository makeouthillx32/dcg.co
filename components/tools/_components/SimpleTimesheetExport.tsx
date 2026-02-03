// components/tools/_components/SimpleTimesheetExport.tsx
import React, { useState } from 'react';
import UniversalExportButton from '../../Export';
import { WeekData } from '../../../types/timesheet';

interface SimpleTimesheetExportProps {
  weeks: WeekData[];
}

export const SimpleTimesheetExport: React.FC<SimpleTimesheetExportProps> = ({ weeks }) => {
  const [employeeName, setEmployeeName] = useState('');
  const [payrollPeriod, setPayrollPeriod] = useState<1 | 2>(1);

  const getFilename = () => {
    const date = new Date();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();
    const empName = employeeName.replace(/[^a-zA-Z0-9]/g, '_') || 'Employee';
    return `Desert_Timesheet_${empName}_${month}_${year}`;
  };

  return (
    <div className="simple-timesheet-export">
      <h3>📋 Export to Physical Timesheet</h3>
      
      <div className="export-form">
        <div className="form-group">
          <label htmlFor="emp-name">Employee Name:</label>
          <input
            id="emp-name"
            type="text"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            placeholder="Enter employee name"
          />
        </div>

        <div className="form-group">
          <label>Payroll Period:</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                value={1}
                checked={payrollPeriod === 1}
                onChange={() => setPayrollPeriod(1)}
              />
              1st Half
            </label>
            <label>
              <input
                type="radio"
                value={2}
                checked={payrollPeriod === 2}
                onChange={() => setPayrollPeriod(2)}
              />
              2nd Half
            </label>
          </div>
        </div>

        <div className="export-summary">
          <p><strong>Ready to Export:</strong></p>
          <ul>
            <li>🗓️ {weeks.length} weeks of data</li>
            <li>📅 {weeks.reduce((sum, week) => sum + week.rows.length, 0)} days total</li>
            <li>👤 Employee: {employeeName || 'Not specified'}</li>
            <li>📊 Period: {payrollPeriod === 1 ? '1st' : '2nd'} Half</li>
          </ul>
        </div>

        {/* Using your TemplateRegistry system */}
        <UniversalExportButton
          templateId="desert-area-timesheet"
          templateData={{
            employeeName,
            payrollPeriod,
            weeks
          }}
          filename={getFilename()}
          size="lg"
          variant="primary"
          showTemplateInfo={true}
        />
      </div>

      <div className="export-help">
        <p><strong>💡 How it works:</strong></p>
        <ul>
          <li>📄 <strong>PDF</strong>: Creates printable form matching your physical timesheet</li>
          <li>📊 <strong>Excel</strong>: Exports data as CSV for spreadsheet use</li>
          <li>⏰ <strong>Auto-converts</strong>: Your digital times become form entries</li>
          <li>✅ <strong>Official format</strong>: Matches Desert Area Resources & Training layout</li>
        </ul>
      </div>
    </div>
  );
};