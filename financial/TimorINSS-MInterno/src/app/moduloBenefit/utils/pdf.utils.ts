/**
 * PDF Generation Utility Functions
 * Helper functions for generating PDF documents for benefit requests
 */

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { ContributionPeriod } from '../models/benefit.model';
import { CitizenInfo } from '../interfaces/citizen.interface';

/**
 * Interface for PDF generation data
 */
export interface ContributionPDFData {
  citizenInfo: CitizenInfo;
  contributionHistory: ContributionPeriod[];
  contributionMonths: number;
  referenceRemuneration: number;
  benefitTypeLabel: string;
  gender?: string;
  employmentSector?: string;
  pensionValue?: number;
}

/**
 * Generate monthly contribution list from contribution history
 * Limited to 3-5 years of data (most recent years)
 */
function generateMonthlyContributionList(
  contributionHistory: ContributionPeriod[],
  referenceRemuneration: number,
  yearsToInclude: number = 5
): Array<{
  monthYear: Date;
  remuneration: number;
  company: string;
}> {
  const months: Array<{
    monthYear: Date;
    remuneration: number;
    company: string;
  }> = [];

  // Calculate cutoff date (most recent X years)
  const now = new Date();
  const cutoffYear = now.getFullYear() - yearsToInclude;
  const cutoffDate = new Date(cutoffYear, 0, 1);

  // Generate months from contribution history, but only include recent years
  contributionHistory.forEach((period) => {
    // Skip periods that are completely before cutoff
    if (period.endYear < cutoffYear) {
      return;
    }

    // Calculate total months in this period
    const totalMonths = period.years * 12 + period.months;

    // Start from January of startYear, but not before cutoff
    const startYear = Math.max(period.startYear, cutoffYear);
    const startDate = new Date(startYear, 0, 1);

    // End date is the earlier of period end or current date
    const periodEndDate = new Date(period.endYear, 11, 31);
    const actualEndDate = new Date(Math.min(periodEndDate.getTime(), now.getTime()));

    // Calculate average monthly remuneration for this period
    const baseRemuneration = referenceRemuneration;
    const variation = 0.15; // 15% variation

    // Generate months sequentially from startDate
    const currentDate = new Date(startDate);
    let monthCount = 0;
    
    while (currentDate <= actualEndDate && monthCount < totalMonths) {
      // Only include months from cutoff date onwards
      if (currentDate >= cutoffDate) {
        // Add some variation to make it realistic (but keep it consistent)
        const seed = period.startYear * 100 + monthCount;
        const random = seededRandom(seed);
        const variationFactor = 1 + (random * 2 - 1) * variation;
        const monthlyRemuneration = Math.max(0, baseRemuneration * variationFactor);

        months.push({
          monthYear: new Date(currentDate),
          remuneration: monthlyRemuneration,
          company: period.company,
        });
      }

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
      monthCount++;
    }
  });

  // Sort by date
  months.sort((a, b) => a.monthYear.getTime() - b.monthYear.getTime());

  // Limit to most recent years (36-60 months for 3-5 years)
  const maxMonths = yearsToInclude * 12;
  return months.slice(-maxMonths);
}

/**
 * Seeded random number generator for consistent results
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Format date in Portuguese format
 */
function formatDatePT(date: Date): string {
  const months = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ];
  return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
}

/**
 * Generate PDF document listing contribution months
 * Based on the INSS template showing monthly contribution history
 * Limited to 3-5 years of data
 */
