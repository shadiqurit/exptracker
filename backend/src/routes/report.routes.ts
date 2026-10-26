import { Router } from 'express';
import { ReportController } from '../controllers/report.controller.js';
import { authenticate } from '../middleware/auth.js';

export const reportRouter = Router();

reportRouter.use(authenticate);

reportRouter.get('/daily', ReportController.getDailyReport);
reportRouter.get('/monthly', ReportController.getMonthlyReport);
reportRouter.get('/yearly', ReportController.getYearlyReport);
reportRouter.get('/categories', ReportController.getCategoryReport);
reportRouter.get('/export', ReportController.exportReport);
