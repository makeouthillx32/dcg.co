// app/dashboard/[id]/exports/JobCoachPersonalTimesheetTemplate.ts
import * as ExcelJS from 'exceljs';
import { format, startOfMonth, endOfMonth, getDaysInMonth } from 'date-fns';

interface JobCoach {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  employee_id?: string;
}

interface TimesheetConfig {
  categories: string[];
  payPeriodStart: Date;
  payPeriodEnd: Date;
}

export class JobCoachPersonalTimesheetTemplate {
  
  private static readonly DEFAULT_CATEGORIES = [
    'TOTAL ALL HOURS',
    'Work at DARTS Intake',
    'Transportation',
    'Vacation Leave',
    'Sick Leave',
    'Holiday',
    'Other',
    'Job Coach Mr. Hall',
    'The Social Media',
    'TIME OUT',
    'TIME IN',
    'TIME OUT',
    'TIME IN'
  ];

  static async createPersonalTimesheet(
    payPeriod: Date,
    jobCoach: JobCoach,
    config?: Partial<TimesheetConfig>
  ): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Job Coach Timesheet');

    const startDate = config?.payPeriodStart || startOfMonth(payPeriod);
    const endDate = config?.payPeriodEnd || endOfMonth(payPeriod);
    const categories = config?.categories || this.DEFAULT_CATEGORIES;
    
    const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const maxDays = Math.min(daysInPeriod, 31); // Cap at 31 for layout

    // Set up column widths
    worksheet.getColumn(1).width = 25; // Categories column
    worksheet.getColumn(2).width = 8;  // DATE column
    for (let i = 3; i <= maxDays + 2; i++) {
      worksheet.getColumn(i).width = 4; // Day columns
    }

    let currentRow = 1;

    // Title Header
    const titleRow = worksheet.getRow(currentRow);
    titleRow.getCell(1).value = "Employee's Name, Tyler Evans";
    worksheet.mergeCells(`A${currentRow}:${String.fromCharCode(65 + maxDays + 1)}${currentRow}`);
    titleRow.getCell(1).style = {
      font: { bold: true, size: 14 },
      alignment: { horizontal: 'left', vertical: 'middle' },
      border: {
        top: { style: 'thick' },
        left: { style: 'thick' },
        bottom: { style: 'medium' },
        right: { style: 'thick' }
      }
    };
    titleRow.height = 30;
    currentRow++;

    // Employee Name Row (Dynamic)
    const nameRow = worksheet.getRow(currentRow);
    nameRow.getCell(1).value = `Employee's Name: ${jobCoach.first_name} ${jobCoach.last_name}`;
    worksheet.mergeCells(`A${currentRow}:${String.fromCharCode(65 + maxDays + 1)}${currentRow}`);
    nameRow.getCell(1).style = {
      font: { bold: true, size: 12 },
      alignment: { horizontal: 'left', vertical: 'middle' },
      border: {
        top: { style: 'medium' },
        left: { style: 'thick' },
        bottom: { style: 'medium' },
        right: { style: 'thick' }
      }
    };
    nameRow.height = 25;
    currentRow++;

    // Pay Period Row
    const periodRow = worksheet.getRow(currentRow);
    periodRow.getCell(1).value = `Pay Period: ${format(startDate, 'MM/dd/yyyy')} - ${format(endDate, 'MM/dd/yyyy')}`;
    worksheet.mergeCells(`A${currentRow}:${String.fromCharCode(65 + maxDays + 1)}${currentRow}`);
    periodRow.getCell(1).style = {
      font: { bold: true, size: 12 },
      alignment: { horizontal: 'left', vertical: 'middle' },
      border: {
        top: { style: 'medium' },
        left: { style: 'thick' },
        bottom: { style: 'thick' },
        right: { style: 'thick' }
      }
    };
    periodRow.height = 25;
    currentRow++;

    // Headers Row
    const headerRow = worksheet.getRow(currentRow);
    headerRow.getCell(1).value = '';
    headerRow.getCell(2).value = 'DATE';
    
    // Add day numbers
    for (let day = 1; day <= maxDays; day++) {
      headerRow.getCell(day + 2).value = day;
    }

    // Style headers
    headerRow.getCell(1).style = {
      border: {
        top: { style: 'thick' },
        left: { style: 'thick' },
        bottom: { style: 'medium' },
        right: { style: 'thin' }
      },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6E6' } }
    };

