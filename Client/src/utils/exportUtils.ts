import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Extend jsPDF types for autotable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

/**
 * Exports data to a formatted PDF with school headers.
 */
export function exportToPDF(
  title: string,
  headers: string[],
  rows: any[][],
  fileName: string,
  schoolName: string = 'Savitri Vidya Vihar'
) {
  const doc = new jsPDF() as jsPDFWithAutoTable;

  // Add School Name
  doc.setFontSize(20);
  doc.setTextColor(11, 94, 215); // #0B5ED7
  doc.setFont('helvetica', 'bold');
  doc.text(schoolName, 14, 20);

  // Add School Affiliation & Info
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.setFont('helvetica', 'normal');
  doc.text('CBSE Affiliated School | Bhanpur, Basti, Uttar Pradesh, India', 14, 26);
  
  // Add Report Title
  doc.setFontSize(14);
  doc.setTextColor(33, 37, 41); // Slate 900
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 38);

  // Add Date Generated
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 14, 44);

  // Draw a horizontal divider line
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 48, 196, 48);

  // Generate AutoTable
  doc.autoTable({
    startY: 52,
    head: [headers],
    body: rows,
    theme: 'striped',
    headStyles: {
      fillColor: [11, 94, 215], // #0B5ED7 Primary
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [33, 37, 41]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // #F8FAFC
    },
    margin: { top: 50, left: 14, right: 14 }
  });

  // Save the document
  doc.save(`${fileName}.pdf`);
}

/**
 * Exports JSON data to Excel (.xlsx) file.
 */
export function exportToExcel(
  data: any[],
  fileName: string,
  sheetName: string = 'Attendance Report'
) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Auto-fit column widths
  const maxProps = Object.keys(data[0] || {}).map(key => {
    return {
      wch: Math.max(
        key.length,
        ...data.map(item => String(item[key] ?? '').length)
      ) + 3
    };
  });
  worksheet['!cols'] = maxProps;

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

/**
 * Exports data to CSV (.csv) file.
 */
export function exportToCSV(
  headers: string[],
  rows: any[][],
  fileName: string
) {
  const content = [
    headers.join(','),
    ...rows.map(row => 
      row.map(cell => {
        const val = String(cell ?? '');
        // Escape quotes
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
