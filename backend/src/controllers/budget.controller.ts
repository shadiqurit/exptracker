import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { BudgetService } from '../services/budget.service.js';
import dayjs from 'dayjs';

export class BudgetController {
  static async getBudgets(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const month = req.query.month ? parseInt(req.query.month as string, 10) : dayjs().month() + 1;
      const year = req.query.year ? parseInt(req.query.year as string, 10) : dayjs().year();

      const budgets = await BudgetService.getBudgets(req.user!.userId, month, year);
      res.status(200).json({ success: true, data: budgets });
    } catch (error) {
      next(error);
    }
  }

  static async createBudget(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const budget = await BudgetService.createBudget(req.user!.userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Budget created successfully',
        data: budget,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateBudget(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await BudgetService.updateBudget(req.params.id, req.user!.userId, req.body);
      res.status(200).json({
        success: true,
        message: 'Budget updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteBudget(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await BudgetService.deleteBudget(req.params.id, req.user!.userId);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }
}
