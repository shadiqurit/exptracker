import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator.js';

export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), AuthController.register);
authRouter.post('/login', validate(loginSchema), AuthController.login);
authRouter.post('/refresh', AuthController.refresh);
authRouter.post('/logout', authenticate, AuthController.logout);
authRouter.get('/me', authenticate, AuthController.me);
authRouter.patch('/profile', authenticate, validate(updateProfileSchema), AuthController.updateProfile);
authRouter.post('/change-password', authenticate, validate(changePasswordSchema), AuthController.changePassword);
authRouter.post('/forgot-password', validate(forgotPasswordSchema), AuthController.forgotPassword);
authRouter.post('/reset-password', validate(resetPasswordSchema), AuthController.resetPassword);
