import { prisma } from '../config/prisma.js';
import { TransferStatus, LedgerDirection, LedgerEntryType, Prisma } from '@prisma/client';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/errors.js';

export class TransferService {
  static async getTransfers(userId: string) {
    const transfers = await prisma.transfer.findMany({
      where: { userId },
      orderBy: { transferDate: 'desc' },
      include: {
        sourceAccount: { select: { id: true, name: true, type: true, currency: true } },
        destinationAccount: { select: { id: true, name: true, type: true, currency: true } },
      },
    });

    return transfers.map((t) => ({
      ...t,
      amount: Number(t.amount),
    }));
  }

  static async getTransferById(transferId: string, userId: string) {
    const transfer = await prisma.transfer.findFirst({
      where: { id: transferId, userId },
      include: {
        sourceAccount: true,
        destinationAccount: true,
        ledgerEntries: true,
      },
    });

    if (!transfer) {
      throw new NotFoundError('Transfer record not found');
    }

    return {
      ...transfer,
      amount: Number(transfer.amount),
    };
  }

  static async createTransfer(
    userId: string,
    data: {
      sourceAccountId: string;
      destinationAccountId: string;
      amount: number;
      transferDate: Date;
      referenceNumber?: string;
      description?: string;
      idempotencyKey?: string;
    }
  ) {
    if (data.sourceAccountId === data.destinationAccountId) {
      throw new BadRequestError('Source and destination cannot be the same account');
    }

    // Check idempotency if key provided
    if (data.idempotencyKey) {
      const existing = await prisma.transfer.findUnique({
        where: { idempotencyKey: data.idempotencyKey },
        include: { sourceAccount: true, destinationAccount: true },
      });
      if (existing) {
        if (existing.userId !== userId) {
          throw new ConflictError('Idempotency conflict');
        }
        return {
          ...existing,
          amount: Number(existing.amount),
        };
      }
    }

    // Verify both accounts belong to the user
    const [sourceAccount, destinationAccount] = await Promise.all([
      prisma.account.findFirst({ where: { id: data.sourceAccountId, userId } }),
      prisma.account.findFirst({ where: { id: data.destinationAccountId, userId } }),
    ]);

    if (!sourceAccount) {
      throw new NotFoundError('Source account not found or access denied');
    }
    if (!destinationAccount) {
      throw new NotFoundError('Destination account not found or access denied');
    }

    // Single ACID MySQL transaction
    return await prisma.$transaction(async (tx) => {
      const transfer = await tx.transfer.create({
        data: {
          userId,
          sourceAccountId: data.sourceAccountId,
          destinationAccountId: data.destinationAccountId,
          amount: new Prisma.Decimal(data.amount),
          transferDate: data.transferDate,
          referenceNumber: data.referenceNumber,
          description: data.description,
          idempotencyKey: data.idempotencyKey,
          status: TransferStatus.COMPLETED,
        },
        include: {
          sourceAccount: true,
          destinationAccount: true,
        },
      });

      // 1. Debit Source Account (Funds leave)
      await tx.ledgerEntry.create({
        data: {
          accountId: data.sourceAccountId,
          userId,
          transferId: transfer.id,
          entryType: LedgerEntryType.TRANSFER_OUT,
          direction: LedgerDirection.DEBIT,
          amount: new Prisma.Decimal(data.amount),
          entryDate: data.transferDate,
          description: data.description || `Transfer to ${destinationAccount.name}`,
        },
      });

      // 2. Credit Destination Account (Funds arrive)
      await tx.ledgerEntry.create({
        data: {
          accountId: data.destinationAccountId,
          userId,
          transferId: transfer.id,
          entryType: LedgerEntryType.TRANSFER_IN,
          direction: LedgerDirection.CREDIT,
          amount: new Prisma.Decimal(data.amount),
          entryDate: data.transferDate,
          description: data.description || `Transfer from ${sourceAccount.name}`,
        },
      });

      return {
        ...transfer,
        amount: Number(transfer.amount),
      };
    });
  }

  static async reverseTransfer(transferId: string, userId: string, reason: string) {
    const transfer = await prisma.transfer.findFirst({
      where: { id: transferId, userId },
      include: { sourceAccount: true, destinationAccount: true },
    });

    if (!transfer) {
      throw new NotFoundError('Transfer record not found');
    }

    if (transfer.status === TransferStatus.REVERSED) {
      throw new BadRequestError('This transfer has already been reversed');
    }

    return await prisma.$transaction(async (tx) => {
      const updatedTransfer = await tx.transfer.update({
        where: { id: transferId },
        data: {
          status: TransferStatus.REVERSED,
          reversalReason: reason,
        },
        include: {
          sourceAccount: true,
          destinationAccount: true,
        },
      });

      const now = new Date();

      // Reverse Debit on Source: Credit funds back to Source Account
      await tx.ledgerEntry.create({
        data: {
          accountId: transfer.sourceAccountId,
          userId,
          transferId: transfer.id,
          entryType: LedgerEntryType.TRANSFER_REVERSAL,
          direction: LedgerDirection.CREDIT,
          amount: transfer.amount,
          entryDate: now,
          description: `Transfer Reversal: ${reason}`,
        },
      });

      // Reverse Credit on Destination: Debit funds out from Destination Account
      await tx.ledgerEntry.create({
        data: {
          accountId: transfer.destinationAccountId,
          userId,
          transferId: transfer.id,
          entryType: LedgerEntryType.TRANSFER_REVERSAL,
          direction: LedgerDirection.DEBIT,
          amount: transfer.amount,
          entryDate: now,
          description: `Transfer Reversal: ${reason}`,
        },
      });

      return {
        ...updatedTransfer,
        amount: Number(updatedTransfer.amount),
      };
    });
  }
}
