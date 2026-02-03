// app/dashboard/[id]/calendar/_components/CalendarContent.tsx
'use client';

import { Calendar as CalendarIcon } from 'lucide-react';
import CalendarBox from '@/components/CalenderBox';

interface CalendarContentProps {
  showLoading: boolean;
  error: string | null;
  roleLoading: boolean;
  currentDate: Date;
  displayEvents: any[];
  viewMode: 'month' | 'week' | 'day';
  userRole: string;
  onDateClick: (date: Date) => void;
  onEventClick: (event: any) => void;
  onRefetch: () => void;
}

const CalendarContent = ({
  showLoading,
  error,
  roleLoading,
  currentDate,
  displayEvents,
  viewMode,
  userRole,
  onDateClick,
  onEventClick,
  onRefetch
}: CalendarContentProps) => {
  
  if (showLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 animate-spin" />
          <span className="text-muted-foreground">
            {roleLoading ? 'Loading role...' : 'Loading calendar...'}
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="mb-4">
            <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load calendar</h3>
            <p className="text-sm text-gray-600 mb-4 max-w-md">{error}</p>
          </div>
          <button
            onClick={onRefetch}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <CalendarBox
      currentDate={currentDate}
      events={displayEvents}
      onDateClick={onDateClick}
      onEventClick={onEventClick}
      viewMode={viewMode}
      userRole={userRole}
    />
  );
};

export default CalendarContent;