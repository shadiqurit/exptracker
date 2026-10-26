import { Router } from 'express';
import { TransferController } from '../controllers/transfer.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createTransferSchema, reverseTransferSchema } from '../validators/transfer.validator.js';

export const transferRouter = Router();

transferRouter.use(authenticate);

transferRouter.get('/', TransferController.getTransfers);
transferRouter.post('/', validate(createTransferSchema), TransferController.createTransfer);
transferRouter.get('/:id', TransferController.getTransferById);
transferRouter.post('/:id/reverse', validate(reverseTransferSchema), TransferController.reverseTransfer);
