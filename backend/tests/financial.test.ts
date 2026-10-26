import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';

describe('Financial Scenarios & Multi-User Isolation Tests', () => {
  let userAToken: string;
  let userBToken: string;
  let adminToken: string;

  beforeAll(async () => {
    // 1. Log in User A
    const resA = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'usera@example.com', password: 'UserA123!@#' });
    expect(resA.status).toBe(200);
    userAToken = resA.body.data.accessToken;

    // 2. Log in User B
    const resB = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'userb@example.com', password: 'UserB123!@#' });
    expect(resB.status).toBe(200);
    userBToken = resB.body.data.accessToken;

    // 3. Log in Super Admin
    const resAdmin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@expensetracker.local', password: 'AdminPassword123!' });
    expect(resAdmin.status).toBe(200);
    adminToken = resAdmin.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('Scenario 1: Strict User-wise Data Isolation', async () => {
    // User A fetches their accounts
    const resA = await request(app)
      .get('/api/v1/accounts')
      .set('Authorization', `Bearer ${userAToken}`);
    expect(resA.status).toBe(200);
    const accountIdsA = resA.body.data.map((a: any) => a.id);

    // User B fetches their accounts
    const resB = await request(app)
      .get('/api/v1/accounts')
      .set('Authorization', `Bearer ${userBToken}`);
    expect(resB.status).toBe(200);
    const accountIdsB = resB.body.data.map((a: any) => a.id);

    // Verify completely disjoint account sets
    for (const idA of accountIdsA) {
      expect(accountIdsB).not.toContain(idA);
    }

    // User B cannot access User A's account
    const directAccess = await request(app)
      .get(`/api/v1/accounts/${accountIdsA[0]}`)
      .set('Authorization', `Bearer ${userBToken}`);
    expect(directAccess.status).toBe(404);

    // User B cannot view User A's transactions
    const txA = await prisma.transaction.findFirst({ where: { accountId: accountIdsA[0] } });
    if (txA) {
      const directTxAccess = await request(app)
        .get(`/api/v1/transactions/${txA.id}`)
        .set('Authorization', `Bearer ${userBToken}`);
      expect(directTxAccess.status).toBe(404);
    }
  });

  it('Scenario 2, 3, 4, 5: Multiple Accounts, Income, Expense, and Fund Transfer Balances', async () => {
    const res = await request(app)
      .get('/api/v1/accounts')
      .set('Authorization', `Bearer ${userAToken}`);
    expect(res.status).toBe(200);

    const accounts = res.body.data;
    const cashAcc = accounts.find((a: any) => a.name === 'Cash In Hand');
    const bankAcc = accounts.find((a: any) => a.name === 'City Bank Savings');
    const walletAcc = accounts.find((a: any) => a.name === 'bKash Wallet');

    expect(cashAcc).toBeDefined();
    expect(bankAcc).toBeDefined();
    expect(walletAcc).toBeDefined();

    // From Seed:
    // Cash: 10,000 - 2,000 = 8,000
    // Bank: 25,000 + 50,000 - 3,000 = 72,000
    // Mobile Wallet: 5,000 + 3,000 = 8,000
    // Combined Balance: 88,000
    expect(cashAcc.currentBalance).toBe(8000);
    expect(bankAcc.currentBalance).toBe(72000);
    expect(walletAcc.currentBalance).toBe(8000);

    const totalCombinedBalance = cashAcc.currentBalance + bankAcc.currentBalance + walletAcc.currentBalance;
    expect(totalCombinedBalance).toBe(88000);

    // Verify Dashboard summary totals
    const dashRes = await request(app)
      .get('/api/v1/dashboard/summary')
      .set('Authorization', `Bearer ${userAToken}`);
    expect(dashRes.status).toBe(200);
    expect(dashRes.body.data.totalAccountBalance).toBe(88000);
    expect(dashRes.body.data.totalIncomeThisMonth).toBe(50000);
    expect(dashRes.body.data.totalExpensesThisMonth).toBe(2000);
    expect(dashRes.body.data.netSavingsThisMonth).toBe(48000);
  });

  it('Scenario 6: Monthly Report derived from ledger records', async () => {
    const reportRes = await request(app)
      .get('/api/v1/reports/monthly?month=10&year=2026')
      .set('Authorization', `Bearer ${userAToken}`);
    expect(reportRes.status).toBe(200);

    const report = reportRes.body.data;
    expect(report.totalIncome).toBe(50000);
    expect(report.totalExpense).toBe(2000);
    expect(report.netIncome).toBe(48000);
    expect(report.closingBalance).toBe(88000);
  });

  it('Scenario 7: Data Consistency & Transfer Reversals', async () => {
    const accs = await request(app)
      .get('/api/v1/accounts')
      .set('Authorization', `Bearer ${userAToken}`);
    const cashAcc = accs.body.data.find((a: any) => a.name === 'Cash In Hand');
    const walletAcc = accs.body.data.find((a: any) => a.name === 'bKash Wallet');

    // 1. Idempotency test: submit transfer with unique idempotencyKey
    const idempotencyKey = `test-idemp-${Date.now()}`;
    const trf1 = await request(app)
      .post('/api/v1/transfers')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        sourceAccountId: walletAcc.id,
        destinationAccountId: cashAcc.id,
        amount: 500,
        transferDate: new Date().toISOString(),
        idempotencyKey,
      });
    expect(trf1.status).toBe(201);

    // Re-submitting with identical idempotencyKey returns existing transfer without duplicate ledger debit
    const trf2 = await request(app)
      .post('/api/v1/transfers')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        sourceAccountId: walletAcc.id,
        destinationAccountId: cashAcc.id,
        amount: 500,
        transferDate: new Date().toISOString(),
        idempotencyKey,
      });
    expect(trf2.status).toBe(201);
    expect(trf2.body.data.id).toBe(trf1.body.data.id);

    // 2. Reversal test
    const revRes = await request(app)
      .post(`/api/v1/transfers/${trf1.body.data.id}/reverse`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ reason: 'Reversing test transfer' });
    expect(revRes.status).toBe(200);
    expect(revRes.body.data.status).toBe('REVERSED');

    // Re-reversing returns 400 Bad Request
    const doubleRev = await request(app)
      .post(`/api/v1/transfers/${trf1.body.data.id}/reverse`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ reason: 'Duplicate reversal attempt' });
    expect(doubleRev.status).toBe(400);

    // 3. Deletion constraint test
    const deleteAttempt = await request(app)
      .delete(`/api/v1/accounts/${cashAcc.id}`)
      .set('Authorization', `Bearer ${userAToken}`);
    expect(deleteAttempt.status).toBe(400);
    expect(deleteAttempt.body.message).toContain('archive');
  });

  it('Super Admin Authorization & Diagnostics', async () => {
    // Normal User A cannot access /api/v1/admin/stats
    const forbiddenStats = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${userAToken}`);
    expect(forbiddenStats.status).toBe(403);

    // Super Admin can access /api/v1/admin/stats
    const adminStats = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminStats.status).toBe(200);
    expect(adminStats.body.data.totalUsers).toBeGreaterThanOrEqual(2);
  });
});
