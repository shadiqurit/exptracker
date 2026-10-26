import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.js';

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);

dashboardRouter.get('/summary', DashboardController.getSummary);
dashboardRouter.get('/monthly-trends', DashboardController.getMonthlyTrends);
dashboardRouter.get('/category-expenses', DashboardController.getCategoryExpenses);
dashboardRouter.get('/account-balances', DashboardController.getAccountBalances);
dashboardRouter.get('/daily-expense-trend', DashboardController.getDailyExpenseTrend);
