import * as argon2 from 'argon2';
import crypto from 'crypto';
import { prisma } from '../config/prisma.js';
import { BadRequestError, UnauthorizedError, ConflictError, NotFoundError } from '../utils/errors.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { RoleName, UserStatus } from '@prisma/client';

export class AuthService {
  static async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    defaultCurrency?: string;
    timezone?: string;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new ConflictError('A user with this email address already exists');
    }

    const passwordHash = await argon2.hash(data.password);
    const userRole = await prisma.role.findUniqueOrThrow({
      where: { name: RoleName.USER },
    });

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        defaultCurrency: data.defaultCurrency || 'BDT',
        timezone: data.timezone || 'Asia/Dhaka',
        roles: {
          create: { roleId: userRole.id },
        },
      },
      include: {
        roles: { include: { role: true } },
      },
    });

    // Create a default Cash account for new users
    await prisma.account.create({
      data: {
        userId: user.id,
        name: 'Cash in Hand',
        type: 'CASH',
        currency: user.defaultCurrency,
        openingBalance: 0,
        description: 'Default cash account',
      },
    });

    const jwtPayload = {
      userId: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.role.name),
    };

    const accessToken = signAccessToken(jwtPayload);
    const refreshToken = signRefreshToken(jwtPayload);

    // Store refresh token
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        defaultCurrency: user.defaultCurrency,
        timezone: user.timezone,
        roles: jwtPayload.roles,
      },
      accessToken,
      refreshToken,
    };
  }

  static async login(
    email: string,
    password: string,
    userAgent?: string,
    ipAddress?: string
  ) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        roles: { include: { role: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError('Your account has been deactivated. Contact an administrator.');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedError('This account was registered with Google Sign-In. Please sign in with Google.');
    }

    let isMatch = await argon2.verify(user.passwordHash, password);
    if (!isMatch && password.trim() !== password) {
      isMatch = await argon2.verify(user.passwordHash, password.trim());
    }
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const jwtPayload = {
      userId: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.role.name),
    };

    const accessToken = signAccessToken(jwtPayload);
    const refreshToken = signRefreshToken(jwtPayload);

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        userAgent,
        ipAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        defaultCurrency: user.defaultCurrency,
        timezone: user.timezone,
        roles: jwtPayload.roles,
      },
      accessToken,
      refreshToken,
    };
  }

  static async googleAuth(data: {
    idToken?: string;
    accessToken?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    googleId?: string;
    userAgent?: string;
    ipAddress?: string;
  }) {
    let verifiedEmail = data.email?.toLowerCase().trim();
    let verifiedGoogleId = data.googleId;
    let verifiedFirstName = data.firstName;
    let verifiedLastName = data.lastName;
    let verifiedAvatarUrl = data.avatarUrl;

    // 1. Verify with Google tokeninfo API if idToken is supplied
    if (data.idToken) {
      try {
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(data.idToken)}`);
        if (!response.ok) {
          throw new UnauthorizedError('Invalid Google credential token');
        }
        const payload = (await response.json()) as any;
        if (!payload.email) {
          throw new UnauthorizedError('Google account does not provide a valid email');
        }
        verifiedEmail = payload.email.toLowerCase().trim();
        verifiedGoogleId = payload.sub;
        verifiedFirstName = payload.given_name || payload.name?.split(' ')[0] || 'Google';
        verifiedLastName = payload.family_name || payload.name?.split(' ').slice(1).join(' ') || 'User';
        verifiedAvatarUrl = payload.picture || verifiedAvatarUrl;
      } catch (err: any) {
        if (err instanceof UnauthorizedError) throw err;
        throw new UnauthorizedError('Failed to verify Google token with Google servers: ' + (err.message || ''));
      }
    } else if (data.accessToken) {
      // 2. Verify with Google userinfo API if accessToken is supplied
      try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${data.accessToken}` },
        });
        if (!response.ok) {
          throw new UnauthorizedError('Invalid Google access token');
        }
        const payload = (await response.json()) as any;
        if (!payload.email) {
          throw new UnauthorizedError('Google account does not provide a valid email');
        }
        verifiedEmail = payload.email.toLowerCase().trim();
        verifiedGoogleId = payload.sub;
        verifiedFirstName = payload.given_name || payload.name?.split(' ')[0] || 'Google';
        verifiedLastName = payload.family_name || payload.name?.split(' ').slice(1).join(' ') || 'User';
        verifiedAvatarUrl = payload.picture || verifiedAvatarUrl;
      } catch (err: any) {
        if (err instanceof UnauthorizedError) throw err;
        throw new UnauthorizedError('Failed to fetch user info from Google: ' + (err.message || ''));
      }
    } else if (process.env.NODE_ENV === 'development' && verifiedEmail) {
      // Development testing fallback
      verifiedGoogleId = verifiedGoogleId || `google_dev_${Date.now()}`;
      verifiedFirstName = verifiedFirstName || 'Google';
      verifiedLastName = verifiedLastName || 'User';
    } else {
      throw new BadRequestError('Google ID token or access token is required');
    }

    if (!verifiedEmail) {
      throw new BadRequestError('Could not obtain a verified email address from Google');
    }

    // Check if user already exists by googleId or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(verifiedGoogleId ? [{ googleId: verifiedGoogleId }] : []),
          { email: verifiedEmail },
        ],
      },
      include: {
        roles: { include: { role: true } },
      },
    });

    if (user) {
      if (user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedError('Your account has been deactivated. Contact an administrator.');
      }

      // Link googleId or update avatar if missing
      const updateData: any = {};
      if (!user.googleId && verifiedGoogleId) {
        updateData.googleId = verifiedGoogleId;
      }
      if (!user.avatarUrl && verifiedAvatarUrl) {
        updateData.avatarUrl = verifiedAvatarUrl;
      }
      if (Object.keys(updateData).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updateData,
          include: { roles: { include: { role: true } } },
        });
      }
    } else {
      // Create new user via Google signup
      const userRole = await prisma.role.findUniqueOrThrow({
        where: { name: RoleName.USER },
      });

      user = await prisma.user.create({
        data: {
          email: verifiedEmail,
          googleId: verifiedGoogleId,
          authProvider: 'GOOGLE',
          firstName: verifiedFirstName || 'Google',
          lastName: verifiedLastName || 'User',
          avatarUrl: verifiedAvatarUrl,
          defaultCurrency: 'BDT',
          timezone: 'Asia/Dhaka',
          roles: {
            create: { roleId: userRole.id },
          },
        },
        include: {
          roles: { include: { role: true } },
        },
      });

      // Create default Cash account for new Google user
      await prisma.account.create({
        data: {
          userId: user.id,
          name: 'Cash in Hand',
          type: 'CASH',
          currency: user.defaultCurrency,
          openingBalance: 0,
          description: 'Default cash account created on Google signup',
        },
      });
    }

    const jwtPayload = {
      userId: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.role.name),
    };

    const accessToken = signAccessToken(jwtPayload);
    const refreshToken = signRefreshToken(jwtPayload);

    // Store refresh token
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        defaultCurrency: user.defaultCurrency,
        timezone: user.timezone,
        roles: jwtPayload.roles,
        authProvider: user.authProvider,
      },
      accessToken,
      refreshToken,
    };
  }

  static async refresh(token: string, userAgent?: string, ipAddress?: string) {
    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: { roles: { include: { role: true } } },
        },
      },
    });

    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token revoked or expired');
    }

    // Revoke old refresh token (rotation)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    const user = storedToken.user;
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError('User account is deactivated');
    }

    const jwtPayload = {
      userId: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.role.name),
    };

    const newAccessToken = signAccessToken(jwtPayload);
    const newRefreshToken = signRefreshToken(jwtPayload);
    const newTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: newTokenHash,
        userAgent,
        ipAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: jwtPayload.roles,
        defaultCurrency: user.defaultCurrency,
        timezone: user.timezone,
      },
    };
  }

  static async logout(userId: string, token?: string) {
    if (token) {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      await prisma.refreshToken.updateMany({
        where: { userId, tokenHash },
        data: { isRevoked: true },
      });
    } else {
      await prisma.refreshToken.updateMany({
        where: { userId, isRevoked: false },
        data: { isRevoked: true },
      });
    }
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { role: true } },
      },
    });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      defaultCurrency: user.defaultCurrency,
      timezone: user.timezone,
      roles: user.roles.map((r) => r.role.name),
      createdAt: user.createdAt,
    };
  }

  static async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string | null;
      defaultCurrency?: string;
      timezone?: string;
    }
  ) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      include: {
        roles: { include: { role: true } },
      },
    });
    return {
      id: updated.id,
      email: updated.email,
      firstName: updated.firstName,
      lastName: updated.lastName,
      phone: updated.phone,
      defaultCurrency: updated.defaultCurrency,
      timezone: updated.timezone,
      roles: updated.roles.map((r) => r.role.name),
    };
  }

  static async changePassword(
    userId: string,
    currentPass: string,
    newPass: string
  ) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!user.passwordHash) {
      throw new BadRequestError('This account was created with Google Sign-In and has no password set.');
    }
    const isMatch = await argon2.verify(user.passwordHash, currentPass);
    if (!isMatch) {
      throw new BadRequestError('Current password does not match');
    }

    const newHash = await argon2.hash(newPass);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    // Revoke all existing sessions
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }
}
