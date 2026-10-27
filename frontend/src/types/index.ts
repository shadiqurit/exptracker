export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  authProvider?: string | null;
  defaultCurrency: string;
  timezone: string;
  roles: string[];
}

export type AccountType =
  | 'CASH'
  | 'BANK'
  | 'MOBILE_BANKING'
  | 'DEBIT_CARD'
  | 'CREDIT_CARD'
  | 'SAVINGS'
  | 'DIGITAL_WALLET'
  | 'OTHER';

export type AccountStatus = 'ACTIVE' | 'ARCHIVED';

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  accountNumber?: string | null;
  bankName?: string | null;
  currency: string;
  openingBalance: number;
  currentBalance: number;
  status: AccountStatus;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: string;
  userId?: string | null;
  name: string;
  type: TransactionType;
  icon?: string | null;
  color?: string | null;
  isSystem: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  subcategoryId?: string | null;
  type: TransactionType;
  amount: number;
  transactionDate: string;
  description?: string | null;
  merchant?: string | null;
  referenceNumber?: string | null;
  receiptUrl?: string | null;
  isRecurring: boolean;
  createdAt: string;
  account: {
    id: string;
    name: string;
    type: AccountType;
    currency: string;
  };
  category: {
    id: string;
    name: string;
    type: TransactionType;
    icon?: string | null;
    color?: string | null;
  };
}

export interface Transfer {
  id: string;
  userId: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  transferDate: string;
  referenceNumber?: string | null;
  description?: string | null;
  status: 'COMPLETED' | 'REVERSED';
  reversalReason?: string | null;
  createdAt: string;
  sourceAccount: {
    id: string;
    name: string;
    type: AccountType;
    currency: string;
  };
  destinationAccount: {
    id: string;
    name: string;
    type: AccountType;
    currency: string;
  };
}

export interface Budget {
  id: string;
  userId: string;
  categoryId?: string | null;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  amount: number;
  actualSpent: number;
  remaining: number;
  percentage: number;
  month: number;
  year: number;
  alertThreshold80: boolean;
  alertThreshold100: boolean;
  isWarning80: boolean;
  isExceeded100: boolean;
}

export interface DashboardSummary {
  totalAccountBalance: number;
  totalIncomeThisMonth: number;
  totalExpensesThisMonth: number;
  netSavingsThisMonth: number;
  totalIncomeThisYear: number;
  totalExpensesThisYear: number;
  totalTransactions: number;
  monthlyBudgetTotal?: number | null;
  monthlyBudgetRemaining?: number | null;
}
