// app/dashboard/[id]/exports/ClientPersonalTimesheetTemplate.ts
import * as ExcelJS from 'exceljs';
import { format, startOfMonth, endOfMonth, getDaysInMonth } from 'date-fns';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  client_id?: string;
}

interface WorkCategory {
  id: string;
  name: string;
  description?: string;
}

interface ClientTimesheetConfig {
  workCategories: WorkCategory[];
  payPeriodStart: Date;
  payPeriodEnd: Date;
  includeSignatures: boolean;
}

export class ClientPersonalTimesheetTemplate {
  
  private static readonly DEFAULT_WORK_CATEGORIES = [
    { id: '1', name: 'TOTAL ALL HOURS' },
    { id: '2', name: 'Housewares' },
    { id: '3', name: 'Clothing' },
    { id: '4', name: 'Electronics' },
    { id: '5', name: 'Books' },
    { id: '6', name: 'Donations Processing' },
    { id: '7', name: 'Textile Work' },
    { id: '8', name: 'Transportation' },
    { id: '9', name: 'Administrative Tasks' },
    { id: '10', name: 'Break Time' },
    { id: '11', name: 'Training' },
    { id: '12', name: 'Other Activities' }
  ];

  static async createClientTimesheet(
    payPeriod: Date,
    client: Client,
    config?: Partial<ClientTimesheetConfig>
  ): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Client Timesheet');

    const startDate = config?.payPeriodStart || startOfMonth(payPeriod);
    const endDate = config?.payPeriodEnd || endOfMonth(payPeriod);
    const workCategories = config?.workCategories || this.DEFAULT_WORK_CATEGORIES;
    
    const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const maxDays = Math.min(daysInPeriod, 31); // Cap at 31 for layout

    // Set up column widths
    worksheet.getColumn(1).width = 25; // Work categories column
    for (let i = 2; i <= maxDays + 1; i++) {
      worksheet.getColumn(i).width = 4; // Day columns
    }

    let currentRow = 1;

    // Client Name Header
    const nameHeaderRow = worksheet.getRow(currentRow);
    nameHeaderRow.getCell(1).value = `Client Name: ${client.first_name} ${client.last_name}`;
    worksheet.mergeCells(`A${currentRow}:${String.fromCharCode(65 + maxDays)}${currentRow}`);
    nameHeaderRow.getCell(1).style = {
      font: { bold: true, size: 14 },
      alignment: { horizontal: 'left', vertical: 'middle' },
      border: {
        top: { style: 'thick' },
        left: { style: 'thick' },
        bottom: { style: 'medium' },
        right: { style: 'thick' }
      }
    };
    nameHeaderRow.height = 30;
    currentRow++;

    // Specialization Row
    const specializationRow = worksheet.getRow(currentRow);
    specializationRow.getCell(1).value = `Specialization: ${client.specialization}`;
    worksheet.mergeCells(`A${currentRow}:${String.fromCharCode(65 + maxDays)}${currentRow}`);
    specializationRow.getCell(1).style = {
      font: { bold: true, size: 12 },
      alignment: { horizontal: 'left', vertical: 'middle' },
      border: {
        top: { style: 'medium' },
        left: { style: 'thick' },
        bottom: { style: 'medium' },
        right: { style: 'thick' }
      }
    };
    specializationRow.height = 25;
    currentRow++;

    // Pay Period Row
    const periodRow = worksheet.getRow(currentRow);
    periodRow.getCell(1).value = `Pay Period: ${format(startDate, 'MM/dd/yyyy')} - ${format(endDate, 'MM/dd/yyyy')}`;
    worksheet.mergeCells(`A${currentRow}:${String.fromCharCode(65 + maxDays)}${currentRow}`);
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

    // Day Headers Row
    const dayHeaderRow = worksheet.getRow(currentRow);
    dayHeaderRow.getCell(1).value = 'Work Activities';
    
    // Add day numbers
    for (let day = 1; day <= maxDays; day++) {
      dayHeaderRow.getCell(day + 1).value = day;
    }

