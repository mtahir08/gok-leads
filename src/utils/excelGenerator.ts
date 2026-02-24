import * as XLSX from 'xlsx';
import { ParseResult } from './pdfParser';

export function downloadAsExcel(data: ParseResult, columns?: string[], filename?: string): void {
  const cols = columns || data.columns;
  const rows = data.rows.map((row) => {
    const filtered: Record<string, string> = {};
    cols.forEach((col) => { filtered[col] = row[col] || ''; });
    return filtered;
  });

  const ws = XLSX.utils.json_to_sheet(rows, { header: cols });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');

  ws['!cols'] = cols.map(() => ({ wch: 30 }));

  const outputFilename = filename || `pdf-data-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, outputFilename);
}
