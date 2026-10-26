import { prisma } from '../config/prisma.js';
import { TransactionType, LedgerDirection, LedgerEntryType } from '@prisma/client';
import { AccountService } from './account.service.js';
import dayjs from 'dayjs';

export class ReportService {
  /**
   * Daily Transaction Report: Detailed transactions with running balance
   */
  static async getDailyReport(userId: string, dateStr?: string, accountId?: string) {
    const targetDate = dateStr ? dayjs(dateStr) : dayjs();
    const startOfDay = targetDate.startOf('day').toDate();
    const endOfDay = targetDate.endOf('day').toDate();

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: { gte: startOfDay, lte: endOfDay },
        ...(accountId ? { accountId } : {}),
      },
      include: {
        account: true,
        category: true,
      },
      orderBy: { transactionDate: 'asc' },
    });

    let totalIncome = 0;
    let totalExpense = 0;

    const items = transactions.map((t) => {
      const amt = Number(t.amount);
      const isIncome = t.type === TransactionType.INCOME;
      if (isIncome) totalIncome += amt;
      else totalExpense += amt;

      return {
        id: t.id,
        date: t.transactionDate,
        account: t.account.name,
        category: t.category.name,
        type: t.type,
        description: t.description || '-',
        merchant: t.merchant || '-',
        income: isIncome ? amt : 0,
        expense: !isIncome ? amt : 0,
      };
    });

    return {
      date: targetDate.format('YYYY-MM-DD'),
      totalIncome: Number(totalIncome.toFixed(2)),
      totalExpense: Number(totalExpense.toFixed(2)),
      net: Number((totalIncome - totalExpense).toFixed(2)),
      transactions: items,
    };
  }

  /**
   * Monthly Financial Report: Opening Balance, Total Income, Total Expense, Net Income, Closing Balance, Account-wise Breakdown
   */
  static async getMonthlyReport(userId: string, month: number, year: number) {
    const startOfMonth = dayjs(`${year}-${month}-01`).startOf('month').toDate();
    const endOfMonth = dayjs(`${year}-${month}-01`).endOf('month').toDate();

    // 1. Calculate combined Opening Balance across all accounts as of startOfMonth
    const accounts = await prisma.account.findMany({ where: { userId } });
    let totalOpeningBalance = 0;
    let totalClosingBalance = 0;

    const accountBreakdown = await Promise.all(
      accounts.map(async (acc) => {
        // Prior credits & debits before startOfMonth
        const priorCr = await prisma.ledgerEntry.aggregate({
          where: { accountId: acc.id, userId, entryDate: { lt: startOfMonth }, direction: LedgerDirection.CREDIT },
          _sum: { amount: true },
        });
        const priorDr = await prisma.ledgerEntry.aggregate({
          where: { accountId: acc.id, userId, entryDate: { lt: startOfMonth }, direction: LedgerDirection.DEBIT },
          _sum: { amount: true },
        });

        const hasOpeningInLedger = await prisma.ledgerEntry.findFirst({
          where: { accountId: acc.id, userId, entryType: LedgerEntryType.OPENING_BALANCE, entryDate: { lt: startOfMonth } },
        });

        let opening = (priorCr._sum.amount ? Number(priorCr._sum.amount) : 0) -
                      (priorDr._sum.amount ? Number(priorDr._sum.amount) : 0);
        if (!hasOpeningInLedger) {
          opening += Number(acc.openingBalance);
        }

        // Current month's movements
        const monthIncomeAgg = await prisma.transaction.aggregate({
          where: { accountId: acc.id, userId, type: TransactionType.INCOME, transactionDate: { gte: startOfMonth, lte: endOfMonth } },
          _sum: { amount: true },
        });
        const monthExpenseAgg = await prisma.transaction.aggregate({
          where: { accountId: acc.id, userId, type: TransactionType.EXPENSE, transactionDate: { gte: startOfMonth, lte: endOfMonth } },
          _sum: { amount: true },
        });

        // Net transfers
        const trfIn = await prisma.ledgerEntry.aggregate({
          where: { accountId: acc.id, userId, entryType: LedgerEntryType.TRANSFER_IN, entryDate: { gte: startOfMonth, lte: endOfMonth } },
          _sum: { amount: true },
        });
        const trfOut = await prisma.ledgerEntry.aggregate({
          where: { accountId: acc.id, userId, entryType: LedgerEntryType.TRANSFER_OUT, entryDate: { gte: startOfMonth, lte: endOfMonth } },
          _sum: { amount: true },
        });

        const income = monthIncomeAgg._sum.amount ? Number(monthIncomeAgg._sum.amount) : 0;
        const expense = monthExpenseAgg._sum.amount ? Number(monthExpenseAgg._sum.amount) : 0;
        const netTransfers = (trfIn._sum.amount ? Number(trfIn._sum.amount) : 0) -
                             (trfOut._sum.amount ? Number(trfOut._sum.amount) : 0);
        const closing = opening + income - expense + netTransfers;

        totalOpeningBalance += opening;
        totalClosingBalance += closing;

        return {
          id: acc.id,
          name: acc.name,
          type: acc.type,
          currency: acc.currency,
          openingBalance: Number(opening.toFixed(2)),
          income: Number(income.toFixed(2)),
          expense: Number(expense.toFixed(2)),
          netTransfers: Number(netTransfers.toFixed(2)),
          closingBalance: Number(closing.toFixed(2)),
        };
      })
    );

    // Month totals
    const totalIncome = accountBreakdown.reduce((sum, a) => sum + a.income, 0);
    const totalExpense = accountBreakdown.reduce((sum, a) => sum + a.expense, 0);
    const netIncome = totalIncome - totalExpense;

    // Category breakdown
    const categoryExpenses = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: TransactionType.EXPENSE,
        transactionDate: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
      _count: { id: true },
    });

    const categoriesWithDetails = await Promise.all(
      categoryExpenses.map(async (c) => {
        const cat = await prisma.category.findUnique({ where: { id: c.categoryId } });
        const total = c._sum.amount ? Number(c._sum.amount) : 0;
        return {
          id: c.categoryId,
          name: cat ? cat.name : 'Unknown',
          icon: cat?.icon || 'pi pi-tag',
          color: cat?.color || '#EF4444',
          total: Number(total.toFixed(2)),
          count: c._count.id,
          percentage: totalExpense > 0 ? Number(((total / totalExpense) * 100).toFixed(1)) : 0,
        };
      })
    );
    categoriesWithDetails.sort((a, b) => b.total - a.total);

    return {
      month,
      year,
      monthName: dayjs(startOfMonth).format('MMMM YYYY'),
      openingBalance: Number(totalOpeningBalance.toFixed(2)),
      totalIncome: Number(totalIncome.toFixed(2)),
      totalExpense: Number(totalExpense.toFixed(2)),
      netIncome: Number(netIncome.toFixed(2)),
      closingBalance: Number(totalClosingBalance.toFixed(2)),
      accountBreakdown,
      categoryExpenses: categoriesWithDetails,
    };
  }

  /**
   * Yearly Financial Report: Jan-Dec Monthly Income, Expense, Net Savings, Yearly Totals
   */
  static async getYearlyReport(userId: string, year: number) {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    let yearlyIncome = 0;
    let yearlyExpense = 0;

    const monthlyBreakdown = await Promise.all(
      months.map(async (m) => {
        const start = dayjs(`${year}-${m}-01`).startOf('month').toDate();
        const end = dayjs(`${year}-${m}-01`).endOf('month').toDate();

        const [inc, exp] = await Promise.all([
          prisma.transaction.aggregate({
            where: { userId, type: TransactionType.INCOME, transactionDate: { gte: start, lte: end } },
            _sum: { amount: true },
          }),
          prisma.transaction.aggregate({
            where: { userId, type: TransactionType.EXPENSE, transactionDate: { gte: start, lte: end } },
            _sum: { amount: true },
          }),
        ]);

        const income = inc._sum.amount ? Number(inc._sum.amount) : 0;
        const expense = exp._sum.amount ? Number(exp._sum.amount) : 0;
        const netSavings = income - expense;

        yearlyIncome += income;
        yearlyExpense += expense;

        return {
          month: dayjs(start).format('MMMM'),
          monthShort: dayjs(start).format('MMM'),
          monthNumber: m,
          income: Number(income.toFixed(2)),
          expense: Number(expense.toFixed(2)),
          netSavings: Number(netSavings.toFixed(2)),
        };
      })
    );

    return {
      year,
      yearlyIncome: Number(yearlyIncome.toFixed(2)),
      yearlyExpense: Number(yearlyExpense.toFixed(2)),
      yearlyNetSavings: Number((yearlyIncome - yearlyExpense).toFixed(2)),
      monthlyBreakdown,
    };
  }

  /**
   * Category-Wise Expense Report
   */
  static async getCategoryReport(userId: string, startDate?: Date, endDate?: Date) {
    const start = startDate || dayjs().startOf('year').toDate();
    const end = endDate || dayjs().endOf('year').toDate();

    const categoryAgg = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: TransactionType.EXPENSE,
        transactionDate: { gte: start, lte: end },
      },
      _sum: { amount: true },
      _count: { id: true },
    });

    const totalExpense = categoryAgg.reduce((sum, c) => sum + (c._sum.amount ? Number(c._sum.amount) : 0), 0);

    const categories = await Promise.all(
      categoryAgg.map(async (c) => {
        const cat = await prisma.category.findUnique({ where: { id: c.categoryId } });
        const total = c._sum.amount ? Number(c._sum.amount) : 0;
        return {
          id: c.categoryId,
          name: cat ? cat.name : 'Unknown',
          icon: cat?.icon || 'pi pi-tag',
          color: cat?.color || '#EF4444',
          total: Number(total.toFixed(2)),
          count: c._count.id,
          percentage: totalExpense > 0 ? Number(((total / totalExpense) * 100).toFixed(1)) : 0,
        };
      })
    );

    categories.sort((a, b) => b.total - a.total);

    return {
      startDate: dayjs(start).format('YYYY-MM-DD'),
      endDate: dayjs(end).format('YYYY-MM-DD'),
      totalExpense: Number(totalExpense.toFixed(2)),
      categories,
    };
  }
}
