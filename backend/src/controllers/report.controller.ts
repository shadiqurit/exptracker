import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { ReportService } from '../services/report.service.js';
import { AccountService } from '../services/account.service.js';
import { ExportService } from '../services/export.service.js';
import dayjs from 'dayjs';

export class ReportController {
  static async getDailyReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const dateStr = req.query.date as string | undefined;
      const accountId = req.query.accountId as string | undefined;
      const report = await ReportService.getDailyReport(req.user!.userId, dateStr, accountId);
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  static async getMonthlyReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const month = req.query.month ? parseInt(req.query.month as string, 10) : dayjs().month() + 1;
      const year = req.query.year ? parseInt(req.query.year as string, 10) : dayjs().year();
      const report = await ReportService.getMonthlyReport(req.user!.userId, month, year);
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  static async getYearlyReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const year = req.query.year ? parseInt(req.query.year as string, 10) : dayjs().year();
      const report = await ReportService.getYearlyReport(req.user!.userId, year);
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const report = await ReportService.getCategoryReport(req.user!.userId, startDate, endDate);
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  static async exportReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { reportType, format } = req.query;
      const userId = req.user!.userId;

      if (reportType === 'daily') {
        const dateStr = req.query.date as string | undefined;
        const report = await ReportService.getDailyReport(userId, dateStr);
        const headers = ['Date', 'Account', 'Category', 'Type', 'Description', 'Merchant', 'Income', 'Expense'];
        const rows = report.transactions.map((t) => [
          dayjs(t.date).format('YYYY-MM-DD HH:mm'),
          t.account,
          t.category,
          t.type,
          t.description,
          t.merchant,
          t.income,
          t.expense,
        ]);

        if (format === 'csv') {
          return ExportService.exportCsv(res, `daily_report_${report.date}`, headers, rows);
        } else if (format === 'excel') {
          const cols = headers.map((h) => ({ header: h, key: h.toLowerCase(), width: 18 }));
          const excelRows = report.transactions.map((t) => ({
            date: dayjs(t.date).format('YYYY-MM-DD HH:mm'),
            account: t.account,
            category: t.category,
            type: t.type,
            description: t.description,
            merchant: t.merchant,
            income: t.income,
            expense: t.expense,
          }));
          return await ExportService.exportExcel(res, `daily_report_${report.date}`, 'Daily Transactions', cols, excelRows);
        } else {
          return ExportService.exportPdf(
            res,
            'Daily Transaction Report',
            `Date: ${report.date} | Total Income: BDT ${report.totalIncome} | Total Expense: BDT ${report.totalExpense}`,
            headers,
            rows
          );
        }
      } else if (reportType === 'monthly') {
        const month = req.query.month ? parseInt(req.query.month as string, 10) : dayjs().month() + 1;
        const year = req.query.year ? parseInt(req.query.year as string, 10) : dayjs().year();
        const report = await ReportService.getMonthlyReport(userId, month, year);

        const headers = ['Account Name', 'Type', 'Opening Balance', 'Income', 'Expense', 'Net Transfers', 'Closing Balance'];
        const rows = report.accountBreakdown.map((a) => [
          a.name,
          a.type,
          a.openingBalance,
          a.income,
          a.expense,
          a.netTransfers,
          a.closingBalance,
        ]);

        if (format === 'csv') {
          return ExportService.exportCsv(res, `monthly_report_${year}_${month}`, headers, rows);
        } else if (format === 'excel') {
          const cols = [
            { header: 'Account Name', key: 'name', width: 22 },
            { header: 'Type', key: 'type', width: 16 },
            { header: 'Opening Balance', key: 'openingBalance', width: 16 },
            { header: 'Income', key: 'income', width: 14 },
            { header: 'Expense', key: 'expense', width: 14 },
            { header: 'Net Transfers', key: 'netTransfers', width: 16 },
            { header: 'Closing Balance', key: 'closingBalance', width: 16 },
          ];
          return await ExportService.exportExcel(res, `monthly_report_${year}_${month}`, 'Monthly Accounts', cols, report.accountBreakdown);
        } else {
          return ExportService.exportPdf(
            res,
            `Monthly Financial Report - ${report.monthName}`,
            `Net Income: BDT ${report.netIncome} | Closing Balance: BDT ${report.closingBalance}`,
            headers,
            rows
          );
        }
      } else if (reportType === 'yearly') {
        const year = req.query.year ? parseInt(req.query.year as string, 10) : dayjs().year();
        const report = await ReportService.getYearlyReport(userId, year);

        const headers = ['Month', 'Income', 'Expense', 'Net Savings'];
        const rows = report.monthlyBreakdown.map((m) => [m.month, m.income, m.expense, m.netSavings]);

        if (format === 'csv') {
          return ExportService.exportCsv(res, `yearly_report_${year}`, headers, rows);
        } else if (format === 'excel') {
          const cols = [
            { header: 'Month', key: 'month', width: 16 },
            { header: 'Income', key: 'income', width: 16 },
            { header: 'Expense', key: 'expense', width: 16 },
            { header: 'Net Savings', key: 'netSavings', width: 16 },
          ];
          return await ExportService.exportExcel(res, `yearly_report_${year}`, 'Yearly Summary', cols, report.monthlyBreakdown);
        } else {
          return ExportService.exportPdf(
            res,
            `Yearly Financial Report - ${year}`,
            `Yearly Income: BDT ${report.yearlyIncome} | Yearly Expense: BDT ${report.yearlyExpense} | Savings: BDT ${report.yearlyNetSavings}`,
            headers,
            rows
          );
        }
      } else if (reportType === 'category') {
        const report = await ReportService.getCategoryReport(userId);
        const headers = ['Category', 'Total Amount', 'Transactions Count', 'Percentage'];
        const rows = report.categories.map((c) => [c.name, c.total, c.count, `${c.percentage}%`]);

        if (format === 'csv') {
          return ExportService.exportCsv(res, `category_report`, headers, rows);
        } else if (format === 'excel') {
          const cols = [
            { header: 'Category', key: 'name', width: 22 },
            { header: 'Total Amount', key: 'total', width: 16 },
            { header: 'Transactions Count', key: 'count', width: 18 },
            { header: 'Percentage', key: 'percentage', width: 14 },
          ];
          return await ExportService.exportExcel(res, `category_report`, 'Categories', cols, report.categories);
        } else {
          return ExportService.exportPdf(
            res,
            'Category Expense Report',
            `Period: ${report.startDate} to ${report.endDate} | Total: BDT ${report.totalExpense}`,
            headers,
            rows
          );
        }
      } else if (reportType === 'account') {
        const accountId = req.query.accountId as string;
        if (!accountId) {
          return res.status(400).json({ success: false, message: 'Account ID required for account statement' });
        }
        const statement = await AccountService.getAccountStatement(accountId, userId);
        const headers = ['Date', 'Type', 'Direction', 'Description', 'Amount', 'Running Balance'];
        const rows = statement.statements.map((s) => [
          dayjs(s.date).format('YYYY-MM-DD HH:mm'),
          s.type,
          s.direction,
          s.description || '-',
          s.amount,
          s.runningBalance,
        ]);

        if (format === 'csv') {
          return ExportService.exportCsv(res, `account_statement_${statement.account.name}`, headers, rows);
        } else if (format === 'excel') {
          const cols = [
            { header: 'Date', key: 'date', width: 18 },
            { header: 'Type', key: 'type', width: 16 },
            { header: 'Direction', key: 'direction', width: 12 },
            { header: 'Description', key: 'description', width: 25 },
            { header: 'Amount', key: 'amount', width: 14 },
            { header: 'Running Balance', key: 'runningBalance', width: 16 },
          ];
          return await ExportService.exportExcel(res, `account_statement_${statement.account.name}`, 'Statement', cols, statement.statements);
        } else {
          return ExportService.exportPdf(
            res,
            `Account Statement - ${statement.account.name}`,
            `Opening: BDT ${statement.periodOpeningBalance} | Closing: BDT ${statement.periodClosingBalance}`,
            headers,
            rows
          );
        }
      } else {
        return res.status(400).json({ success: false, message: 'Invalid reportType' });
      }
    } catch (error) {
      next(error);
    }
  }
}
