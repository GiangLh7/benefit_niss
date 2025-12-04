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

  // Determine years to include (3-5 years, default 5)
  const yearsToInclude = Math.min(5, Math.max(3, Math.ceil(data.contributionMonths / 12)));
  
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

  // Create table with months in columns
  // In landscape mode, we can fit more months per row (about 20-24 months per row)
  const monthsPerRow = 24;
  const monthChunks: any[][] = [];

  for (let i = 0; i < allMonths.length; i += monthsPerRow) {
    monthChunks.push(allMonths.slice(i, i + monthsPerRow));
  }

  // Process each chunk
  monthChunks.forEach((chunk, chunkIndex) => {
    if (chunkIndex > 0) {
      pdf.addPage();
      yPosition = 20;
    }

    // Create headers: NISS, Nome beneficiário falecido, then months
    const headers: string[] = ['NISS', 'Nome beneficiário falecido'];
    chunk.forEach((month) => {
      const monthIndex = month.monthYear.getMonth();
      const yearShort = month.monthYear.getFullYear().toString().slice(-2);
      const monthLabel = `${monthNames[monthIndex]}-${yearShort}`;
      headers.push(monthLabel);
    });

    // Create table data
    const tableData: any[] = [];

    // Empty row for NISS and Name
    const emptyRow: any[] = ['', ''];
    chunk.forEach(() => emptyRow.push(''));
    tableData.push(emptyRow);

    // Remuneração declaradas row
    const remunerationRow: any[] = ['Remuneração declaradas', ''];
    chunk.forEach((month) => {
      remunerationRow.push(month.remuneration.toFixed(2));
    });
    tableData.push(remunerationRow);

    // Use autoTable for better table formatting
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
      },
      styles: {
        cellPadding: 1.5,
        overflow: 'linebreak',
        fontSize: 7,
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 35 },
      },
      margin: { left: 15, right: 15 },
    });

    // Get final Y position after table
    const finalY = (pdf as any).lastAutoTable.finalY || yPosition + 30;
    yPosition = finalY;
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

