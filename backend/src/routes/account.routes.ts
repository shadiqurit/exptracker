import { Router } from 'express';
import { AccountController } from '../controllers/account.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createAccountSchema, updateAccountSchema } from '../validators/account.validator.js';

export const accountRouter = Router();

accountRouter.use(authenticate);

accountRouter.get('/', AccountController.getAccounts);
accountRouter.post('/', validate(createAccountSchema), AccountController.createAccount);
accountRouter.get('/:id', AccountController.getAccountById);
accountRouter.patch('/:id', validate(updateAccountSchema), AccountController.updateAccount);
accountRouter.post('/:id/archive', AccountController.archiveAccount);
accountRouter.delete('/:id', AccountController.deleteAccount);
accountRouter.get('/:id/balance', AccountController.getAccountBalance);
accountRouter.get('/:id/statement', AccountController.getAccountStatement);
