import { PrismaClient, RoleName, AccountType, CategoryType, TransactionType, LedgerEntryType, LedgerDirection } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Roles
  const roles = [
    { name: RoleName.SUPER_ADMIN, description: 'Super Administrator with system configuration and user management privileges' },
    { name: RoleName.USER, description: 'Standard application user with full personal finance management capabilities' },
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: r,
    });
  }
  const superAdminRole = await prisma.role.findUniqueOrThrow({ where: { name: RoleName.SUPER_ADMIN } });
  const userRole = await prisma.role.findUniqueOrThrow({ where: { name: RoleName.USER } });

  // 2. Default System Categories
  const systemIncomeCategories = [
    { name: 'Salary', icon: 'pi pi-wallet', color: '#10B981' },
    { name: 'Freelancing', icon: 'pi pi-desktop', color: '#3B82F6' },
    { name: 'Business Income', icon: 'pi pi-briefcase', color: '#6366F1' },
    { name: 'Bonus', icon: 'pi pi-star', color: '#F59E0B' },
    { name: 'Investment Income', icon: 'pi pi-chart-line', color: '#8B5CF6' },
    { name: 'Rental Income', icon: 'pi pi-home', color: '#EC4899' },
    { name: 'Gifts', icon: 'pi pi-gift', color: '#14B8A6' },
    { name: 'Refunds', icon: 'pi pi-replay', color: '#06B6D4' },
    { name: 'Other Income', icon: 'pi pi-dollar', color: '#64748B' },
  ];

  const systemExpenseCategories = [
    { name: 'Food & Groceries', icon: 'pi pi-shopping-bag', color: '#EF4444' },
    { name: 'House Rent', icon: 'pi pi-building', color: '#F97316' },
    { name: 'Electricity', icon: 'pi pi-bolt', color: '#F59E0B' },
    { name: 'Water', icon: 'pi pi-tint', color: '#06B6D4' },
    { name: 'Internet', icon: 'pi pi-wifi', color: '#3B82F6' },
    { name: 'Transportation', icon: 'pi pi-car', color: '#6366F1' },
    { name: 'Shopping', icon: 'pi pi-cart-plus', color: '#EC4899' },
    { name: 'Healthcare', icon: 'pi pi-heart', color: '#DC2626' },
    { name: 'Education', icon: 'pi pi-book', color: '#8B5CF6' },
    { name: 'Entertainment', icon: 'pi pi-play', color: '#A855F7' },
    { name: 'Mobile Recharge', icon: 'pi pi-mobile', color: '#10B981' },
    { name: 'Family Expenses', icon: 'pi pi-users', color: '#14B8A6' },
    { name: 'Travel', icon: 'pi pi-compass', color: '#0EA5E9' },
    { name: 'Loan Payment', icon: 'pi pi-credit-card', color: '#78716C' },
    { name: 'Subscriptions', icon: 'pi pi-sync', color: '#4F46E5' },
    { name: 'Miscellaneous', icon: 'pi pi-tag', color: '#64748B' },
  ];

  for (const cat of systemIncomeCategories) {
    await prisma.category.upsert({
      where: { userId_name_type: { userId: 'system', name: cat.name, type: CategoryType.INCOME } },
      update: { icon: cat.icon, color: cat.color, isSystem: true },
      create: {
        userId: null,
        name: cat.name,
        type: CategoryType.INCOME,
        icon: cat.icon,
        color: cat.color,
        isSystem: true,
      },
    }).catch(async () => {
      // If already exists with null userId
      const existing = await prisma.category.findFirst({
        where: { userId: null, name: cat.name, type: CategoryType.INCOME },
      });
      if (!existing) {
        await prisma.category.create({
          data: {
            userId: null,
            name: cat.name,
            type: CategoryType.INCOME,
            icon: cat.icon,
            color: cat.color,
            isSystem: true,
          },
        });
      }
    });
  }

  for (const cat of systemExpenseCategories) {
    const existing = await prisma.category.findFirst({
      where: { userId: null, name: cat.name, type: CategoryType.EXPENSE },
    });
    if (!existing) {
      await prisma.category.create({
        data: {
          userId: null,
          name: cat.name,
          type: CategoryType.EXPENSE,
          icon: cat.icon,
          color: cat.color,
          isSystem: true,
        },
      });
    }
  }

  // 3. Super Admin User
  const adminPasswordHash = await argon2.hash('Exp_tracker8080##');
  const adminUser = await prisma.user.upsert({
    where: { email: 'sadiq@shadiqur.bd' },
    update: {
      passwordHash: adminPasswordHash,
    },
    create: {
      email: 'sadiq@shadiqur.bd',
      passwordHash: adminPasswordHash,
      firstName: 'Sadiq',
      lastName: 'Administrator',
      defaultCurrency: 'BDT',
      timezone: 'Asia/Dhaka',
      roles: {
        create: { roleId: superAdminRole.id },
      },
    },
  });

  // 4. User A (For Instruction Scenarios 1-5)
  const userAPasswordHash = await argon2.hash('UserA123!@#');
  const userA = await prisma.user.upsert({
    where: { email: 'usera@example.com' },
    update: {},
    create: {
      email: 'usera@example.com',
      passwordHash: userAPasswordHash,
      firstName: 'User',
      lastName: 'A',
      defaultCurrency: 'BDT',
      timezone: 'Asia/Dhaka',
      roles: {
        create: { roleId: userRole.id },
      },
    },
  });

  // 5. User B (For Isolation Testing)
  const userBPasswordHash = await argon2.hash('UserB123!@#');
  const userB = await prisma.user.upsert({
    where: { email: 'userb@example.com' },
    update: {},
    create: {
      email: 'userb@example.com',
      passwordHash: userBPasswordHash,
      firstName: 'User',
      lastName: 'B',
      defaultCurrency: 'BDT',
      timezone: 'Asia/Dhaka',
      roles: {
        create: { roleId: userRole.id },
      },
    },
  });

  // Clean existing financial records for User A to cleanly implement Scenarios 2 - 5
  await prisma.ledgerEntry.deleteMany({ where: { userId: userA.id } });
  await prisma.transaction.deleteMany({ where: { userId: userA.id } });
  await prisma.transfer.deleteMany({ where: { userId: userA.id } });
  await prisma.budget.deleteMany({ where: { userId: userA.id } });
  await prisma.account.deleteMany({ where: { userId: userA.id } });

  // User A Accounts (Scenario 2):
  // Cash: 10,000, Bank: 25,000, Mobile Wallet: 5,000. Combined: 40,000
  const cashAccountA = await prisma.account.create({
    data: {
      userId: userA.id,
      name: 'Cash In Hand',
      type: AccountType.CASH,
      currency: 'BDT',
      openingBalance: 10000.00,
      description: 'Physical cash wallet',
    },
  });

  const bankAccountA = await prisma.account.create({
    data: {
      userId: userA.id,
      name: 'City Bank Savings',
      type: AccountType.BANK,
      accountNumber: '••••••••4756',
      bankName: 'City Bank Ltd.',
      currency: 'BDT',
      openingBalance: 25000.00,
      description: 'Primary salary account',
    },
  });

  const walletAccountA = await prisma.account.create({
    data: {
      userId: userA.id,
      name: 'bKash Wallet',
      type: AccountType.MOBILE_BANKING,
      accountNumber: '•••••••5229',
      bankName: 'bKash Limited',
      currency: 'BDT',
      openingBalance: 5000.00,
      description: 'Daily mobile wallet',
    },
  });

  // Create Opening Balance Ledger Entries for User A's accounts
  await prisma.ledgerEntry.createMany({
    data: [
      {
        accountId: cashAccountA.id,
        userId: userA.id,
        entryType: LedgerEntryType.OPENING_BALANCE,
        direction: LedgerDirection.CREDIT,
        amount: 10000.00,
        entryDate: new Date('2026-10-01T00:00:00.000Z'),
        description: 'Account Opening Balance',
      },
      {
        accountId: bankAccountA.id,
        userId: userA.id,
        entryType: LedgerEntryType.OPENING_BALANCE,
        direction: LedgerDirection.CREDIT,
        amount: 25000.00,
        entryDate: new Date('2026-10-01T00:00:00.000Z'),
        description: 'Account Opening Balance',
      },
      {
        accountId: walletAccountA.id,
        userId: userA.id,
        entryType: LedgerEntryType.OPENING_BALANCE,
        direction: LedgerDirection.CREDIT,
        amount: 5000.00,
        entryDate: new Date('2026-10-01T00:00:00.000Z'),
        description: 'Account Opening Balance',
      },
    ],
  });

  // Scenario 3: User A receives salary of BDT 50,000 in Bank
  const salaryCategory = await prisma.category.findFirstOrThrow({
    where: { name: 'Salary', type: CategoryType.INCOME },
  });

  const salaryTx = await prisma.transaction.create({
    data: {
      userId: userA.id,
      accountId: bankAccountA.id,
      categoryId: salaryCategory.id,
      type: TransactionType.INCOME,
      amount: 50000.00,
      transactionDate: new Date('2026-10-05T10:00:00.000Z'),
      description: 'October Monthly Salary Deposit',
      referenceNumber: 'SAL-202610-01',
    },
  });

  await prisma.ledgerEntry.create({
    data: {
      accountId: bankAccountA.id,
      userId: userA.id,
      transactionId: salaryTx.id,
      entryType: LedgerEntryType.INCOME,
      direction: LedgerDirection.CREDIT,
      amount: 50000.00,
      entryDate: salaryTx.transactionDate,
      description: 'October Monthly Salary Deposit',
    },
  });

  // Scenario 4: User A spends BDT 2,000 from Cash
  const groceriesCategory = await prisma.category.findFirstOrThrow({
    where: { name: 'Food & Groceries', type: CategoryType.EXPENSE },
  });

  const groceryTx = await prisma.transaction.create({
    data: {
      userId: userA.id,
      accountId: cashAccountA.id,
      categoryId: groceriesCategory.id,
      type: TransactionType.EXPENSE,
      amount: 2000.00,
      transactionDate: new Date('2026-10-08T15:30:00.000Z'),
      description: 'Weekly grocery shopping at Shwapno',
      merchant: 'Shwapno Superstore',
    },
  });

  await prisma.ledgerEntry.create({
    data: {
      accountId: cashAccountA.id,
      userId: userA.id,
      transactionId: groceryTx.id,
      entryType: LedgerEntryType.EXPENSE,
      direction: LedgerDirection.DEBIT,
      amount: 2000.00,
      entryDate: groceryTx.transactionDate,
      description: 'Weekly grocery shopping at Shwapno',
    },
  });

  // Scenario 5: User A transfers BDT 3,000 from Bank to Mobile Wallet
  const transfer = await prisma.transfer.create({
    data: {
      userId: userA.id,
      sourceAccountId: bankAccountA.id,
      destinationAccountId: walletAccountA.id,
      amount: 3000.00,
      transferDate: new Date('2026-10-12T11:00:00.000Z'),
      referenceNumber: 'TRF-BKASH-001',
      description: 'Fund reload to bKash',
    },
  });

  await prisma.ledgerEntry.createMany({
    data: [
      {
        accountId: bankAccountA.id,
        userId: userA.id,
        transferId: transfer.id,
        entryType: LedgerEntryType.TRANSFER_OUT,
        direction: LedgerDirection.DEBIT,
        amount: 3000.00,
        entryDate: transfer.transferDate,
        description: 'Fund transfer to bKash Wallet',
      },
      {
        accountId: walletAccountA.id,
        userId: userA.id,
        transferId: transfer.id,
        entryType: LedgerEntryType.TRANSFER_IN,
        direction: LedgerDirection.CREDIT,
        amount: 3000.00,
        entryDate: transfer.transferDate,
        description: 'Fund transfer from City Bank Savings',
      },
    ],
  });

  // Budgets for User A
  const now = new Date();
  await prisma.budget.create({
    data: {
      userId: userA.id,
      categoryId: null, // Overall monthly budget
      amount: 40000.00,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      alertThreshold80: true,
      alertThreshold100: true,
    },
  });

  await prisma.budget.create({
    data: {
      userId: userA.id,
      categoryId: groceriesCategory.id,
      amount: 15000.00,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      alertThreshold80: true,
      alertThreshold100: false,
    },
  });

  // Setup Accounts for User B (Scenario 1 & 2 Isolation)
  await prisma.ledgerEntry.deleteMany({ where: { userId: userB.id } });
  await prisma.transaction.deleteMany({ where: { userId: userB.id } });
  await prisma.account.deleteMany({ where: { userId: userB.id } });

  const cashAccountB = await prisma.account.create({
    data: {
      userId: userB.id,
      name: 'User B Cash',
      type: AccountType.CASH,
      currency: 'BDT',
      openingBalance: 15000.00,
      description: 'Private cash for User B',
    },
  });

  const savingsAccountB = await prisma.account.create({
    data: {
      userId: userB.id,
      name: 'User B BRAC Bank Savings',
      type: AccountType.SAVINGS,
      currency: 'BDT',
      openingBalance: 60000.00,
      description: 'Savings account for User B',
    },
  });

  await prisma.ledgerEntry.createMany({
    data: [
      {
        accountId: cashAccountB.id,
        userId: userB.id,
        entryType: LedgerEntryType.OPENING_BALANCE,
        direction: LedgerDirection.CREDIT,
        amount: 15000.00,
        entryDate: new Date('2026-10-01T00:00:00.000Z'),
        description: 'Opening balance',
      },
      {
        accountId: savingsAccountB.id,
        userId: userB.id,
        entryType: LedgerEntryType.OPENING_BALANCE,
        direction: LedgerDirection.CREDIT,
        amount: 60000.00,
        entryDate: new Date('2026-10-01T00:00:00.000Z'),
        description: 'Opening balance',
      },
    ],
  });

  console.log('✅ Seeding completed successfully!');
  console.log('Credentials:');
  console.log('  Super Admin: sadiq@shadiqur.bd / Exp_tracker8080##');
  console.log('  User A:      usera@example.com / UserA123!@#');
  console.log('  User B:      userb@example.com / UserB123!@#');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
