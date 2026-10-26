import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { accountRouter } from './account.routes.js';
import { categoryRouter } from './category.routes.js';
import { transactionRouter } from './transaction.routes.js';
import { transferRouter } from './transfer.routes.js';
import { budgetRouter } from './budget.routes.js';
import { dashboardRouter } from './dashboard.routes.js';
import { reportRouter } from './report.routes.js';
import { adminRouter } from './admin.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/accounts', accountRouter);
apiRouter.use('/categories', categoryRouter);
apiRouter.use('/transactions', transactionRouter);
apiRouter.use('/transfers', transferRouter);
apiRouter.use('/budgets', budgetRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/reports', reportRouter);
apiRouter.use('/admin', adminRouter);
