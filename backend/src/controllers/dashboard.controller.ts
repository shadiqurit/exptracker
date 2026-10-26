import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { DashboardService } from '../services/dashboard.service.js';

export class DashboardController {
  static async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const summary = await DashboardService.getSummary(req.user!.userId, req.query as any);
      res.status(200).json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }

  static async getMonthlyTrends(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
      const trends = await DashboardService.getMonthlyTrends(req.user!.userId, year);
      res.status(200).json({ success: true, data: trends });
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryExpenses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await DashboardService.getCategoryExpenses(req.user!.userId, req.query as any);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getAccountBalances(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const balances = await DashboardService.getAccountBalances(req.user!.userId);
      res.status(200).json({ success: true, data: balances });
    } catch (error) {
      next(error);
    }
  }

  static async getDailyExpenseTrend(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;
      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
      const trend = await DashboardService.getDailyExpenseTrend(req.user!.userId, month, year);
      res.status(200).json({ success: true, data: trend });
    } catch (error) {
      next(error);
    }
  }
}
