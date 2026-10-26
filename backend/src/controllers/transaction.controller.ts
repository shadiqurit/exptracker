import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { TransactionService } from '../services/transaction.service.js';

export class TransactionController {
  static async getTransactions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await TransactionService.getTransactions(req.user!.userId, req.query as any);
      res.status(200).json({
        success: true,
        data: result.items,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTransactionById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const transaction = await TransactionService.getTransactionById(req.params.id, req.user!.userId);
      res.status(200).json({ success: true, data: transaction });
    } catch (error) {
      next(error);
    }
  }

  static async createTransaction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const transaction = await TransactionService.createTransaction(req.user!.userId, req.body);
      res.status(201).json({
        success: true,
        message: `${transaction.type === 'INCOME' ? 'Income' : 'Expense'} recorded successfully`,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateTransaction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await TransactionService.updateTransaction(req.params.id, req.user!.userId, req.body);
      res.status(200).json({
        success: true,
        message: 'Transaction updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTransaction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await TransactionService.deleteTransaction(req.params.id, req.user!.userId);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }
}
