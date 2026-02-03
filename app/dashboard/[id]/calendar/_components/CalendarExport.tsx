// app/dashboard/[id]/calendar/_components/CalendarExport.tsx
'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Download, Calendar, FileSpreadsheet, Filter, Clock, Users, User, Briefcase } from 'lucide-react';
import { CalendarTemplateUtils } from './CalendarTemplateUtils';
import { CoachClientTimesheetTemplate } from './CoachClientTimesheetTemplate';
import { JobCoachPersonalTimesheetTemplate } from './JobCoachPersonalTimesheetTemplate';
import { ClientPersonalTimesheetTemplate } from './ClientPersonalTimesheetTemplate';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  start_time: string;
  end_time: string;
  event_type: string;
  client_name?: string;
  coach_name?: string;
  color_code: string;
  status: string;
  duration_minutes: number;
  is_hour_log?: boolean;
  is_payday?: boolean;
  is_holiday?: boolean;
  is_sales_day?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  location?: string;
  amount?: number;
}

interface CalendarExportProps {
  currentDate: Date;
  events: CalendarEvent[];
  userRole: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  department?: string;
  specialization?: string;
  onExportStart?: () => void;
  onExportComplete?: () => void;
  onExportError?: (error: string) => void;
}

interface ExportOptions {
  includeHourLogs: boolean;
  includeRegularEvents: boolean;
  includeSpecialEvents: boolean;
  filterByCoach?: string;
  filterByClient?: string;
  exportFormat: 'calendar' | 'detailed' | 'both' | 'coach-client-timesheet' | 'coach-personal-timesheet' | 'client-personal-timesheet';
}

