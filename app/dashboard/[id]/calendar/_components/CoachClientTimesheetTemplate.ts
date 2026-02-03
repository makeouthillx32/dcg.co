// app/dashboard/[id]/exports/CoachClientTimesheetTemplate.ts
import * as ExcelJS from 'exceljs';
import { format, startOfMonth, endOfMonth, getDaysInMonth } from 'date-fns';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
}

interface JobCoach {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
}

export class CoachClientTimesheetTemplate {
  
  static async createTimesheetTemplate(
    month: Date,
    jobCoach: JobCoach,
    clients: Client[]
  ): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Client Timesheet');

    const monthName = format(month, 'MMMM yyyy');
    const daysInMonth = getDaysInMonth(month);

    // Set up column widths
    worksheet.getColumn(1).width = 20; // Client names
    for (let i = 2; i <= daysInMonth + 1; i++) {
      worksheet.getColumn(i).width = 4; // Day columns
    }

    let currentRow = 1;

    // Header Section
    const headerRow = worksheet.getRow(currentRow);
    headerRow.getCell(1).value = `JOB COACH SIGNATURE:`;
    worksheet.mergeCells(`A${currentRow}:${String.fromCharCode(65 + daysInMonth)}${currentRow}`);
    headerRow.getCell(1).style = {
      font: { bold: true, size: 12 },
      alignment: { horizontal: 'left', vertical: 'middle' }
    };
    headerRow.height = 25;
    currentRow++;

    // Specialization Row
    const specializationRow = worksheet.getRow(currentRow);
    specializationRow.getCell(1).value = jobCoach.specialization.toUpperCase();
    worksheet.mergeCells(`A${currentRow}:${String.fromCharCode(65 + daysInMonth)}${currentRow}`);
    specializationRow.getCell(1).style = {
      font: { bold: true, size: 14 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6E6' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'thick' },
        left: { style: 'thick' },
        bottom: { style: 'thick' },
        right: { style: 'thick' }
      }
    };
    specializationRow.height = 30;
    currentRow++;

    // Month/Year Row
    const monthRow = worksheet.getRow(currentRow);
    monthRow.getCell(1).value = `Month & Year: ${monthName}`;
    worksheet.mergeCells(`A${currentRow}:${String.fromCharCode(65 + daysInMonth)}${currentRow}`);
    monthRow.getCell(1).style = {
      font: { bold: true, size: 12 },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'medium' },
        left: { style: 'thick' },
        bottom: { style: 'medium' },
        right: { style: 'thick' }
      }
    };
    monthRow.height = 25;
    currentRow++;

    // Instructions Row
    const instructionsRow = worksheet.getRow(currentRow);
    instructionsRow.getCell(1).value = 'TURN THIS FORM IN ON THE LAST DAY OF THE MONTH DAILY VOL. WORK.';
    worksheet.mergeCells(`A${currentRow}:${String.fromCharCode(65 + daysInMonth)}${currentRow}`);
    instructionsRow.getCell(1).style = {
      font: { bold: true, size: 10 },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'medium' },
        left: { style: 'thick' },
        bottom: { style: 'thick' },
        right: { style: 'thick' }
      }
    };
    instructionsRow.height = 20;
    currentRow++;

    // Day Numbers Header Row
    const dayHeaderRow = worksheet.getRow(currentRow);
    dayHeaderRow.getCell(1).value = '';
    
    // Add day numbers (1-31)
    for (let day = 1; day <= daysInMonth; day++) {
      const cell = dayHeaderRow.getCell(day + 1);
      cell.value = day;
      cell.style = {
        font: { bold: true, size: 10 },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: {
          top: { style: 'thick' },
          left: { style: 'thin' },
          bottom: { style: 'medium' },
          right: { style: 'thin' }
        },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } }
      };
    }
    
    // Style the first cell
    dayHeaderRow.getCell(1).style = {
      border: {
        top: { style: 'thick' },
        left: { style: 'thick' },
        bottom: { style: 'medium' },
        right: { style: 'thin' }
      },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } }
    };
    
    dayHeaderRow.height = 20;
    currentRow++;

    // Client Rows
    clients.forEach((client, index) => {
      const clientRow = worksheet.getRow(currentRow);
      
      // Client name in first column
      const clientName = `${client.last_name}, ${client.first_name}`;
      clientRow.getCell(1).value = clientName;
      clientRow.getCell(1).style = {
        font: { bold: false, size: 10 },
        alignment: { horizontal: 'left', vertical: 'middle' },
        border: {
          top: { style: 'thin' },
          left: { style: 'thick' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      };

      // Day cells for hour entry
      for (let day = 1; day <= daysInMonth; day++) {
        const cell = clientRow.getCell(day + 1);
        cell.style = {
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          },
          alignment: { horizontal: 'center', vertical: 'middle' }
        };
      }
      
      clientRow.height = 25;
      currentRow++;
    });

    // Add empty rows if less than expected
    const minRows = 15; // Ensure at least 15 client rows
    while (currentRow - 5 < minRows) { // -5 for header rows
      const emptyRow = worksheet.getRow(currentRow);
      
      emptyRow.getCell(1).style = {
        border: {
          top: { style: 'thin' },
          left: { style: 'thick' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      };

      for (let day = 1; day <= daysInMonth; day++) {
        const cell = emptyRow.getCell(day + 1);
        cell.style = {
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
        };
      }
      
      emptyRow.height = 25;
      currentRow++;
    }

    // Bottom border for last row
    const lastDataRow = worksheet.getRow(currentRow - 1);
    for (let col = 1; col <= daysInMonth + 1; col++) {
      const cell = lastDataRow.getCell(col);
      if (cell.style && cell.style.border) {
        cell.style = {
          ...cell.style,
          border: {
            ...cell.style.border,
            bottom: { style: 'thick' }
          }
        };
      }
    }

    // Right border for all rows
    for (let row = 1; row < currentRow; row++) {
      const lastCell = worksheet.getRow(row).getCell(daysInMonth + 1);
      if (lastCell.style && lastCell.style.border) {
        lastCell.style = {
          ...lastCell.style,
          border: {
            ...lastCell.style.border,
            right: { style: 'thick' }
          }
        };
      }
    }

    return workbook;
  }

  // Helper method to fetch clients by coach specialization
  static async fetchClientsByCoachSpecialization(
    coachId: string,
    coachSpecialization: string
  ): Promise<Client[]> {
    try {
      const response = await fetch('/api/exports/clients-by-specialization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coach_id: coachId,
          specialization: coachSpecialization
        }),
        credentials: 'include'
      });

      if (response.ok) {
        return await response.json();
      } else {
        console.error('Failed to fetch clients by specialization');
        return [];
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
  }

  // Helper method to fetch job coach info
  static async fetchJobCoachInfo(coachId: string): Promise<JobCoach | null> {
    try {
      const response = await fetch(`/api/exports/job-coach-info/${coachId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        return await response.json();
      } else {
        console.error('Failed to fetch job coach info');
        return null;
      }
    } catch (error) {
      console.error('Error fetching job coach info:', error);
      return null;
    }
  }
}