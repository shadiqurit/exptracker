import { z } from 'zod';
import { TransactionType } from '@prisma/client';

export const createTransactionSchema = z.object({
  body: z.object({
    accountId: z.string().uuid('Invalid account ID'),
    categoryId: z.string().uuid('Invalid category ID'),
    subcategoryId: z.string().uuid().optional(),
    type: z.nativeEnum(TransactionType),
    amount: z.number().positive('Amount must be greater than zero'),
    transactionDate: z.string().or(z.date()).transform((val) => new Date(val)),
    description: z.string().optional(),
    merchant: z.string().optional(),
    referenceNumber: z.string().optional(),
    receiptUrl: z.string().optional(),
    isRecurring: z.boolean().default(false),
  }),
});

export const updateTransactionSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    accountId: z.string().uuid().optional(),
    categoryId: z.string().uuid().optional(),
    subcategoryId: z.string().uuid().nullable().optional(),
    type: z.nativeEnum(TransactionType).optional(),
    amount: z.number().positive().optional(),
    transactionDate: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
    description: z.string().nullable().optional(),
    merchant: z.string().nullable().optional(),
    referenceNumber: z.string().nullable().optional(),
    receiptUrl: z.string().nullable().optional(),
  }),
});

export const listTransactionsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(200).default(20),
    accountId: z.string().uuid().optional(),
    categoryId: z.string().uuid().optional(),
    type: z.nativeEnum(TransactionType).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.enum(['transactionDate', 'amount', 'createdAt']).default('transactionDate'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});
