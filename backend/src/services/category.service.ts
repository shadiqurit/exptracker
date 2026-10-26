import { prisma } from '../config/prisma.js';
import { CategoryType } from '@prisma/client';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors.js';

export class CategoryService {
  static async getCategories(userId: string, type?: CategoryType) {
    return await prisma.category.findMany({
      where: {
        OR: [{ userId: null }, { userId }],
        ...(type ? { type } : {}),
      },
      include: {
        subcategories: true,
      },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });
  }

  static async createCategory(
    userId: string,
    data: {
      name: string;
      type: CategoryType;
      icon?: string;
      color?: string;
    }
  ) {
    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ userId }, { userId: null }],
        name: data.name,
        type: data.type,
      },
    });

    if (existing) {
      throw new BadRequestError(`A category named "${data.name}" already exists for ${data.type.toLowerCase()}`);
    }

    return await prisma.category.create({
      data: {
        userId,
        name: data.name,
        type: data.type,
        icon: data.icon || 'pi pi-tag',
        color: data.color || '#64748B',
        isSystem: false,
      },
    });
  }

  static async updateCategory(
    categoryId: string,
    userId: string,
    data: {
      name?: string;
      icon?: string;
      color?: string;
    }
  ) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    if (category.isSystem || category.userId !== userId) {
      throw new ForbiddenError('Cannot modify system or unauthorized category');
    }

    return await prisma.category.update({
      where: { id: categoryId },
      data,
    });
  }

  static async deleteCategory(categoryId: string, userId: string) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        transactions: { select: { id: true }, take: 1 },
      },
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    if (category.isSystem || category.userId !== userId) {
      throw new ForbiddenError('Cannot delete system or unauthorized category');
    }

    if (category.transactions.length > 0) {
      throw new BadRequestError('Cannot delete category with associated transactions');
    }

    return await prisma.category.delete({
      where: { id: categoryId },
    });
  }
}
