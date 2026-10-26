import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { AccountService } from '../services/account.service.js';

export class AccountController {
  static async getAccounts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const includeArchived = req.query.includeArchived === 'true';
      const accounts = await AccountService.getAccounts(req.user!.userId, includeArchived);
      res.status(200).json({ success: true, data: accounts });
    } catch (error) {
      next(error);
    }
  }

  static async getAccountById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const account = await AccountService.getAccountById(req.params.id, req.user!.userId);
      res.status(200).json({ success: true, data: account });
    } catch (error) {
      next(error);
    }
  }

  static async createAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const account = await AccountService.createAccount(req.user!.userId, req.body);
      res.status(201).json({ success: true, message: 'Account created successfully', data: account });
    } catch (error) {
      next(error);
    }
  }

  static async updateAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await AccountService.updateAccount(req.params.id, req.user!.userId, req.body);
      res.status(200).json({ success: true, message: 'Account updated successfully', data: updated });
    } catch (error) {
      next(error);
    }
  }

  static async archiveAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const archived = await AccountService.archiveAccount(req.params.id, req.user!.userId);
      res.status(200).json({ success: true, message: 'Account archived', data: archived });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AccountService.deleteAccount(req.params.id, req.user!.userId);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  static async getAccountBalance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const balance = await AccountService.calculateAccountBalance(req.params.id, req.user!.userId);
      res.status(200).json({ success: true, data: { accountId: req.params.id, balance } });
    } catch (error) {
      next(error);
    }
  }

  static async getAccountStatement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const statement = await AccountService.getAccountStatement(
        req.params.id,
        req.user!.userId,
        startDate,
        endDate
      );
      res.status(200).json({ success: true, data: statement });
    } catch (error) {
      next(error);
    }
  }
}
