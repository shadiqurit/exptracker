import { prisma } from '../config/prisma.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import { AccountStatus, AccountType, LedgerDirection, LedgerEntryType, Prisma } from '@prisma/client';

export class AccountService {
  /**
   * Calculate current balance for an account by aggregating ledger entries
   */
  static async calculateAccountBalance(accountId: string, userId: string): Promise<number> {
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId },
    });
    if (!account) {
      throw new NotFoundError('Account not found');
    }

    const credits = await prisma.ledgerEntry.aggregate({
      where: { accountId, userId, direction: LedgerDirection.CREDIT },
      _sum: { amount: true },
    });

    const debits = await prisma.ledgerEntry.aggregate({
      where: { accountId, userId, direction: LedgerDirection.DEBIT },
      _sum: { amount: true },
    });

    const totalCredit = credits._sum.amount ? Number(credits._sum.amount) : 0;
    const totalDebit = debits._sum.amount ? Number(debits._sum.amount) : 0;

    // Opening balance might also be in account record if not in ledger
    const hasOpeningInLedger = await prisma.ledgerEntry.findFirst({
      where: { accountId, userId, entryType: LedgerEntryType.OPENING_BALANCE },
    });

    let currentBalance = totalCredit - totalDebit;
    if (!hasOpeningInLedger) {
      currentBalance += Number(account.openingBalance);
    }

    return Number(currentBalance.toFixed(2));
  }

  static async getAccounts(userId: string, includeArchived = false) {
    const accounts = await prisma.account.findMany({
      where: {
        userId,
        ...(includeArchived ? {} : { status: AccountStatus.ACTIVE }),
      },
      orderBy: { createdAt: 'asc' },
    });

    const accountsWithBalance = await Promise.all(
      accounts.map(async (acc) => {
        const balance = await this.calculateAccountBalance(acc.id, userId);
        return {
          ...acc,
          openingBalance: Number(acc.openingBalance),
          currentBalance: balance,
        };
      })
    );

    return accountsWithBalance;
  }

  static async getAccountById(accountId: string, userId: string) {
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId },
    });
    if (!account) {
      throw new NotFoundError('Account not found');
    }

    const balance = await this.calculateAccountBalance(accountId, userId);
    return {
      ...account,
      openingBalance: Number(account.openingBalance),
      currentBalance: balance,
    };
  }

  static async createAccount(
    userId: string,
    data: {
      name: string;
      type: AccountType;
      accountNumber?: string;
      bankName?: string;
      currency?: string;
      openingBalance?: number;
      description?: string;
    }
  ) {
    return await prisma.$transaction(async (tx) => {
      const openingBalance = data.openingBalance ?? 0;
      const account = await tx.account.create({
        data: {
          userId,
          name: data.name,
          type: data.type,
          accountNumber: data.accountNumber,
          bankName: data.bankName,
          currency: data.currency || 'BDT',
          openingBalance: new Prisma.Decimal(openingBalance),
          description: data.description,
        },
      });

      if (openingBalance > 0) {
        await tx.ledgerEntry.create({
          data: {
            accountId: account.id,
            userId,
            entryType: LedgerEntryType.OPENING_BALANCE,
            direction: LedgerDirection.CREDIT,
            amount: new Prisma.Decimal(openingBalance),
            entryDate: new Date(),
            description: 'Account Opening Balance',
          },
        });
      }

      return {
        ...account,
        openingBalance,
        currentBalance: openingBalance,
      };
    });
  }

  static async updateAccount(
    accountId: string,
    userId: string,
    data: {
      name?: string;
      type?: AccountType;
      accountNumber?: string | null;
      bankName?: string | null;
      currency?: string;
      openingBalance?: number;
      status?: AccountStatus;
      description?: string | null;
    }
  ) {
    const existing = await prisma.account.findFirst({
      where: { id: accountId, userId },
    });
    if (!existing) {
      throw new NotFoundError('Account not found');
    }

    const updated = await prisma.account.update({
      where: { id: accountId },
      data: {
        ...data,
        openingBalance: data.openingBalance !== undefined ? new Prisma.Decimal(data.openingBalance) : undefined,
      },
    });

    const balance = await this.calculateAccountBalance(accountId, userId);
    return {
      ...updated,
      openingBalance: Number(updated.openingBalance),
      currentBalance: balance,
    };
  }

  static async archiveAccount(accountId: string, userId: string) {
    const existing = await prisma.account.findFirst({
      where: { id: accountId, userId },
    });
    if (!existing) {
      throw new NotFoundError('Account not found');
    }

    return await prisma.account.update({
      where: { id: accountId },
      data: { status: AccountStatus.ARCHIVED },
    });
  }

  static async deleteAccount(accountId: string, userId: string) {
    const existing = await prisma.account.findFirst({
      where: { id: accountId, userId },
      include: {
        transactions: { select: { id: true }, take: 1 },
        transfersOut: { select: { id: true }, take: 1 },
        transfersIn: { select: { id: true }, take: 1 },
      },
    });

    if (!existing) {
      throw new NotFoundError('Account not found');
    }

    const hasHistory =
      existing.transactions.length > 0 ||
      existing.transfersOut.length > 0 ||
      existing.transfersIn.length > 0;

    if (hasHistory) {
      throw new BadRequestError(
        'Cannot delete account with existing transactions or transfers. Please archive the account instead to preserve ledger audit integrity.'
      );
    }

    // Delete opening balance ledger entry if any
    await prisma.ledgerEntry.deleteMany({
      where: { accountId, userId },
    });

    await prisma.account.delete({
      where: { id: accountId },
    });

    return { message: 'Account deleted successfully' };
  }

  static async getAccountStatement(
    accountId: string,
    userId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const account = await this.getAccountById(accountId, userId);

    const where: Prisma.LedgerEntryWhereInput = {
      accountId,
      userId,
      ...(startDate || endDate
        ? {
            entryDate: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
    };

    // Calculate opening balance before startDate
    let periodOpeningBalance = Number(account.openingBalance);
    if (startDate) {
      const priorCredits = await prisma.ledgerEntry.aggregate({
        where: {
          accountId,
          userId,
          entryDate: { lt: startDate },
          direction: LedgerDirection.CREDIT,
        },
        _sum: { amount: true },
      });
      const priorDebits = await prisma.ledgerEntry.aggregate({
        where: {
          accountId,
          userId,
          entryDate: { lt: startDate },
          direction: LedgerDirection.DEBIT,
        },
        _sum: { amount: true },
      });

      const priorCr = priorCredits._sum.amount ? Number(priorCredits._sum.amount) : 0;
      const priorDr = priorDebits._sum.amount ? Number(priorDebits._sum.amount) : 0;
      
      const hasPriorOpening = await prisma.ledgerEntry.findFirst({
        where: {
          accountId,
          userId,
          entryType: LedgerEntryType.OPENING_BALANCE,
          entryDate: { lt: startDate },
        },
      });

      periodOpeningBalance = priorCr - priorDr + (hasPriorOpening ? 0 : Number(account.openingBalance));
    }

    const ledgerEntries = await prisma.ledgerEntry.findMany({
      where,
      orderBy: { entryDate: 'asc' },
      include: {
        transaction: {
          include: { category: true },
        },
        transfer: true,
      },
    });

    let running = periodOpeningBalance;
    const statements = ledgerEntries.map((entry) => {
      const amount = Number(entry.amount);
      const isCredit = entry.direction === LedgerDirection.CREDIT;
      if (entry.entryType !== LedgerEntryType.OPENING_BALANCE || startDate) {
        running = isCredit ? running + amount : running - amount;
      }
      return {
        id: entry.id,
        date: entry.entryDate,
        type: entry.entryType,
        direction: entry.direction,
        amount,
        runningBalance: Number(running.toFixed(2)),
        description: entry.description || entry.transaction?.description || entry.transfer?.description,
        category: entry.transaction?.category?.name,
        merchant: entry.transaction?.merchant,
        referenceNumber: entry.transaction?.referenceNumber || entry.transfer?.referenceNumber,
      };
    });

    return {
      account,
      periodOpeningBalance: Number(periodOpeningBalance.toFixed(2)),
      periodClosingBalance: Number(running.toFixed(2)),
      statements,
    };
  }
}
