import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, JwtUserPayload } from '../types/index.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { RoleName, UserStatus } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    let payload: JwtUserPayload;
    try {
      payload = verifyAccessToken(token);
    } catch (err: any) {
      throw new UnauthorizedError('Invalid or expired access token');
    }

    // Verify user exists and is active in DB
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, status: true, roles: { include: { role: true } } },
    });

    if (!user) {
      throw new UnauthorizedError('User account not found');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenError('User account is deactivated');
    }

    req.user = {
      userId: user.id,
      email: payload.email,
      roles: user.roles.map((r) => r.role.name),
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...allowedRoles: RoleName[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      return next(new ForbiddenError('Insufficient permissions for this resource'));
    }

    next();
  };
}
