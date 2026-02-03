// app/dashboard/[id]/calendar/_components/CalendarTemplateUtils.ts
import * as ExcelJS from 'exceljs';
import { format, startOfMonth, endOfMonth, getDay, isSameMonth } from 'date-fns';

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

export class CalendarTemplateUtils {
  private static formatTime(timeString: string): string {
    if (!timeString || timeString === 'All Day') return '';
    
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return '';
    }
  }

  private static getEventText(event: CalendarEvent): string {
    if (event.is_hour_log) {
      return event.title; // e.g., "TB 7"
    } else if (event.is_payday || event.is_holiday || event.is_sales_day) {
      return event.title;
    } else {
      const time = this.formatTime(event.start_time);
      return time ? `${time} ${event.title}` : event.title;
    }
  }

  static async createStyledCalendar(
    currentDate: Date,
    events: CalendarEvent[],
    userRole: string,
    userInfo?: {
      userName?: string;
      userEmail?: string;
      department?: string;
      specialization?: string;
    }
  ): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Calendar');

    // Group events by date
    const eventsByDate: Record<string, CalendarEvent[]> = {};
    events.forEach(event => {
      if (!eventsByDate[event.event_date]) {
        eventsByDate[event.event_date] = [];
      }
      eventsByDate[event.event_date].push(event);
    });

    // Calendar generation logic
    const start = startOfMonth(currentDate);
    const firstDayOfWeek = getDay(start);
    const calendarStart = new Date(start);
    calendarStart.setDate(calendarStart.getDate() - firstDayOfWeek);

    const monthName = format(currentDate, 'MMMM yyyy');

    // Set column widths
    for (let i = 1; i <= 7; i++) {
      worksheet.getColumn(i).width = 18;
    }

    let currentRowIndex = 1;

    // User Information Header
    const userInfoRow = worksheet.getRow(currentRowIndex);
    const roleDisplayName = userRole === 'admin1' ? 'Administrator' : 
                           userRole === 'coachx7' ? 'Job Coach' : 
                           userRole === 'client7x' ? 'Client' : 'User';
    
    let userInfoText = `${roleDisplayName}`;
    if (userInfo?.userName) {
      userInfoText += ` - ${userInfo.userName}`;
    }
    if (userInfo?.userEmail) {
      userInfoText += ` (${userInfo.userEmail})`;
    }
    if (userInfo?.specialization) {
      userInfoText += ` | ${userInfo.specialization}`;
    }
    if (userInfo?.department) {
      userInfoText += ` | ${userInfo.department}`;
    }
    
    userInfoRow.getCell(1).value = userInfoText;
    worksheet.mergeCells(`A${currentRowIndex}:G${currentRowIndex}`);
    
    // Style user info header
    userInfoRow.getCell(1).style = {
      font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F2F2F' } }, // Dark gray/black
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'thick', color: { argb: 'FF000000' } },
        left: { style: 'thick', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thick', color: { argb: 'FF000000' } }
      }
    };
    userInfoRow.height = 25;
    currentRowIndex++;

    // Export timestamp and additional info
    const exportInfoRow = worksheet.getRow(currentRowIndex);
    exportInfoRow.getCell(1).value = `Export Date: ${format(new Date(), 'MMMM dd, yyyy at h:mm a')}`;
    worksheet.mergeCells(`A${currentRowIndex}:G${currentRowIndex}`);
    
    exportInfoRow.getCell(1).style = {
      font: { bold: false, size: 10, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4A4A4A' } }, // Medium gray
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thick', color: { argb: 'FF000000' } },
        bottom: { style: 'thick', color: { argb: 'FF000000' } },
        right: { style: 'thick', color: { argb: 'FF000000' } }
      }
    };
    exportInfoRow.height = 20;
    currentRowIndex++;

    // Add empty row for spacing
    worksheet.getRow(currentRowIndex).height = 10;
    currentRowIndex++;

    // Create month header
    const monthHeaderRow = worksheet.getRow(currentRowIndex);
    monthHeaderRow.getCell(1).value = monthName;
    worksheet.mergeCells(`A${currentRowIndex}:G${currentRowIndex}`);
    
    // Style month header - bolder and darker
    monthHeaderRow.getCell(1).style = {
      font: { bold: true, size: 18, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B365D' } }, // Darker blue
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'thick', color: { argb: 'FF000000' } },
        left: { style: 'thick', color: { argb: 'FF000000' } },
        bottom: { style: 'thick', color: { argb: 'FF000000' } },
        right: { style: 'thick', color: { argb: 'FF000000' } }
      }
    };
    monthHeaderRow.height = 35;
    currentRowIndex++;

    // Add empty row
    worksheet.getRow(currentRowIndex).height = 10;
    currentRowIndex++;

    // Create day headers
    const dayHeaders = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const headerRow = worksheet.getRow(currentRowIndex);
    
    dayHeaders.forEach((day, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = day;
      cell.style = {
        font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F5F8F' } }, // Darker blue
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: {
          top: { style: 'thick', color: { argb: 'FF000000' } },
          left: { style: 'thick', color: { argb: 'FF000000' } },
          bottom: { style: 'thick', color: { argb: 'FF000000' } },
          right: { style: 'thick', color: { argb: 'FF000000' } }
        }
      };
    });
    headerRow.height = 25;
    currentRowIndex++;

    // Generate 6 weeks of calendar
    for (let week = 0; week < 6; week++) {
      // Date numbers row
      const dateRow = worksheet.getRow(currentRowIndex);
      // Events row
      const eventRow = worksheet.getRow(currentRowIndex + 1);
      
      dateRow.height = 20;
      eventRow.height = 60;

      for (let day = 0; day < 7; day++) {
        const currentCalendarDate = new Date(calendarStart);
        currentCalendarDate.setDate(currentCalendarDate.getDate() + (week * 7) + day);
        
        const dayNumber = currentCalendarDate.getDate();
        const isCurrentMonth = isSameMonth(currentCalendarDate, currentDate);
        const isWeekend = day === 0 || day === 6; // Sunday or Saturday
        
        // Date cell
        const dateCell = dateRow.getCell(day + 1);
        if (isCurrentMonth) {
          dateCell.value = dayNumber;
        }
        
        // Date cell styling - bolder borders
        dateCell.style = {
          font: { 
            bold: true, 
            size: 12, 
            color: { argb: isWeekend ? 'FFCC0000' : 'FF000000' } 
          },
          fill: { 
            type: 'pattern', 
            pattern: 'solid', 
            fgColor: { argb: isWeekend ? 'FFF2F2F2' : 'FFFFFFFF' } 
          },
          alignment: { horizontal: 'center', vertical: 'top' },
          border: {
            top: { style: 'thick', color: { argb: 'FF000000' } },
            left: { style: 'thick', color: { argb: 'FF000000' } },
            bottom: { style: 'medium', color: { argb: 'FF666666' } },
            right: { style: 'thick', color: { argb: 'FF000000' } }
          }
        };

        // Event cell
        const eventCell = eventRow.getCell(day + 1);
        const dateString = format(currentCalendarDate, 'yyyy-MM-dd');
        const dayEvents = eventsByDate[dateString] || [];
        
        if (dayEvents.length > 0 && isCurrentMonth) {
          const eventText = dayEvents.map(event => this.getEventText(event)).join('\n');
          eventCell.value = eventText;
          
          // Determine event type for styling
          const hasHourLogs = dayEvents.some(e => e.is_hour_log);
          const hasSpecialEvents = dayEvents.some(e => e.is_payday || e.is_holiday || e.is_sales_day);
          
          let bgColor = isWeekend ? 'FFF2F2F2' : 'FFFFFFFF';
          let textColor = 'FF000080';
          
          if (hasHourLogs) {
            bgColor = 'FFE6F3E6'; // Light green
            textColor = 'FF006600'; // Dark green
          } else if (hasSpecialEvents) {
            bgColor = 'FFFFF2CC'; // Light yellow
            textColor = 'FFB8860B'; // Gold
          }
          
          eventCell.style = {
            font: { size: 10, color: { argb: textColor }, bold: true },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } },
            alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
            border: {
              top: { style: 'medium', color: { argb: 'FF666666' } },
              left: { style: 'thick', color: { argb: 'FF000000' } },
              bottom: { style: 'thick', color: { argb: 'FF000000' } },
              right: { style: 'thick', color: { argb: 'FF000000' } }
            }
          };
        } else {
          // Empty event cell styling - bolder borders
          eventCell.style = {
            fill: { 
              type: 'pattern', 
              pattern: 'solid', 
              fgColor: { argb: isWeekend ? 'FFF2F2F2' : 'FFFFFFFF' } 
            },
            border: {
              top: { style: 'medium', color: { argb: 'FF666666' } },
              left: { style: 'thick', color: { argb: 'FF000000' } },
              bottom: { style: 'thick', color: { argb: 'FF000000' } },
              right: { style: 'thick', color: { argb: 'FF000000' } }
            }
          };
        }
      }
      
      currentRowIndex += 2;
    }

    // Add summary section
    const summaryStartRow = currentRowIndex + 1;
    
    // Calculate statistics
    const stats = {
      totalEvents: events.filter(e => !e.is_hour_log).length,
      totalHours: events
        .filter(e => e.is_hour_log)
        .reduce((sum, e) => {
          const hours = parseFloat(e.title.split(' ')[1]) || 0;
          return sum + hours;
        }, 0),
      workingDays: [...new Set(events.filter(e => e.is_hour_log).map(e => e.event_date))].length
    };

    // Summary header
    const summaryHeaderRow = worksheet.getRow(summaryStartRow);
    summaryHeaderRow.getCell(1).value = 'MONTH SUMMARY';
    worksheet.mergeCells(`A${summaryStartRow}:G${summaryStartRow}`);
    
    summaryHeaderRow.getCell(1).style = {
      font: { bold: true, size: 14, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E7D32' } }, // Darker green
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'thick', color: { argb: 'FF000000' } },
        left: { style: 'thick', color: { argb: 'FF000000' } },
        bottom: { style: 'thick', color: { argb: 'FF000000' } },
        right: { style: 'thick', color: { argb: 'FF000000' } }
      }
    };
    summaryHeaderRow.height = 30;

    // Summary data with better formatting
    const summaryData = [
      `📅 Total Events: ${stats.totalEvents}`,
      `⏰ Total Hours Logged: ${stats.totalHours.toFixed(2)}`,
      `📊 Working Days: ${stats.workingDays}`,
      `🗓️ Report Period: ${format(startOfMonth(currentDate), 'MMM dd')} - ${format(endOfMonth(currentDate), 'MMM dd, yyyy')}`
    ];

    summaryData.forEach((text, index) => {
      const row = worksheet.getRow(summaryStartRow + 1 + index);
      const cell = row.getCell(1);
      cell.value = text;
      worksheet.mergeCells(`A${summaryStartRow + 1 + index}:G${summaryStartRow + 1 + index}`);
      
      cell.style = {
        font: { size: 11, bold: true },
        alignment: { horizontal: 'left', vertical: 'middle' },
        border: {
          left: { style: 'thick', color: { argb: 'FF000000' } },
          right: { style: 'thick', color: { argb: 'FF000000' } },
          bottom: index === summaryData.length - 1 ? { style: 'thick', color: { argb: 'FF000000' } } : { style: 'thin', color: { argb: 'FF666666' } },
          top: { style: 'thin', color: { argb: 'FF666666' } }
        }
      };
      row.height = 22;
    });

    return workbook;
  }

  static async createDetailedWorksheet(
    events: CalendarEvent[]
  ): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Event Details');

    const headers = [
      'Date', 'Day', 'Time', 'Title', 'Type', 'Status', 
      'Duration (min)', 'Coach', 'Client', 'Location', 'Priority', 'Description'
    ];

    // Add headers
    const headerRow = worksheet.getRow(1);
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = header;
      cell.style = {
        font: { bold: true, color: { argb: 'FFFFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF366092' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      };
    });

    // Set column widths
    const columnWidths = [12, 10, 15, 20, 12, 10, 8, 15, 15, 15, 8, 30];
    columnWidths.forEach((width, index) => {
      worksheet.getColumn(index + 1).width = width;
    });

    // Add data rows
    events.forEach((event, index) => {
      const row = worksheet.getRow(index + 2);
      const rowData = [
        event.event_date,
        format(new Date(event.event_date), 'EEEE'),
        event.is_hour_log ? 'All Day' : `${this.formatTime(event.start_time)} - ${this.formatTime(event.end_time)}`,
        event.title,
        event.is_hour_log ? 'Hour Log' : 
        event.is_payday ? 'Payday' :
        event.is_holiday ? 'Holiday' :
        event.is_sales_day ? 'Sales Day' : event.event_type,
        event.status,
        event.duration_minutes.toString(),
        event.coach_name || '',
        event.client_name || '',
        event.location || '',
        event.priority || '',
        event.description || ''
      ];

      rowData.forEach((data, colIndex) => {
        const cell = row.getCell(colIndex + 1);
        cell.value = data;
        
        // Alternate row colors
        const bgColor = index % 2 === 0 ? 'FFFFFFFF' : 'FFF8F9FA';
        
        cell.style = {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } },
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          },
          alignment: { vertical: 'middle' }
        };
      });
    });

    return workbook;
  }
}