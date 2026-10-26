import { Router } from 'express';
import { BudgetController } from '../controllers/budget.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createBudgetSchema, updateBudgetSchema } from '../validators/budget.validator.js';

export const budgetRouter = Router();

budgetRouter.use(authenticate);

budgetRouter.get('/', BudgetController.getBudgets);
budgetRouter.post('/', validate(createBudgetSchema), BudgetController.createBudget);
budgetRouter.patch('/:id', validate(updateBudgetSchema), BudgetController.updateBudget);
budgetRouter.delete('/:id', BudgetController.deleteBudget);