    // Style day headers
    dayHeaderRow.getCell(1).style = {
      font: { bold: true, size: 11 },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'thick' },
        left: { style: 'thick' },
        bottom: { style: 'medium' },
        right: { style: 'thin' }
      },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6E6' } }
    };

    for (let day = 1; day <= maxDays; day++) {
      dayHeaderRow.getCell(day + 1).style = {
        font: { bold: true, size: 10 },
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

    dayHeaderRow.height = 25;
    currentRow++;

    // Work Category Rows
    workCategories.forEach((category, index) => {
      const categoryRow = worksheet.getRow(currentRow);
      
      // Category name
      categoryRow.getCell(1).value = category.name;
      categoryRow.getCell(1).style = {
        font: { 
          bold: category.name === 'TOTAL ALL HOURS', 
          size: category.name === 'TOTAL ALL HOURS' ? 11 : 10 
        },
        alignment: { horizontal: 'left', vertical: 'middle' },
        border: {
          top: { style: 'thin' },
          left: { style: 'thick' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        },
        fill: category.name === 'TOTAL ALL HOURS' ? 
          { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFE0' } } : undefined
      };

      // Day columns
      for (let day = 1; day <= maxDays; day++) {
        const cell = categoryRow.getCell(day + 1);
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
        if (category.name === 'TOTAL ALL HOURS' && day <= maxDays) {
          const columnLetter = String.fromCharCode(65 + day);
          const startRow = currentRow + 1;
          const endRow = currentRow + workCategories.length - 1;
          cell.value = {
            formula: `SUM(${columnLetter}${startRow}:${columnLetter}${endRow})`
          };
          cell.style = {
            ...cell.style,
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFE0' } }
          };
        }
      }
      
      categoryRow.height = 22;
      currentRow++;
    });

    // Bottom border for last category row
    const lastCategoryRow = worksheet.getRow(currentRow - 1);
    for (let col = 1; col <= maxDays + 1; col++) {
      const cell = lastCategoryRow.getCell(col);
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

    // Add totals row
    currentRow += 1;
    const totalsRow = worksheet.getRow(currentRow);
    totalsRow.getCell(1).value = 'WEEKLY TOTALS';
    totalsRow.getCell(1).style = {
      font: { bold: true, size: 11 },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'medium' },
        left: { style: 'thick' },
        bottom: { style: 'medium' },
        right: { style: 'thin' }
      },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } }
    };

    // Add weekly total formulas (every 7 days)
    for (let week = 0; week < Math.ceil(maxDays / 7); week++) {
      const startDay = week * 7 + 1;
      const endDay = Math.min(startDay + 6, maxDays);
      const weekCol = Math.floor((startDay + endDay) / 2) + 1;
      
      if (weekCol <= maxDays + 1) {
        const cell = totalsRow.getCell(weekCol);
        const startCol = String.fromCharCode(65 + startDay);
        const endCol = String.fromCharCode(65 + endDay);
        const totalRow = 5; // TOTAL ALL HOURS row
        
        cell.value = {
          formula: `SUM(${startCol}${totalRow}:${endCol}${totalRow})`
        };
        cell.style = {
          font: { bold: true },
          border: {
            top: { style: 'medium' },
            left: { style: 'thin' },
            bottom: { style: 'medium' },
            right: { style: 'thin' }
          },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } },
          alignment: { horizontal: 'center', vertical: 'middle' }
        };
      }
    }

    totalsRow.height = 25;

    // Signature Section (if enabled)
    if (config?.includeSignatures !== false) {
      currentRow += 3;
      
      const clientSigRow = worksheet.getRow(currentRow);
      clientSigRow.getCell(1).value = 'Client Signature:';
      clientSigRow.getCell(1).style = {
        font: { bold: true, size: 11 },
        alignment: { horizontal: 'left', vertical: 'middle' }
      };
      
      const dateSigCol = Math.floor(maxDays / 2) + 1;
      clientSigRow.getCell(dateSigCol).value = 'Date:';
      clientSigRow.getCell(dateSigCol).style = {
        font: { bold: true, size: 11 },
        alignment: { horizontal: 'left', vertical: 'middle' }
      };

      currentRow += 2;
      
      const coachSigRow = worksheet.getRow(currentRow);
      coachSigRow.getCell(1).value = 'Job Coach Signature:';
      coachSigRow.getCell(1).style = {
        font: { bold: true, size: 11 },
        alignment: { horizontal: 'left', vertical: 'middle' }
      };
      
      coachSigRow.getCell(dateSigCol).value = 'Date:';
      coachSigRow.getCell(dateSigCol).style = {
        font: { bold: true, size: 11 },
        alignment: { horizontal: 'left', vertical: 'middle' }
      };
    }

    return workbook;
  }

  // Helper method to fetch client info
  static async fetchClientInfo(clientId: string): Promise<Client | null> {
    try {
      const response = await fetch(`/api/exports/client-info/${clientId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        return await response.json();
      } else {
        console.error('Failed to fetch client info');
        return null;
      }
    } catch (error) {
      console.error('Error fetching client info:', error);
      return null;
    }
  }

  // Helper method to fetch work categories by specialization
  static async fetchWorkCategoriesBySpecialization(specialization: string): Promise<WorkCategory[]> {
    try {
      const response = await fetch(`/api/exports/work-categories/${encodeURIComponent(specialization)}`, {
        credentials: 'include'
      });

      if (response.ok) {
        return await response.json();
      } else {
        console.warn('Failed to fetch work categories, using defaults');
        return this.DEFAULT_WORK_CATEGORIES;
      }
    } catch (error) {
      console.error('Error fetching work categories:', error);
      return this.DEFAULT_WORK_CATEGORIES;
    }
  }

  // Create timesheet with custom work categories based on client's specialization
  static async createSpecializedClientTimesheet(
    payPeriod: Date,
    client: Client,
    payPeriodStart?: Date,
    payPeriodEnd?: Date
  ): Promise<ExcelJS.Workbook> {
    const workCategories = await this.fetchWorkCategoriesBySpecialization(client.specialization);
    
    return this.createClientTimesheet(payPeriod, client, {
      workCategories,
      payPeriodStart,
      payPeriodEnd,
      includeSignatures: true
    });
  }
}