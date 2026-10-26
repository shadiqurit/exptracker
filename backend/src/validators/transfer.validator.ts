import { z } from 'zod';

export const createTransferSchema = z.object({
  body: z.object({
    sourceAccountId: z.string().uuid('Invalid source account ID'),
    destinationAccountId: z.string().uuid('Invalid destination account ID'),
    amount: z.number().positive('Transfer amount must be greater than zero'),
    transferDate: z.string().or(z.date()).transform((val) => new Date(val)),
    referenceNumber: z.string().optional(),
    description: z.string().optional(),
    idempotencyKey: z.string().optional(),
  }),
});

export const reverseTransferSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    reason: z.string().min(1, 'Reversal reason is required'),
  }),
});