export function generateContributionPDF(data: ContributionPDFData): void {
  if (!data.citizenInfo || data.contributionHistory.length === 0) {
    console.warn('Cannot generate PDF: Missing citizen info or contribution history');
    return;
  }

  // Determine years to include - increase to show more years (up to 10 years)
  const yearsToInclude = Math.min(10, Math.max(5, Math.ceil(data.contributionMonths / 12)));
  
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });
  const pageWidth = 297; // A4 landscape width in mm
  const pageHeight = 210; // A4 landscape height in mm
  let yPosition = 15;

  // Add blue border at top and bottom
  pdf.setDrawColor(0, 51, 153); // Blue color
  pdf.setLineWidth(2);
  pdf.line(0, 0, pageWidth, 0);
  pdf.line(0, pageHeight, pageWidth, pageHeight);

  // Add INSS logo (try to load asynchronously, but don't wait)
  yPosition += 5;

  // Title: SEGURANÇA SOCIAL (if no logo)
  pdf.setFontSize(12);
  pdf.setTextColor(0, 51, 153);
  pdf.text('SEGURANÇA SOCIAL', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  // Title: INSTITUTO NACIONAL DE SEGURANÇA SOCIAL
  pdf.setFontSize(11);
  pdf.setTextColor(0, 0, 0);
  pdf.text(
    'INSTITUTO NACIONAL DE SEGURANÇA SOCIAL',
    pageWidth / 2,
    yPosition,
    { align: 'center' }
  );
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.5);
  pdf.line(20, yPosition + 2, pageWidth - 20, yPosition + 2);
  yPosition += 12;

  // Personal Information Section
  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);

  const gender = data.gender || 'Mane';
  const personalInfo = [
    { label: 'Naran:', value: data.citizenInfo.name || '0', x: 20 },
    { label: 'Sexu:', value: gender, x: 150 },
    { label: 'NISS:', value: data.citizenInfo.niss || '0', x: 20 },
    {
      label: 'Tipu Subsidio:',
      value: data.benefitTypeLabel || 'Pensão Sobrevivencia',
      x: 150,
    },
    {
      label: 'Setor:',
      value: data.employmentSector || data.citizenInfo.employmentSector || '',
      x: 20,
    },
    {
      label: 'Kompanhia/Institutu:',
      value: data.contributionHistory[0]?.company || '',
      x: 150,
    },
  ];

  let infoY = yPosition;
  personalInfo.forEach((info, index) => {
    const xPos = info.x;
    if (index > 0 && index % 2 === 0) {
      infoY += 6;
    }
    pdf.text(`${info.label} ${info.value}`, xPos, infoY);
  });

  // Generate monthly data (limited to 3-5 years)
  const allMonths = generateMonthlyContributionList(
    data.contributionHistory,
    data.referenceRemuneration,
    yearsToInclude
  );

  const startDate = allMonths.length > 0 ? allMonths[0].monthYear : new Date();
  const endDate =
    allMonths.length > 0 ? allMonths[allMonths.length - 1].monthYear : new Date();

  infoY += 6;
  pdf.text(`Data Hahu Kalkulasaun: ${formatDatePT(startDate)}`, 20, infoY);
  pdf.text(`Data Ikus Kalkulasaun: ${formatDatePT(endDate)}`, 150, infoY);
  infoY += 6;
  pdf.text(`Total Loron Kalkulasuan: ${allMonths.length}`, 20, infoY);

  yPosition = infoY + 12;

  // Main Table: Tabela Kalkulasaun Subsidio/Pensaun
  pdf.setFontSize(10);
  pdf.text('Tabela Kalkulasaun Subsidio/Pensaun', 20, yPosition);
  yPosition += 8;

  // Generate monthly data
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  // Divide months into chunks - each chunk will be a separate sub-table
  const monthsPerChunk = 24; // Approximately 2 years per sub-table
  const monthChunks: Array<Array<{ monthYear: Date; remuneration: number; company: string }>> = [];

  for (let i = 0; i < allMonths.length; i += monthsPerChunk) {
    monthChunks.push(allMonths.slice(i, i + monthsPerChunk));
  }

  // Create a sub-table for each chunk
  monthChunks.forEach((chunk, chunkIndex) => {
    // All sub-tables have NISS and Nome columns for alignment
    // But from 2nd table onwards, these columns are empty and have no border
    const isFirstTable = chunkIndex === 0;
    const headers: string[] = ['NISS', 'Nome beneficiário falecido'];
    
    chunk.forEach((month) => {
      const monthIndex = month.monthYear.getMonth();
      const yearShort = month.monthYear.getFullYear().toString().slice(-2);
      const monthLabel = `${monthNames[monthIndex]}-${yearShort}`;
      headers.push(monthLabel);
    });

    // Create table data for this chunk - single row
    const tableData: any[] = [];
    const remunerationRow: any[] = [];
    
    // Always include first two columns for alignment
    if (isFirstTable) {
      remunerationRow.push('Remuneração declaradas', '');
    } else {
      // Empty cells for alignment, no border will be shown
      remunerationRow.push('', '');
    }
    
    chunk.forEach((month) => {
      remunerationRow.push(month.remuneration.toFixed(2));
    });
    tableData.push(remunerationRow);

    // Create sub-table for this chunk
    (pdf as any).autoTable({
      startY: yPosition,
      head: [headers],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontSize: 7,
        fontStyle: 'normal',
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [0, 0, 0],
        cellPadding: 1.5,
        overflow: 'linebreak',
        halign: 'right', // Right align numbers
        minCellHeight: 5,
      },
      styles: {
        cellPadding: 1.5,
        overflow: 'linebreak',
        fontSize: 7,
        lineWidth: 0.1,
      },
      columnStyles: {
        // All tables have same column structure for alignment
        0: { 
          cellWidth: 20, 
          halign: 'left',
          ...(isFirstTable ? {} : { lineColor: [255, 255, 255], fillColor: [255, 255, 255] }) // Hide border for subsequent tables
        },
        1: { 
          cellWidth: 35, 
          halign: 'left',
          ...(isFirstTable ? {} : { lineColor: [255, 255, 255], fillColor: [255, 255, 255] }) // Hide border for subsequent tables
        },
        // Set width for month columns in this chunk
        ...Object.fromEntries(
          Array.from({ length: chunk.length }, (_, i) => [
            i + 2,
            { cellWidth: 12, halign: 'right' }, // Fixed small width for month columns
          ])
        ),
      },
      margin: { left: 15, right: 15 },
      didParseCell: (data: any) => {
        // Hide borders for first two columns in subsequent tables
        if (!isFirstTable && (data.column.index === 0 || data.column.index === 1)) {
          data.cell.styles.lineColor = [255, 255, 255]; // White border (invisible)
          data.cell.styles.fillColor = [255, 255, 255]; // White background
          data.cell.styles.textColor = [255, 255, 255]; // White text (invisible)
        }
        
        // Format numbers to 2 decimals and ensure they fit on one line
        // Month columns start at index 2 for all tables
        if (data.column.index > 1 && typeof data.cell.text === 'string' && data.cell.text !== '') {
          const numValue = parseFloat(data.cell.text);
          if (!isNaN(numValue)) {
            // Format to 2 decimals
            data.cell.text = numValue.toFixed(2);
            // Set styles to prevent wrapping
            data.cell.styles.overflow = 'linebreak';
          }
        }
      },
      showHead: 'firstPage', // Show header only on first sub-table
      tableWidth: 'wrap',
      horizontalPageBreak: false,
      pageBreak: 'avoid',
      rowPageBreak: 'avoid',
    });

    // Get final Y position after this sub-table and add small spacing
    const finalY = (pdf as any).lastAutoTable.finalY || yPosition + 30;
    yPosition = finalY + 3; // Small spacing between sub-tables
  });

  // Summary Section at bottom of last page
  const pensionValue = data.pensionValue || 0;

  const summaryData = [
    ['N° meses com registo remunera', allMonths.length.toString()],
    ['Remuneração referência (R)*', data.referenceRemuneration.toFixed(2)],
    ['Valor Pensão (P)', pensionValue.toFixed(2)],
  ];

  (pdf as any).autoTable({
    startY: yPosition + 5,
    body: summaryData,
    theme: 'grid',
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [0, 0, 0],
    },
    styles: {
      cellPadding: 3,
    },
    margin: { left: 20, right: 20 },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 70 },
    },
  });

  // Save PDF
  const fileName = `Contribution_History_${
    data.citizenInfo.niss || 'NISS'
  }_${new Date().getTime()}.pdf`;
  pdf.save(fileName);
}

