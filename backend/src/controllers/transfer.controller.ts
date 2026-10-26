import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { TransferService } from '../services/transfer.service.js';

export class TransferController {
  static async getTransfers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const transfers = await TransferService.getTransfers(req.user!.userId);
      res.status(200).json({ success: true, data: transfers });
    } catch (error) {
      next(error);
    }
  }

  static async getTransferById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const transfer = await TransferService.getTransferById(req.params.id, req.user!.userId);
      res.status(200).json({ success: true, data: transfer });
    } catch (error) {
      next(error);
    }
  }

  static async createTransfer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const transfer = await TransferService.createTransfer(req.user!.userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Fund transfer executed successfully',
        data: transfer,
      });
    } catch (error) {
      next(error);
    }
  }

  static async reverseTransfer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { reason } = req.body;
      const transfer = await TransferService.reverseTransfer(req.params.id, req.user!.userId, reason);
      res.status(200).json({
        success: true,
        message: 'Fund transfer reversed successfully',
        data: transfer,
      });
    } catch (error) {
      next(error);
    }
  }
}
