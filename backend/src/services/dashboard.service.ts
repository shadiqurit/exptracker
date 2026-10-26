import { prisma } from '../config/prisma.js';
import { TransactionType, LedgerDirection, LedgerEntryType } from '@prisma/client';
import { AccountService } from './account.service.js';
import dayjs from 'dayjs';

export class DashboardService {
  static async getSummary(
    userId: string,
    filters?: {
      startDate?: string;
      endDate?: string;
      accountId?: string;
      categoryId?: string;
    }
  ) {
    const now = dayjs();
    const startOfMonth = now.startOf('month').toDate();
    const endOfMonth = now.endOf('month').toDate();
    const startOfYear = now.startOf('year').toDate();
    const endOfYear = now.endOf('year').toDate();

    // 1. Total Account Balance across active accounts
    const accounts = await AccountService.getAccounts(userId, false);
    const totalAccountBalance = accounts.reduce((acc, a) => acc + a.currentBalance, 0);

    // 2. Month Income & Expense
    const monthIncomeAgg = await prisma.transaction.aggregate({
      where: {
        userId,
        type: TransactionType.INCOME,
        transactionDate: { gte: startOfMonth, lte: endOfMonth },
        ...(filters?.accountId ? { accountId: filters.accountId } : {}),
      },
      _sum: { amount: true },
    });

    const monthExpenseAgg = await prisma.transaction.aggregate({
      where: {
        userId,
        type: TransactionType.EXPENSE,
        transactionDate: { gte: startOfMonth, lte: endOfMonth },
        ...(filters?.accountId ? { accountId: filters.accountId } : {}),
      },
      _sum: { amount: true },
    });

    const totalIncomeThisMonth = monthIncomeAgg._sum.amount ? Number(monthIncomeAgg._sum.amount) : 0;
    const totalExpensesThisMonth = monthExpenseAgg._sum.amount ? Number(monthExpenseAgg._sum.amount) : 0;
    const netSavingsThisMonth = totalIncomeThisMonth - totalExpensesThisMonth;

    // 3. Year Income & Expense
    const yearIncomeAgg = await prisma.transaction.aggregate({
      where: {
        userId,
        type: TransactionType.INCOME,
        transactionDate: { gte: startOfYear, lte: endOfYear },
        ...(filters?.accountId ? { accountId: filters.accountId } : {}),
      },
      _sum: { amount: true },
    });

    const yearExpenseAgg = await prisma.transaction.aggregate({
      where: {
        userId,
        type: TransactionType.EXPENSE,
        transactionDate: { gte: startOfYear, lte: endOfYear },
        ...(filters?.accountId ? { accountId: filters.accountId } : {}),
      },
      _sum: { amount: true },
    });

    const totalIncomeThisYear = yearIncomeAgg._sum.amount ? Number(yearIncomeAgg._sum.amount) : 0;
    const totalExpensesThisYear = yearExpenseAgg._sum.amount ? Number(yearExpenseAgg._sum.amount) : 0;

    // 4. Total Number of Transactions
    const totalTransactions = await prisma.transaction.count({
      where: {
        userId,
        ...(filters?.accountId ? { accountId: filters.accountId } : {}),
      },
    });

    // 5. Budget Remaining This Month
    const overallBudget = await prisma.budget.findFirst({
      where: {
        userId,
        categoryId: null,
        month: now.month() + 1,
        year: now.year(),
      },
    });

    let monthlyBudgetRemaining = null;
    let budgetTotal = null;
    if (overallBudget) {
      budgetTotal = Number(overallBudget.amount);
      monthlyBudgetRemaining = Math.max(0, budgetTotal - totalExpensesThisMonth);
    }

    return {
      totalAccountBalance: Number(totalAccountBalance.toFixed(2)),
      totalIncomeThisMonth: Number(totalIncomeThisMonth.toFixed(2)),
      totalExpensesThisMonth: Number(totalExpensesThisMonth.toFixed(2)),
      netSavingsThisMonth: Number(netSavingsThisMonth.toFixed(2)),
      totalIncomeThisYear: Number(totalIncomeThisYear.toFixed(2)),
      totalExpensesThisYear: Number(totalExpensesThisYear.toFixed(2)),
      totalTransactions,
      monthlyBudgetTotal: budgetTotal,
      monthlyBudgetRemaining: monthlyBudgetRemaining !== null ? Number(monthlyBudgetRemaining.toFixed(2)) : null,
    };
  }

