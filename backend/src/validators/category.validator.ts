import { z } from 'zod';
import { CategoryType } from '@prisma/client';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Category name is required').trim(),
    type: z.nativeEnum(CategoryType, { errorMap: () => ({ message: 'Invalid category type' }) }),
    icon: z.string().optional(),
    color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Color must be a valid hex code').optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).trim().optional(),
    icon: z.string().optional(),
    color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).optional(),
  }),
});
