import { z } from 'zod';

export const createBudgetSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid().nullable().optional(),
    amount: z.number().positive('Budget amount must be greater than zero'),
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2000).max(2100),
    alertThreshold80: z.boolean().default(true),
    alertThreshold100: z.boolean().default(true),
  }),
});

export const updateBudgetSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    amount: z.number().positive().optional(),
    alertThreshold80: z.boolean().optional(),
    alertThreshold100: z.boolean().optional(),
  }),
});
