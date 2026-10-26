import { prisma } from '../config/prisma.js';
import { TransactionType, LedgerDirection, LedgerEntryType, Prisma } from '@prisma/client';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors.js';

export class TransactionService {
  static async getTransactions(
    userId: string,
    filters: {
      page?: number;
      limit?: number;
      accountId?: string;
      categoryId?: string;
      type?: TransactionType;
      startDate?: string;
      endDate?: string;
      search?: string;
      sortBy?: 'transactionDate' | 'amount' | 'createdAt';
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {
      userId,
      ...(filters.accountId ? { accountId: filters.accountId } : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.startDate || filters.endDate
        ? {
            transactionDate: {
              ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
              ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
            },
          }
        : {}),
      ...(filters.search
        ? {
            OR: [
              { description: { contains: filters.search } },
              { merchant: { contains: filters.search } },
              { referenceNumber: { contains: filters.search } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [filters.sortBy || 'transactionDate']: filters.sortOrder || 'desc',
        },
        include: {
          account: { select: { id: true, name: true, type: true, currency: true } },
          category: { select: { id: true, name: true, type: true, icon: true, color: true } },
          subcategory: { select: { id: true, name: true } },
        },
      }),
    ]);

    return {
      items: items.map((t) => ({
        ...t,
        amount: Number(t.amount),
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getTransactionById(transactionId: string, userId: string) {
    const transaction = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
      include: {
        account: true,
        category: true,
        subcategory: true,
      },
    });

    if (!transaction) {
      throw new NotFoundError('Transaction not found');
    }

    return {
      ...transaction,
      amount: Number(transaction.amount),
    };
  }

  static async createTransaction(
    userId: string,
    data: {
      accountId: string;
      categoryId: string;
      subcategoryId?: string;
      type: TransactionType;
      amount: number;
      transactionDate: Date;
      description?: string;
      merchant?: string;
      referenceNumber?: string;
      receiptUrl?: string;
      isRecurring?: boolean;
    }
  ) {
    // 1. Ownership check: Account must belong to user
    const account = await prisma.account.findFirst({
      where: { id: data.accountId, userId },
    });
    if (!account) {
      throw new NotFoundError('Account not found or access denied');
    }

    // 2. Category check: Category must be accessible
    const category = await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        OR: [{ userId: null }, { userId }],
      },
    });
    if (!category) {
      throw new NotFoundError('Category not found or access denied');
    }

    // 3. Atomically create Transaction and LedgerEntry
    return await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId,
          accountId: data.accountId,
          categoryId: data.categoryId,
          subcategoryId: data.subcategoryId,
          type: data.type,
          amount: new Prisma.Decimal(data.amount),
          transactionDate: data.transactionDate,
          description: data.description,
          merchant: data.merchant,
          referenceNumber: data.referenceNumber,
          receiptUrl: data.receiptUrl,
          isRecurring: data.isRecurring || false,
        },
        include: {
          account: true,
          category: true,
        },
      });

      const isIncome = data.type === TransactionType.INCOME;
      await tx.ledgerEntry.create({
        data: {
          accountId: data.accountId,
          userId,
          transactionId: transaction.id,
          entryType: isIncome ? LedgerEntryType.INCOME : LedgerEntryType.EXPENSE,
          direction: isIncome ? LedgerDirection.CREDIT : LedgerDirection.DEBIT,
          amount: new Prisma.Decimal(data.amount),
          entryDate: data.transactionDate,
          description: data.description || (isIncome ? 'Income deposit' : 'Expense payment'),
        },
      });

      return {
        ...transaction,
        amount: Number(transaction.amount),
      };
    });
  }

  static async updateTransaction(
    transactionId: string,
    userId: string,
    data: {
      accountId?: string;
      categoryId?: string;
      subcategoryId?: string | null;
      type?: TransactionType;
      amount?: number;
      transactionDate?: Date;
      description?: string | null;
      merchant?: string | null;
      referenceNumber?: string | null;
      receiptUrl?: string | null;
    }
  ) {
    const existing = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });
    if (!existing) {
      throw new NotFoundError('Transaction not found or access denied');
    }

    const targetAccountId = data.accountId || existing.accountId;
    if (data.accountId && data.accountId !== existing.accountId) {
      const targetAcc = await prisma.account.findFirst({
        where: { id: data.accountId, userId },
      });
      if (!targetAcc) throw new NotFoundError('Target account not found');
    }

    const targetType = data.type || existing.type;
    const targetAmount = data.amount !== undefined ? data.amount : Number(existing.amount);
    const targetDate = data.transactionDate || existing.transactionDate;

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          accountId: targetAccountId,
          categoryId: data.categoryId,
          subcategoryId: data.subcategoryId,
          type: targetType,
          amount: new Prisma.Decimal(targetAmount),
          transactionDate: targetDate,
          description: data.description,
          merchant: data.merchant,
          referenceNumber: data.referenceNumber,
          receiptUrl: data.receiptUrl,
        },
        include: {
          account: true,
          category: true,
        },
      });

      // Update associated ledger entry
      const isIncome = targetType === TransactionType.INCOME;
      await tx.ledgerEntry.deleteMany({
        where: { transactionId },
      });

      await tx.ledgerEntry.create({
        data: {
          accountId: targetAccountId,
          userId,
          transactionId,
          entryType: isIncome ? LedgerEntryType.INCOME : LedgerEntryType.EXPENSE,
          direction: isIncome ? LedgerDirection.CREDIT : LedgerDirection.DEBIT,
          amount: new Prisma.Decimal(targetAmount),
          entryDate: targetDate,
          description: data.description || existing.description || (isIncome ? 'Income deposit' : 'Expense payment'),
        },
      });

      return {
        ...updated,
        amount: Number(updated.amount),
      };
    });
  }

  static async deleteTransaction(transactionId: string, userId: string) {
    const existing = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });
    if (!existing) {
      throw new NotFoundError('Transaction not found');
    }

    return await prisma.$transaction(async (tx) => {
      await tx.ledgerEntry.deleteMany({
        where: { transactionId },
      });
      await tx.transaction.delete({
        where: { id: transactionId },
      });
      return { message: 'Transaction deleted successfully' };
    });
  }
}
