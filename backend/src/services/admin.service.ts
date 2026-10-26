import { prisma } from '../config/prisma.js';
import { UserStatus } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export class AdminService {
  static async getUsers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { email: { contains: search } },
            { firstName: { contains: search } },
            { lastName: { contains: search } },
          ],
        }
      : {};

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          defaultCurrency: true,
          timezone: true,
          status: true,
          createdAt: true,
          roles: { select: { role: { select: { name: true } } } },
          _count: {
            select: {
              accounts: true,
              transactions: true,
              transfers: true,
            },
          },
        },
      }),
    ]);

    return {
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: `${u.firstName} ${u.lastName}`,
        phone: u.phone,
        currency: u.defaultCurrency,
        status: u.status,
        roles: u.roles.map((r) => r.role.name),
        accountsCount: u._count.accounts,
        transactionsCount: u._count.transactions,
        transfersCount: u._count.transfers,
        createdAt: u.createdAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async toggleUserStatus(userId: string, currentAdminId: string) {
    if (userId === currentAdminId) {
      throw new BadRequestError('Admin cannot deactivate their own account');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');

    const newStatus = user.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus },
      select: { id: true, email: true, status: true },
    });

    if (newStatus === UserStatus.INACTIVE) {
      // Revoke all refresh tokens
      await prisma.refreshToken.updateMany({
        where: { userId },
        data: { isRevoked: true },
      });
    }

    return updated;
  }

  static async getSystemStats() {
    const [totalUsers, activeUsers, totalAccounts, totalTransactions, totalTransfers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
      prisma.account.count(),
      prisma.transaction.count(),
      prisma.transfer.count(),
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      totalAccounts,
      totalTransactions,
      totalTransfers,
      nodeVersion: process.version,
      uptimeSeconds: process.uptime(),
    };
  }
}
