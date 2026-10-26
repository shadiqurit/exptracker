import ExcelJS from 'exceljs';
import { stringify } from 'csv-stringify';
import PDFDocument from 'pdfkit';
import { Response } from 'express';
import dayjs from 'dayjs';

export class ExportService {
  /**
   * Export array of flat data to CSV
   */
  static exportCsv(res: Response, filename: string, headers: string[], rows: any[][]) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);

    const stringifier = stringify({ header: true, columns: headers });
    stringifier.pipe(res);
    rows.forEach((row) => stringifier.write(row));
    stringifier.end();
  }

  /**
   * Export tabular data to styled Excel workbook
   */
  static async exportExcel(
    res: Response,
    filename: string,
    sheetName: string,
    columns: { header: string; key: string; width: number }[],
    rows: any[]
  ) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Expense Tracker';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet(sheetName);

    worksheet.columns = columns;

    // Header styling
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' },
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Add data
    rows.forEach((row) => {
      worksheet.addRow(row);
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  }

  /**
   * Export standard financial report to PDF
   */
  static exportPdf(
    res: Response,
    title: string,
    subtitle: string,
    headers: string[],
    rows: (string | number)[][]
  ) {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_').toLowerCase()}.pdf"`);

    doc.pipe(res);

    // Document Header
    doc.fillColor('#0F172A').fontSize(20).text(title, { align: 'center' });
    doc.moveDown(0.3);
    doc.fillColor('#64748B').fontSize(11).text(subtitle, { align: 'center' });
    doc.text(`Generated on: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`, { align: 'center' });
    doc.moveDown(1.5);

    // Table settings
    const pageWidth = doc.page.width - 80;
    const colWidth = pageWidth / headers.length;
    let y = doc.y;

    // Table Header
    doc.rect(40, y, pageWidth, 22).fill('#1E293B');
    headers.forEach((header, idx) => {
      doc.fillColor('#FFFFFF').fontSize(10).text(header, 40 + idx * colWidth + 5, y + 6, {
        width: colWidth - 10,
        align: 'left',
      });
    });

    y += 24;

    // Rows
    rows.forEach((row, rIdx) => {
      // Check for page break
      if (y > doc.page.height - 60) {
        doc.addPage();
        y = 40;
      }

      if (rIdx % 2 === 1) {
        doc.rect(40, y, pageWidth, 18).fill('#F8FAFC');
      }

      row.forEach((cell, cIdx) => {
        doc.fillColor('#334155').fontSize(9).text(String(cell), 40 + cIdx * colWidth + 5, y + 4, {
          width: colWidth - 10,
          align: 'left',
        });
      });

      y += 18;
    });

    doc.end();
  }
}
