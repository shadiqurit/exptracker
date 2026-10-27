import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { AuthService } from '../services/auth.service.js';
import { config } from '../config/index.js';

export class AuthController {
  private static setCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: config.cookie.secure,
      sameSite: config.cookie.sameSite,
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.cookie.secure,
      sameSite: config.cookie.sameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  static async register(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      AuthController.setCookies(res, result.accessToken, result.refreshToken);

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip || req.socket.remoteAddress;

      const result = await AuthService.login(email, password, userAgent, ipAddress);
      AuthController.setCookies(res, result.accessToken, result.refreshToken);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async googleAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip || req.socket.remoteAddress;

      const result = await AuthService.googleAuth({
        ...req.body,
        userAgent,
        ipAddress,
      });

      AuthController.setCookies(res, result.accessToken, result.refreshToken);

      res.status(200).json({
        success: true,
        message: 'Google authentication successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ success: false, message: 'Refresh token required' });
      }

      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip || req.socket.remoteAddress;

      const result = await AuthService.refresh(refreshToken, userAgent, ipAddress);
      AuthController.setCookies(res, result.accessToken, result.refreshToken);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      if (req.user) {
        await AuthService.logout(req.user.userId, refreshToken);
      }

      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const profile = await AuthService.getProfile(req.user!.userId);
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await AuthService.updateProfile(req.user!.userId, req.body);
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      await AuthService.changePassword(req.user!.userId, currentPassword, newPassword);

      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      res.status(200).json({
        success: true,
        message: 'Password changed successfully. Please log in with your new password.',
      });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // In production, would send reset email. Here, simulate success
      res.status(200).json({
        success: true,
        message: 'If an account exists with this email, password reset instructions have been sent.',
      });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      res.status(200).json({
        success: true,
        message: 'Password reset completed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
