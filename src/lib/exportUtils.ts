import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportColumn {
  key: string;
  header: string;
  width?: number;
}

export interface ExportOptions {
  filename: string;
  title?: string;
  subtitle?: string;
  columns: ExportColumn[];
  data: Record<string, unknown>[];
  totals?: Record<string, string | number>;
}

/**
 * Export data to Excel (.xlsx) file
 */
export function exportToExcel(options: ExportOptions): void {
  const { filename, title, columns, data, totals } = options;

  // Transform data to match column headers
  const exportData = data.map((row) => {
    const exportRow: Record<string, unknown> = {};
    columns.forEach((col) => {
      exportRow[col.header] = row[col.key];
    });
    return exportRow;
  });

  // Add totals row if provided
  if (totals) {
    const totalsRow: Record<string, unknown> = {};
    columns.forEach((col) => {
      totalsRow[col.header] = totals[col.key] ?? '';
    });
    exportData.push(totalsRow);
  }

  // Create workbook and worksheet
  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  
  // Set column widths
  const colWidths = columns.map((col) => ({ wch: col.width || 15 }));
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, title || 'Ledger');
  
  // Generate and download file
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Export data to PDF file
 */
export function exportToPDF(options: ExportOptions): void {
  const { filename, title, subtitle, columns, data, totals } = options;

  const doc = new jsPDF();
  
  // Add title
  if (title) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 20);
  }

  // Add subtitle
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 14, 28);
  }

  // Prepare table data
  const tableColumns = columns.map((col) => col.header);
  const tableRows = data.map((row) =>
    columns.map((col) => {
      const value = row[col.key];
      return value !== undefined && value !== null ? String(value) : '-';
    })
  );

  // Add totals row if provided
  if (totals) {
    const totalsRowData = columns.map((col) => {
      const value = totals[col.key];
      return value !== undefined && value !== null ? String(value) : '';
    });
    tableRows.push(totalsRowData);
  }

  // Generate table
  autoTable(doc, {
    head: [tableColumns],
    body: tableRows,
    startY: title ? (subtitle ? 35 : 28) : 14,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    footStyles: {
      fillColor: [229, 231, 235],
      fontStyle: 'bold',
    },
  });

  // Add generation date footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(
      `Generated on ${new Date().toLocaleDateString('en-IN')} | Page ${i} of ${pageCount}`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  doc.save(`${filename}.pdf`);
}

/**
 * Format currency for export
 */
export function formatCurrency(value: number | string, symbol = '₹'): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '-';
  return `${symbol}${num.toLocaleString('en-IN')}`;
}

/**
 * Format date for export
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
