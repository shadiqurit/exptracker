import { prisma } from '../config/prisma.js';
import { TransactionType, Prisma } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export class BudgetService {
  static async getBudgets(userId: string, month: number, year: number) {
    const budgets = await prisma.budget.findMany({
      where: { userId, month, year },
      include: {
        category: true,
      },
    });

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const budgetsWithProgress = await Promise.all(
      budgets.map(async (b) => {
        const budgetAmount = Number(b.amount);

        // Calculate actual expense in the date range
        const actualAgg = await prisma.transaction.aggregate({
          where: {
            userId,
            type: TransactionType.EXPENSE,
            transactionDate: { gte: startOfMonth, lte: endOfMonth },
            ...(b.categoryId ? { categoryId: b.categoryId } : {}),
          },
          _sum: { amount: true },
        });

        const actualSpent = actualAgg._sum.amount ? Number(actualAgg._sum.amount) : 0;
        const remaining = Math.max(0, budgetAmount - actualSpent);
        const percentage = budgetAmount > 0 ? Number(((actualSpent / budgetAmount) * 100).toFixed(1)) : 0;

        const isWarning80 = percentage >= 80 && percentage < 100;
        const isExceeded100 = percentage >= 100;

        return {
          id: b.id,
          month: b.month,
          year: b.year,
          amount: budgetAmount,
          actualSpent,
          remaining: Number(remaining.toFixed(2)),
          percentage,
          categoryId: b.categoryId,
          categoryName: b.category ? b.category.name : 'Overall Monthly Budget',
          categoryIcon: b.category?.icon || 'pi pi-chart-pie',
          categoryColor: b.category?.color || '#3B82F6',
          alertThreshold80: b.alertThreshold80,
          alertThreshold100: b.alertThreshold100,
          isWarning80,
          isExceeded100,
        };
      })
    );

    return budgetsWithProgress;
  }

  static async createBudget(
    userId: string,
    data: {
      categoryId?: string | null;
      amount: number;
      month: number;
      year: number;
      alertThreshold80?: boolean;
      alertThreshold100?: boolean;
    }
  ) {
    if (data.categoryId) {
      const cat = await prisma.category.findFirst({
        where: { id: data.categoryId, OR: [{ userId: null }, { userId }] },
      });
      if (!cat) throw new NotFoundError('Category not found');
    }

    const existing = await prisma.budget.findFirst({
      where: {
        userId,
        categoryId: data.categoryId || null,
        month: data.month,
        year: data.year,
      },
    });

    if (existing) {
      throw new BadRequestError('A budget for this category and month already exists');
    }

    const created = await prisma.budget.create({
      data: {
        userId,
        categoryId: data.categoryId || null,
        amount: new Prisma.Decimal(data.amount),
        month: data.month,
        year: data.year,
        alertThreshold80: data.alertThreshold80 ?? true,
        alertThreshold100: data.alertThreshold100 ?? true,
      },
      include: { category: true },
    });

    return {
      ...created,
      amount: Number(created.amount),
    };
  }

  static async updateBudget(
    budgetId: string,
    userId: string,
    data: {
      amount?: number;
      alertThreshold80?: boolean;
      alertThreshold100?: boolean;
    }
  ) {
    const existing = await prisma.budget.findFirst({
      where: { id: budgetId, userId },
    });
    if (!existing) throw new NotFoundError('Budget not found');

    const updated = await prisma.budget.update({
      where: { id: budgetId },
      data: {
        amount: data.amount !== undefined ? new Prisma.Decimal(data.amount) : undefined,
        alertThreshold80: data.alertThreshold80,
        alertThreshold100: data.alertThreshold100,
      },
      include: { category: true },
    });

    return {
      ...updated,
      amount: Number(updated.amount),
    };
  }

  static async deleteBudget(budgetId: string, userId: string) {
    const existing = await prisma.budget.findFirst({
      where: { id: budgetId, userId },
    });
    if (!existing) throw new NotFoundError('Budget not found');

    await prisma.budget.delete({ where: { id: budgetId } });
    return { message: 'Budget deleted successfully' };
  }
}