  static async getMonthlyTrends(userId: string, year?: number) {
    const targetYear = year || dayjs().year();
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const results = await Promise.all(
      months.map(async (m) => {
        const start = dayjs(`${targetYear}-${m}-01`).startOf('month').toDate();
        const end = dayjs(`${targetYear}-${m}-01`).endOf('month').toDate();

        const [inc, exp] = await Promise.all([
          prisma.transaction.aggregate({
            where: {
              userId,
              type: TransactionType.INCOME,
              transactionDate: { gte: start, lte: end },
            },
            _sum: { amount: true },
          }),
          prisma.transaction.aggregate({
            where: {
              userId,
              type: TransactionType.EXPENSE,
              transactionDate: { gte: start, lte: end },
            },
            _sum: { amount: true },
          }),
        ]);

        const income = inc._sum.amount ? Number(inc._sum.amount) : 0;
        const expense = exp._sum.amount ? Number(exp._sum.amount) : 0;
        const netSavings = income - expense;

        return {
          month: dayjs(start).format('MMM'),
          monthNumber: m,
          income,
          expense,
          netSavings,
        };
      })
    );

    return results;
  }

  static async getCategoryExpenses(
    userId: string,
    filters?: { startDate?: string; endDate?: string }
  ) {
    const startDate = filters?.startDate ? new Date(filters.startDate) : dayjs().startOf('month').toDate();
    const endDate = filters?.endDate ? new Date(filters.endDate) : dayjs().endOf('month').toDate();

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: TransactionType.EXPENSE,
        transactionDate: { gte: startDate, lte: endDate },
      },
      include: {
        category: true,
      },
    });

    const categoryMap: Record<string, { name: string; color: string; total: number; count: number }> = {};
    let grandTotal = 0;

    for (const t of transactions) {
      const amt = Number(t.amount);
      grandTotal += amt;
      const catId = t.categoryId;
      if (!categoryMap[catId]) {
        categoryMap[catId] = {
          name: t.category.name,
          color: t.category.color || '#EF4444',
          total: 0,
          count: 0,
        };
      }
      categoryMap[catId].total += amt;
      categoryMap[catId].count += 1;
    }

    const items = Object.values(categoryMap).map((c) => ({
      name: c.name,
      color: c.color,
      total: Number(c.total.toFixed(2)),
      count: c.count,
      percentage: grandTotal > 0 ? Number(((c.total / grandTotal) * 100).toFixed(1)) : 0,
    }));

    items.sort((a, b) => b.total - a.total);

    return {
      grandTotal: Number(grandTotal.toFixed(2)),
      categories: items,
    };
  }

  static async getAccountBalances(userId: string) {
    const accounts = await AccountService.getAccounts(userId, false);
    return accounts.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      currency: a.currency,
      currentBalance: a.currentBalance,
    }));
  }

  static async getDailyExpenseTrend(userId: string, month?: number, year?: number) {
    const targetMonth = month || dayjs().month() + 1;
    const targetYear = year || dayjs().year();

    const start = dayjs(`${targetYear}-${targetMonth}-01`).startOf('month');
    const daysInMonth = start.daysInMonth();
    const end = start.endOf('month').toDate();

    const expenses = await prisma.transaction.findMany({
      where: {
        userId,
        type: TransactionType.EXPENSE,
        transactionDate: { gte: start.toDate(), lte: end },
      },
      select: {
        amount: true,
        transactionDate: true,
      },
    });

    const dailyMap: Record<string, number> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const dayKey = start.date(d).format('YYYY-MM-DD');
      dailyMap[dayKey] = 0;
    }

    for (const t of expenses) {
      const dayKey = dayjs(t.transactionDate).format('YYYY-MM-DD');
      if (dailyMap[dayKey] !== undefined) {
        dailyMap[dayKey] += Number(t.amount);
      }
    }

    return Object.entries(dailyMap).map(([date, amount]) => ({
      date: dayjs(date).format('DD MMM'),
      fullDate: date,
      amount: Number(amount.toFixed(2)),
    }));
  }
}