    headerRow.getCell(2).style = {
      font: { bold: true, size: 10 },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'thick' },
        left: { style: 'thin' },
        bottom: { style: 'medium' },
        right: { style: 'thin' }
      },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6E6' } }
    };

    for (let day = 1; day <= maxDays; day++) {
      headerRow.getCell(day + 2).style = {
        font: { bold: true, size: 9 },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: {
          top: { style: 'thick' },
          left: { style: 'thin' },
          bottom: { style: 'medium' },
          right: day === maxDays ? { style: 'thick' } : { style: 'thin' }
        },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6E6' } }
      };
    }

    headerRow.height = 20;
    currentRow++;

    // Category Rows
    categories.forEach((category, index) => {
      const categoryRow = worksheet.getRow(currentRow);
      
      // Category name
      categoryRow.getCell(1).value = category;
      categoryRow.getCell(1).style = {
        font: { bold: category === 'TOTAL ALL HOURS', size: 9 },
        alignment: { horizontal: 'left', vertical: 'middle' },
        border: {
          top: { style: 'thin' },
          left: { style: 'thick' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        },
        fill: category === 'TOTAL ALL HOURS' ? 
          { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFE0' } } : undefined
      };

      // DATE column (empty for data entry)
      categoryRow.getCell(2).style = {
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      };

      // Day columns
      for (let day = 1; day <= maxDays; day++) {
        const cell = categoryRow.getCell(day + 2);
        cell.style = {
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: day === maxDays ? { style: 'thick' } : { style: 'thin' }
          },
          alignment: { horizontal: 'center', vertical: 'middle' }
        };

        // Add formula for TOTAL ALL HOURS row
        if (category === 'TOTAL ALL HOURS' && day <= maxDays) {
          const columnLetter = String.fromCharCode(65 + day + 1);
          const startRow = currentRow + 1;
          const endRow = currentRow + categories.length - 1;
          cell.value = {
            formula: `SUM(${columnLetter}${startRow}:${columnLetter}${endRow})`
          };
        }
      }
      
      categoryRow.height = 20;
      currentRow++;
    });

    // Bottom border for last row
    const lastRow = worksheet.getRow(currentRow - 1);
    for (let col = 1; col <= maxDays + 2; col++) {
      const cell = lastRow.getCell(col);
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

    // Signature Section
    currentRow += 2;
    const sigRow = worksheet.getRow(currentRow);
    sigRow.getCell(1).value = 'Supervisor Signature & Date:';
    worksheet.mergeCells(`A${currentRow}:${String.fromCharCode(67 + Math.floor(maxDays/2))}${currentRow}`);
    sigRow.getCell(1).style = {
      font: { bold: true, size: 11 },
      alignment: { horizontal: 'left', vertical: 'middle' }
    };

    const empSigCol = Math.floor(maxDays/2) + 4;
    sigRow.getCell(empSigCol).value = 'Employee Signature & Date:';
    worksheet.mergeCells(`${String.fromCharCode(65 + empSigCol - 1)}${currentRow}:${String.fromCharCode(65 + maxDays + 1)}${currentRow}`);
    sigRow.getCell(empSigCol).style = {
      font: { bold: true, size: 11 },
      alignment: { horizontal: 'left', vertical: 'middle' }
    };

    // Side Text (DESERT AREA RESOURCES & TRAINING)
    this.addSideText(worksheet, categories.length + 6);

    return workbook;
  }

  private static addSideText(worksheet: ExcelJS.Worksheet, totalRows: number) {
    // Add the vertical text on the right side
    const sideTextRow = Math.floor(totalRows / 2) + 4;
    const sideCol = worksheet.columnCount + 2;
    
    const sideCell = worksheet.getRow(sideTextRow).getCell(sideCol);
    sideCell.value = 'DESERT AREA RESOURCES & TRAINING STAFF TIME SHEET';
    sideCell.style = {
      font: { bold: true, size: 12 },
      alignment: { 
        horizontal: 'center', 
        vertical: 'middle',
        textRotation: 90 
      }
    };
    
    worksheet.getColumn(sideCol).width = 6;
  }

  // Helper method to fetch job coach personal info
  static async fetchJobCoachPersonalInfo(coachId: string): Promise<JobCoach | null> {
    try {
      const response = await fetch(`/api/exports/job-coach-personal-info/${coachId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        return await response.json();
      } else {
        console.error('Failed to fetch job coach personal info');
        return null;
      }
    } catch (error) {
      console.error('Error fetching job coach personal info:', error);
      return null;
    }
  }

  // Helper to create custom timesheet with different categories
  static async createCustomTimesheet(
    payPeriod: Date,
    jobCoach: JobCoach,
    customCategories: string[],
    payPeriodStart?: Date,
    payPeriodEnd?: Date
  ): Promise<ExcelJS.Workbook> {
    return this.createPersonalTimesheet(payPeriod, jobCoach, {
      categories: customCategories,
      payPeriodStart,
      payPeriodEnd
    });
  }
}