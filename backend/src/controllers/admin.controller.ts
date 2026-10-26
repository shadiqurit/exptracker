import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { AdminService } from '../services/admin.service.js';

export class AdminController {
  static async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const search = req.query.search as string | undefined;

      const result = await AdminService.getUsers(page, limit, search);
      res.status(200).json({ success: true, data: result.users, meta: result.meta });
    } catch (error) {
      next(error);
    }
  }

  static async toggleUserStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.toggleUserStatus(req.params.id, req.user!.userId);
      res.status(200).json({
        success: true,
        message: `User status changed to ${result.status}`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSystemStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const stats = await AdminService.getSystemStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
}
