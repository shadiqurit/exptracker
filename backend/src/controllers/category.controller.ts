import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { CategoryService } from '../services/category.service.js';
import { CategoryType } from '@prisma/client';

export class CategoryController {
  static async getCategories(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const type = req.query.type as CategoryType | undefined;
      const categories = await CategoryService.getCategories(req.user!.userId, type);
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const category = await CategoryService.createCategory(req.user!.userId, req.body);
      res.status(201).json({ success: true, message: 'Category created', data: category });
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await CategoryService.updateCategory(req.params.id, req.user!.userId, req.body);
      res.status(200).json({ success: true, message: 'Category updated', data: updated });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await CategoryService.deleteCategory(req.params.id, req.user!.userId);
      res.status(200).json({ success: true, message: 'Category deleted' });
    } catch (error) {
      next(error);
    }
  }
}
