import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createTransactionSchema,
  updateTransactionSchema,
  listTransactionsQuerySchema,
} from '../validators/transaction.validator.js';

export const transactionRouter = Router();

transactionRouter.use(authenticate);

transactionRouter.get('/', validate(listTransactionsQuerySchema), TransactionController.getTransactions);
transactionRouter.post('/', validate(createTransactionSchema), TransactionController.createTransaction);
transactionRouter.get('/:id', TransactionController.getTransactionById);
transactionRouter.patch('/:id', validate(updateTransactionSchema), TransactionController.updateTransaction);
transactionRouter.delete('/:id', TransactionController.deleteTransaction);
