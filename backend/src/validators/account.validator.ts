import { z } from 'zod';
import { AccountType, AccountStatus } from '@prisma/client';

export const createAccountSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Account name is required').trim(),
    type: z.nativeEnum(AccountType, { errorMap: () => ({ message: 'Invalid account type' }) }),
    accountNumber: z.string().optional(),
    bankName: z.string().optional(),
    currency: z.string().length(3).default('BDT'),
    openingBalance: z.number().default(0),
    description: z.string().optional(),
  }),
});

export const updateAccountSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).trim().optional(),
    type: z.nativeEnum(AccountType).optional(),
    accountNumber: z.string().nullable().optional(),
    bankName: z.string().nullable().optional(),
    currency: z.string().length(3).optional(),
    openingBalance: z.number().optional(),
    status: z.nativeEnum(AccountStatus).optional(),
    description: z.string().nullable().optional(),
  }),
});
