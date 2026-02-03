// components/tools/_components/TimeInput.tsx
import React from 'react';

interface TimeInputProps {
  hour: number;
  minute: number;
  ampm: string;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
  onAmPmChange: (ampm: string) => void;
  label: string;
  dayName: string;
}

export const TimeInput: React.FC<TimeInputProps> = ({
  hour,
  minute,
  ampm,
  onHourChange,
  onMinuteChange,
  onAmPmChange,
  label,
  dayName,
}) => {
  return (
    <div className="time-input">
      <select
        className="hour-select"
        aria-label={`${label} Hour for ${dayName}`}
        value={hour}
        onChange={(e) => onHourChange(parseInt(e.target.value))}
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
        aria-label={`${label} Minute for ${dayName}`}
        value={minute}
        onChange={(e) => onMinuteChange(parseInt(e.target.value))}
      >
        <option value={0}>00</option>
        <option value={15}>15</option>
        <option value={30}>30</option>
        <option value={45}>45</option>
      </select>
      <select
        className="ampm-select"
        aria-label={`AM/PM for ${label} Time of ${dayName}`}
        value={ampm}
        onChange={(e) => onAmPmChange(e.target.value)}
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
};