const CalendarExport = ({
  currentDate,
  events,
  userRole,
  userId,
  userName,
  userEmail,
  department,
  specialization,
  onExportStart,
  onExportComplete,
  onExportError
}: CalendarExportProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeHourLogs: true,
    includeRegularEvents: true,
    includeSpecialEvents: true,
    exportFormat: 'calendar'
  });

  // Get unique coaches and clients for filtering
  const uniqueCoaches = [...new Set(events.map(e => e.coach_name).filter(Boolean))];
  const uniqueClients = [...new Set(events.map(e => e.client_name).filter(Boolean))];

  // Export format options based on user role
  const getExportFormatOptions = () => {
    const baseOptions = [
      { value: 'calendar', label: '📅 Calendar View (Styled)', icon: Calendar },
      { value: 'detailed', label: '📊 Event List', icon: FileSpreadsheet },
      { value: 'both', label: '📋 Calendar + Details', icon: FileSpreadsheet }
    ];

    const timesheetOptions = [];

    // Job Coach specific options
    if (userRole === 'coachx7') {
      timesheetOptions.push(
        { value: 'coach-client-timesheet', label: '👥 Client Hours Timesheet', icon: Users },
        { value: 'coach-personal-timesheet', label: '👤 Personal Hours Timesheet', icon: User }
      );
    }

    // Client specific options
    if (userRole === 'client7x') {
      timesheetOptions.push(
        { value: 'client-personal-timesheet', label: '📝 Personal Work Timesheet', icon: Briefcase }
      );
    }

    // Admin can access all timesheet types
    if (userRole === 'admin1') {
      timesheetOptions.push(
        { value: 'coach-client-timesheet', label: '👥 Coach-Client Hours Timesheet', icon: Users },
        { value: 'coach-personal-timesheet', label: '👤 Coach Personal Timesheet', icon: User },
        { value: 'client-personal-timesheet', label: '📝 Client Personal Timesheet', icon: Briefcase }
      );
    }

    return [...baseOptions, ...timesheetOptions];
  };

  // Filter events based on options
  const getFilteredEvents = () => {
    let filtered = events;

    // Filter by event type
    filtered = filtered.filter(event => {
      if (!exportOptions.includeHourLogs && event.is_hour_log) return false;
      if (!exportOptions.includeRegularEvents && !event.is_hour_log && !event.is_payday && !event.is_holiday && !event.is_sales_day) return false;
      if (!exportOptions.includeSpecialEvents && (event.is_payday || event.is_holiday || event.is_sales_day)) return false;
      return true;
    });

    // Filter by coach
    if (exportOptions.filterByCoach) {
      filtered = filtered.filter(event => event.coach_name === exportOptions.filterByCoach);
    }

    // Filter by client
    if (exportOptions.filterByClient) {
      filtered = filtered.filter(event => event.client_name === exportOptions.filterByClient);
    }

    return filtered;
  };

  // Generate timesheet exports
  const handleTimesheetExport = async (type: string) => {
    try {
      let workbook;
      let filename;
      const monthName = format(currentDate, 'MMMM_yyyy');
      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');

      switch (type) {
        case 'coach-client-timesheet':
          // Fetch job coach info and clients
          const coachInfo = await JobCoachPersonalTimesheetTemplate.fetchJobCoachPersonalInfo(userId);
          if (!coachInfo) throw new Error('Failed to fetch job coach information');
          
          const clients = await CoachClientTimesheetTemplate.fetchClientsByCoachSpecialization(
            userId, 
            specialization || coachInfo.specialization
          );
          
          workbook = await CoachClientTimesheetTemplate.createTimesheetTemplate(
            currentDate,
            coachInfo,
            clients
          );
          filename = `Coach_Client_Timesheet_${monthName}_${timestamp}.xlsx`;
          break;

        case 'coach-personal-timesheet':
          const personalCoachInfo = await JobCoachPersonalTimesheetTemplate.fetchJobCoachPersonalInfo(userId);
          if (!personalCoachInfo) throw new Error('Failed to fetch job coach information');
          
          workbook = await JobCoachPersonalTimesheetTemplate.createPersonalTimesheet(
            currentDate,
            personalCoachInfo
          );
          filename = `Coach_Personal_Timesheet_${monthName}_${timestamp}.xlsx`;
          break;

        case 'client-personal-timesheet':
          const clientInfo = await ClientPersonalTimesheetTemplate.fetchClientInfo(userId);
          if (!clientInfo) throw new Error('Failed to fetch client information');
          
          workbook = await ClientPersonalTimesheetTemplate.createSpecializedClientTimesheet(
            currentDate,
            clientInfo
          );
          filename = `Client_Personal_Timesheet_${monthName}_${timestamp}.xlsx`;
          break;

        default:
          throw new Error('Unknown timesheet type');
      }

      return { workbook, filename };
    } catch (error) {
      console.error('Timesheet export error:', error);
      throw error;
    }
  };

  // Main export function
  const handleExport = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    onExportStart?.();

    try {
      let workbook;
      let filename;
      const monthName = format(currentDate, 'MMMM_yyyy');
      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');

      // Handle timesheet exports
      if (exportOptions.exportFormat.includes('timesheet')) {
        const timesheetResult = await handleTimesheetExport(exportOptions.exportFormat);
        workbook = timesheetResult.workbook;
        filename = timesheetResult.filename;
      } else {
        // Handle regular calendar exports
        const filteredEvents = getFilteredEvents();
        
        if (exportOptions.exportFormat === 'calendar') {
          // Create styled calendar
          workbook = await CalendarTemplateUtils.createStyledCalendar(
            currentDate,
            filteredEvents,
            userRole,
            {
              userName,
              userEmail,
              department,
              specialization
            }
          );
        } else if (exportOptions.exportFormat === 'detailed') {
          // Create detailed list
          workbook = await CalendarTemplateUtils.createDetailedWorksheet(filteredEvents);
        } else {
          // Create both
          workbook = await CalendarTemplateUtils.createStyledCalendar(
            currentDate,
            filteredEvents,
            userRole,
            {
              userName,
              userEmail,
              department,
              specialization
            }
          );
          
          // Add detailed worksheet to existing workbook
          const detailedWorkbook = await CalendarTemplateUtils.createDetailedWorksheet(filteredEvents);
          const detailedWorksheet = detailedWorkbook.getWorksheet('Event Details');
          
          if (detailedWorksheet) {
            // Clone the worksheet to the main workbook
            const newWorksheet = workbook.addWorksheet('Event Details');
            
            // Copy data and styles from the detailed worksheet
            detailedWorksheet.eachRow((row, rowNumber) => {
              const newRow = newWorksheet.getRow(rowNumber);
              row.eachCell((cell, colNumber) => {
                const newCell = newRow.getCell(colNumber);
                newCell.value = cell.value;
                newCell.style = cell.style;
              });
              newRow.height = row.height;
            });
            
            // Copy column widths
            detailedWorksheet.columns.forEach((column, index) => {
              if (column.width) {
                newWorksheet.getColumn(index + 1).width = column.width;
              }
            });
          }
        }

        // Generate filename for regular exports
        const rolePrefix = userRole === 'admin1' ? 'Admin' : 'Coach';
        filename = `${rolePrefix}_Calendar_${monthName}_${timestamp}.xlsx`;
      }

      // Create buffer and download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      onExportComplete?.();
      setShowOptions(false); // Close options after successful export
    } catch (error) {
      console.error('Export error:', error);
      onExportError?.(`Failed to export: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const formatOptions = getExportFormatOptions();
  const isTimesheetFormat = exportOptions.exportFormat.includes('timesheet');

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          disabled={isExporting}
        >
          <FileSpreadsheet className="w-4 h-4" />
          {isExporting ? 'Exporting...' : 'Export'}
        </button>
        
        {userRole === 'admin1' && (
          <div className="text-xs text-gray-500">
            Admin: Can export all data types
          </div>
        )}
      </div>

      {showOptions && (
        <div className="absolute top-full left-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 max-h-80 sm:max-h-96 overflow-y-auto
                       /* Mobile positioning fixes */
                       max-w-[calc(100vw-2rem)] 
                       /* Ensure it doesn't go off-screen on mobile */
                       transform -translate-x-2 sm:translate-x-0">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Export Options
          </h3>
          
          {/* Export Format */}
          <div className="space-y-2 mb-4">
            <label className="text-sm font-medium text-gray-700">Export Type:</label>
            <div className="space-y-1 max-h-32 sm:max-h-40 overflow-y-auto border rounded p-2">
              {formatOptions.map(format => {
                const IconComponent = format.icon;
                return (
                  <label key={format.value} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded text-xs sm:text-sm">
                    <input
                      type="radio"
                      name="exportFormat"
                      value={format.value}
                      checked={exportOptions.exportFormat === format.value}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, exportFormat: e.target.value as any }))}
                      className="border-gray-300 scale-75 sm:scale-100"
                    />
                    <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 mr-1 sm:mr-2 text-gray-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm leading-tight">{format.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Only show calendar-specific options for non-timesheet exports */}
          {!isTimesheetFormat && (
            <>
              {/* Event Type Filters */}
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium text-gray-700">Include:</label>
                <div className="space-y-1">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeHourLogs}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeHourLogs: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <Clock className="w-3 h-3 ml-2 mr-1" />
                    <span className="text-sm">Hour Logs</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeRegularEvents}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeRegularEvents: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <Calendar className="w-3 h-3 ml-2 mr-1" />
                    <span className="text-sm">Regular Events</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeSpecialEvents}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeSpecialEvents: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm ml-5">Special Events (Paydays, Holidays)</span>
                  </label>
                </div>
              </div>

              {/* Role-based Filters */}
              {userRole === 'admin1' && (
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium text-gray-700">Filters:</label>
                  
                  {uniqueCoaches.length > 0 && (
                    <div>
                      <label className="text-xs text-gray-600">Coach:</label>
                      <select
                        value={exportOptions.filterByCoach || ''}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, filterByCoach: e.target.value || undefined }))}
                        className="w-full mt-1 text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="">All Coaches</option>
                        {uniqueCoaches.map(coach => (
                          <option key={coach} value={coach}>{coach}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {uniqueClients.length > 0 && (
                    <div>
                      <label className="text-xs text-gray-600">Client:</label>
                      <select
                        value={exportOptions.filterByClient || ''}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, filterByClient: e.target.value || undefined }))}
                        className="w-full mt-1 text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="">All Clients</option>
                        {uniqueClients.map(client => (
                          <option key={client} value={client}>{client}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Timesheet Info */}
          {isTimesheetFormat && (
            <div className="bg-blue-50 border border-blue-200 rounded p-2 sm:p-3 mb-4">
              <p className="text-xs sm:text-sm text-blue-800">
                <strong>Timesheet Export:</strong> This will generate a blank timesheet template for the selected month.
                {exportOptions.exportFormat === 'coach-client-timesheet' && ' It will include all clients matching your specialization.'}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3 border-t border-gray-200">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
            >
              <Download className="w-3 h-3" />
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
            <button
              onClick={() => setShowOptions(false)}
              className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarExport;