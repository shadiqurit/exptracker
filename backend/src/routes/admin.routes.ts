import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { RoleName } from '@prisma/client';

export const adminRouter = Router();

adminRouter.use(authenticate);
adminRouter.use(requireRole(RoleName.SUPER_ADMIN));

adminRouter.get('/users', AdminController.getUsers);
adminRouter.patch('/users/:id/toggle-status', AdminController.toggleUserStatus);
adminRouter.get('/stats', AdminController.getSystemStats);
