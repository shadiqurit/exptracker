# AI Agent Master Prompt: Daily Expense & Income Management System

## 1. Project Overview

Act as a **Senior Full-Stack Software Engineer, Database Architect, UI/UX Designer, and Software Security Engineer**.

Build a complete, modern, secure, responsive, and production-ready **Daily Expense & Income Tracker Web Application**.

The application must support:

- Multi-user authentication and authorization
- Multiple financial accounts per user
- Income and expense management
- Account-to-account fund transfers
- Financial categories and subcategories
- Daily, monthly, and yearly reports
- Interactive financial dashboards
- Account balance tracking
- Budget planning and monitoring
- Advanced search and filtering
- Excel, CSV, and PDF report exports
- Strict user-wise data isolation
- Responsive desktop, tablet, and mobile interfaces

**Primary goal:** Help individuals efficiently track income, expenses, account balances, savings, and financial performance across multiple accounts.

Build a real, functioning application with persistent MySQL storage, REST APIs, authentication, validation, reporting, and deployment-ready configuration. Do not create only a static UI prototype.

---

## 2. Technology Stack

### Backend

- Node.js with TypeScript
- Express.js REST API
- Prisma ORM
- MySQL 8+
- JWT authentication with secure refresh-token handling
- Argon2id password hashing
- Zod for API request validation
- Helmet, CORS, and rate limiting
- Swagger/OpenAPI documentation
- Pino structured logging

### Frontend

- Vue.js 3 with Composition API
- TypeScript
- Vite
- Vue Router
- Pinia for state management
- Tailwind CSS
- PrimeVue UI component library
- Apache ECharts for dashboards and analytical charts
- Axios for API communication
- VeeValidate and Zod for forms
- Day.js for date handling

### Development and Deployment

- Docker and Docker Compose
- Nginx reverse proxy
- Environment-based configuration
- Database migrations and seed scripts
- Vitest for unit testing
- Supertest for API integration testing
- Playwright for end-to-end testing

Follow clean architecture, reusable components, modular APIs, strong security, and maintainable project structure.

---

## 3. User Authentication and Access Control

Implement a secure authentication system.

### Features

1. User registration
2. Login using email and password
3. Logout
4. Password change
5. Forgot/reset password
6. Profile management
7. User activation/deactivation by admin
8. Role-based authorization
9. User-specific financial data visibility
10. Secure session renewal

### Roles

**SUPER_ADMIN**
- Manage application users
- Activate/deactivate user accounts
- View system configuration and nonfinancial operational statistics
- Manage system settings
- Cannot automatically view private user financial records

**USER**
- Manage own accounts
- Create income and expense transactions
- Transfer funds between own accounts
- Manage personal financial categories and budgets
- View own reports and dashboards
- Export own financial information

### Mandatory Data Isolation

Every financial record must belong to a user.

For example:

- User A has Cash, Bank, and Mobile Wallet accounts.
- User B has Cash and Savings accounts.
- User A must never see, edit, delete, transfer from, or report on User B's data.

Enforce authorization on every backend endpoint and database query, not only in the frontend.

Never trust `user_id` submitted from the client. Derive the authenticated user identity from the verified access token.

All account IDs, category IDs, transaction IDs, and budget IDs must be checked for ownership before use.

---

## 4. Multiple Financial Accounts

Users can create and manage unlimited personal financial accounts.

### Account Types

- Cash
- Bank Account
- Mobile Banking
- Debit Card
- Credit Card
- Savings Account
- Digital Wallet
- Other

### Account Fields

- Account ID
- User ID
- Account Name
- Account Type
- Account Number (optional, masked when displayed)
- Bank/Provider Name (optional)
- Currency
- Opening Balance
- Account Status
- Description
- Created At
- Updated At

### Account Features

- Create/edit/archive accounts
- Set opening balances
- View current account balances
- Account-wise transaction history
- Account-wise income and expense summary
- Account-to-account transfers
- Filter transactions by account
- Show balances on dashboard

### Account Balance Calculation

For ordinary asset accounts:

`Current Balance = Opening Balance + Income + Transfers In - Expenses - Transfers Out`

Use a ledger-based architecture and precise decimal calculations. Do not store financial amounts as floating-point values.

Credit card and liability accounts need separate balance semantics so debt is not incorrectly counted as cash.

Archived accounts must retain their financial history.

---

## 5. Income Management Module

Allow users to record income from different sources.

### Income Categories

- Salary
- Freelancing
- Business Income
- Bonus
- Investment Income
- Rental Income
- Gifts
- Refunds
- Other Income

### Income Entry Fields

- Transaction ID
- User
- Financial Account
- Income Category
- Amount
- Transaction Date
- Description
- Reference Number
- Payment Source
- Attachment (optional)
- Created At
- Updated At

### Features

- Add income
- Edit income
- Delete or void income with appropriate audit history
- Search income
- Filter by category, account, or date
- Income history
- Monthly income summary
- Yearly income summary
- Income breakdown charts
- Recurring income transactions (optional advanced feature)

---

## 6. Expense Management Module

Build a fully functional daily expense tracker.

### Expense Categories

- Food & Groceries
- House Rent
- Electricity
- Water
- Internet
- Transportation
- Shopping
- Healthcare
- Education
- Entertainment
- Mobile Recharge
- Family Expenses
- Travel
- Loan Payment
- Subscriptions
- Miscellaneous

Users must be able to create custom categories and subcategories.

### Expense Entry Fields

- Expense Transaction ID
- User ID
- Account ID
- Expense Category
- Subcategory
- Expense Amount
- Expense Date
- Merchant/Payee
- Description
- Payment Reference
- Attachment/Receipt
- Created At
- Updated At

### Expense Features

- Quick daily expense entry
- Add/edit/delete or void expenses
- Category-wise expenses
- Account-wise expenses
- Daily transaction history
- Weekly expense summaries
- Monthly expense summaries
- Yearly expense summaries
- Most expensive categories
- Expense trends
- Advanced filtering
- Search by description or merchant
- Optional recurring expenses

Allow users to enter transactions dated in the past.

Use clear date-range filters and sorting.

---

## 7. Account-to-Account Transfers

Implement a dedicated internal funds transfer module.

Example:

Transfer BDT 5,000 from Cash to Bank.

Expected result:

- Cash balance decreases by BDT 5,000
- Bank balance increases by BDT 5,000
- Total combined assets remain unchanged
- Transfer is not considered income or expense

### Required Fields

- Transfer ID
- User ID
- Source Account
- Destination Account
- Transfer Amount
- Transfer Date
- Reference Number
- Description

Requirements:

- Both accounts must belong to the authenticated user.
- Source and destination cannot be the same account.
- Use a single MySQL database transaction for both transfer entries.
- Prevent partial transfers.
- Support transfer reversal.
- Prevent duplicate submissions with idempotency keys.
- Apply account balance policies consistently.

For different currencies, store source amount, destination amount, exchange rate, and applicable fees separately.

---

## 8. Financial Dashboard

Design an attractive, professional dashboard with meaningful charts and summary cards.

### Dashboard KPI Cards

1. Total Account Balance
2. Total Income This Month
3. Total Expenses This Month
4. Net Savings This Month
5. Total Income This Year
6. Total Expenses This Year
7. Total Number of Transactions
8. Monthly Budget Remaining

Use meaningful icons, readable number formatting, and consistent UI colors.

### Dashboard Chart Requirements

**Chart 1: Monthly Income vs Expenses**
- Bar chart
- Last 12 months
- Monthly totals

**Chart 2: Expense by Category**
- Donut chart
- Percentage breakdown
- Category labels and tooltips

**Chart 3: Yearly Financial Trend**
- Line chart
- Income
- Expense
- Net savings

**Chart 4: Account Balances**
- Horizontal bar chart
- Separate financial accounts

**Chart 5: Daily Expense Trend**
- Line or area chart
- Selected month

**Chart 6: Budget Utilization**
- Progress bars
- Budgeted vs actual expense

### Dashboard Filters

- Today
- Yesterday
- Last 7 Days
- This Month
- Last Month
- This Year
- Custom Date Range
- Financial Account
- Category

All KPI cards and charts must update together when applicable filters change.

---

## 9. Reports Module

Implement a comprehensive report management system.

### A. Daily Transaction Report

Display:

- Date
- Account
- Category
- Transaction Type
- Description
- Income
- Expense
- Running Balance

### B. Monthly Financial Report

Display:

- Month and Year
- Opening Balance
- Total Income
- Total Expense
- Net Income
- Closing Balance
- Account-wise Breakdown
- Category-wise Expenses

Formula:

`Net Income = Total Income - Total Expense`

For an asset account without other adjustments:

`Closing Balance = Opening Balance + Income - Expense + Net Transfers`

### C. Yearly Financial Report

Display:

- January to December
- Monthly Income
- Monthly Expense
- Monthly Net Savings
- Yearly Income Total
- Yearly Expense Total
- Annual Financial Trends

### D. Account Statement

Include:

- Account Name
- Selected Date Range
- Opening Balance
- Debit/Credit or Money In/Money Out
- Transaction Description
- Running Balance
- Closing Balance

### E. Category-Wise Expense Report

Display:

- Expense Category
- Total Amount
- Transaction Count
- Percentage of Total Expenses

### F. Income vs Expense Report

Provide monthly and yearly comparisons.

### Export Options

Every applicable report must support:

- PDF
- Excel (.xlsx)
- CSV
- Print-friendly view

Exported reports must respect the same authorized user scope and selected filters as the on-screen report.

---

## 10. Budget Management

Allow users to set monthly budgets.

### Features

- Overall monthly budget
- Category-wise budget
- Actual expense comparison
- Remaining budget calculation
- Budget usage percentage
- Dashboard budget tracking
- Warning when spending reaches 80%
- Alert when spending reaches 100%

Use clear progress indicators and alert messages.

---

## 11. Database Architecture

Design a normalized MySQL database with suitable indexes, foreign keys, referential integrity, and audit fields.

Suggested tables:

| Table Name | Purpose |
|---|---|
| users | Authentication and profiles |
| roles | System roles |
| user_roles | Role assignment |
| accounts | Financial accounts |
| account_types | Financial account types |
| categories | Income/expense categories |
| subcategories | Optional category hierarchy |
| transactions | Financial transaction headers |
| ledger_entries | Financial balance movements |
| transfers | Internal account transfers |
| budgets | Budget definitions |
| recurring_transactions | Recurring transaction templates |
| attachments | Transaction receipts |
| refresh_tokens | Secure session management |
| audit_logs | Record modification history |
| user_settings | Currency, locale, timezone |
| currencies | Supported currencies |

### Database Requirements

- Use UUID or suitably generated unique identifiers consistently.
- Store money using MySQL `DECIMAL`, not `FLOAT` or `DOUBLE`.
- Add foreign keys to maintain valid relationships.
- Add appropriate indexes for user, account, date, category, and transaction type.
- Track `created_at` and `updated_at`.
- Preserve data integrity for transfers.
- Use database transactions for financial writes.
- Support safe migration and rollback procedures.
- Provide realistic seed data.

Implement a consistent immutable ledger approach or carefully controlled reversal records to preserve financial correctness.

Do not duplicate income or expenses in both transactions and ledger entries during reporting.

Reports must derive correct values from the selected transaction and ledger model.

---

## 12. REST API Architecture

Create a versioned REST API using `/api/v1`.

### Authentication

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/me`

### Accounts

- `GET /accounts`
- `POST /accounts`
- `GET /accounts/:id`
- `PATCH /accounts/:id`
- `GET /accounts/:id/balance`
- `GET /accounts/:id/statement`

### Categories

- `GET /categories`
- `POST /categories`
- `PATCH /categories/:id`
- `DELETE /categories/:id`

### Transactions

- `GET /transactions`
- `POST /transactions`
- `GET /transactions/:id`
- `PATCH /transactions/:id`
- `DELETE /transactions/:id`

### Transfers

- `POST /transfers`
- `GET /transfers`
- `GET /transfers/:id`
- `POST /transfers/:id/reverse`

### Dashboard

- `GET /dashboard/summary`
- `GET /dashboard/monthly-trends`
- `GET /dashboard/category-expenses`
- `GET /dashboard/account-balances`

### Reports

- `GET /reports/daily`
- `GET /reports/monthly`
- `GET /reports/yearly`
- `GET /reports/accounts`
- `GET /reports/categories`
- `GET /reports/export`

### Budget

- `GET /budgets`
- `POST /budgets`
- `PATCH /budgets/:id`
- `DELETE /budgets/:id`

Use standardized JSON responses, pagination, validation errors, and appropriate HTTP status codes.

---

## 13. Frontend Pages and Navigation

Create a professional sidebar-based application layout.

### Main Navigation

1. Dashboard
2. Income
3. Expenses
4. All Transactions
5. Fund Transfers
6. Financial Accounts
7. Categories
8. Budgets
9. Reports
   - Daily Report
   - Monthly Report
   - Yearly Report
   - Account Statement
   - Category Summary
10. Profile
11. Settings
12. Administration (admin only)

### UI/UX Requirements

- Clean financial SaaS interface
- Responsive layout
- Collapsible sidebar
- Mobile-friendly navigation
- Light and dark themes
- Consistent spacing and typography
- Summary cards
- Data tables with pagination
- Searchable dropdown fields
- Account and category filters
- Modal forms or drawer forms
- Confirmation dialogs
- Toast notifications
- Loading skeletons
- Empty-state messages
- Accessible form controls and keyboard navigation
- Fast transaction entry workflow

Make the application's main dashboard visually appealing but prioritize real usability and correct information over decoration.

---

## 14. Additional Features

### Search and Filtering

- Date range
- Account
- Category
- Transaction type
- Amount range
- Description
- Merchant or payee

### Currency and Localization

- Default currency: BDT (Bangladeshi Taka)
- Support optional additional currencies.
- Store currency codes with account and transaction records.
- Do not add different currencies together without explicit conversion.
- Properly format amounts and dates.
- Support user-selected timezone.
- Default timezone: Asia/Dhaka.

### Settings

- Profile settings
- Default currency
- Timezone
- Date format
- Theme
- Financial year start month
- Account preferences
- Data export

---

## 15. Security Requirements

Security is mandatory.

Implement:

- Authentication and role-based authorization
- User-level ownership enforcement
- Secure password hashing with Argon2id
- Short-lived access tokens
- Secure refresh-token rotation
- HttpOnly, Secure, SameSite cookies when storing refresh tokens
- CSRF protection where cookie-based authentication requires it
- API request validation
- ORM parameterized queries
- Safe output rendering
- Rate limiting on authentication endpoints
- Strict CORS configuration
- Security headers
- Secure file upload validation
- Audit logging
- Controlled error responses
- Environment secrets management
- Protection against unauthorized financial data access

Never rely on a frontend-supplied user ID to authorize data.

Build integration tests to verify that one user cannot access or modify another user's financial accounts, transactions, budgets, or exported reports.

---

## 16. Project Folder Structure

Use a clean, organized monorepo structure:

```text
expense-tracker/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── validators/
│   │   ├── utils/
│   │   ├── types/
│   │   └── app.ts
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── composables/
│   │   ├── layouts/
│   │   ├── router/
│   │   ├── stores/
│   │   ├── views/
│   │   ├── types/
│   │   └── App.vue
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── nginx/
├── docs/
├── .env.example
└── README.md
```

---

## 17. Testing and Acceptance Criteria

The application is complete only when these scenarios pass.

**Scenario 1: Multiple Users**

Create User A and User B. Verify they cannot access one another's financial data through the frontend, API, or direct ID manipulation.

**Scenario 2: Multiple Accounts**

User A creates:

- Cash: BDT 10,000
- Bank: BDT 25,000
- Mobile Wallet: BDT 5,000

Combined initial balance: BDT 40,000.

**Scenario 3: Income**

User A receives salary of BDT 50,000 in Bank.

Bank balance becomes BDT 75,000.

**Scenario 4: Expense**

User A spends BDT 2,000 from Cash.

Cash balance becomes BDT 8,000.

**Scenario 5: Fund Transfer**

User A transfers BDT 3,000 from Bank to Mobile Wallet.

Expected balances:

- Cash: BDT 8,000
- Bank: BDT 72,000
- Mobile Wallet: BDT 8,000

**Expected combined balance: BDT 88,000.**

Total income: BDT 50,000.

Total expense: BDT 2,000.

The BDT 3,000 transfer must not affect income or expense totals.

**Scenario 6: Reports**

Verify monthly and yearly reports match the actual ledger transaction totals.

**Scenario 7: Data Consistency**

Verify the following:

- A failed fund transfer rolls back completely.
- Duplicate transfer requests do not create duplicate ledger entries.
- Reversals restore correct balances.
- Editing a past transaction produces correct historical balances.
- Concurrent transactions cannot corrupt account balances.
- Accounts with historical transactions cannot be hard-deleted.
- Different currencies are never silently aggregated.

---

## 18. Development Execution Plan

Build the project in phases.

**Phase 1 — Architecture and Database**
- Define the database schema.
- Explain balance accounting and ledger behavior.
- Create Prisma models, relationships, constraints, and migrations.
- Generate initial seed data.

**Phase 2 — Backend API**
- Authentication
- User-wise authorization
- Account management
- Income and expense transactions
- Fund transfers
- Financial reporting endpoints

**Phase 3 — Frontend Development**
- Authentication pages
- Application layout
- Dashboard
- Accounts
- Income
- Expenses
- Transfers
- Reports
- Settings

**Phase 4 — Advanced Features**
- Budgets
- Receipt attachments
- Recurring transactions
- PDF/Excel exports
- Custom reporting filters

**Phase 5 — Testing and Deployment**
- API tests
- Authorization tests
- Financial reconciliation tests
- Frontend tests
- Docker deployment
- README documentation

---

## 19. AI Agent Working Instructions

You must behave as a real software engineering agent, not just provide high-level recommendations.

1. Inspect the existing repository before making changes. If empty, initialize the project.
2. Produce a concise implementation plan and document your architectural decisions.
3. Implement working source code, not pseudocode.
4. Follow the defined technology stack.
5. Create MySQL tables using Prisma migrations.
6. Implement and connect real REST APIs.
7. Build functional Vue components wired to the backend.
8. Never hardcode dashboard financial figures.
9. Never use fake API responses in the finished application.
10. Use safe, reusable components and centralized error handling.
11. Execute available builds, tests, and database checks.
12. Fix errors encountered during implementation.
13. Keep setup and environment instructions updated.
14. Document unfinished features and limitations explicitly.
15. Avoid unnecessary dependencies.
16. Apply security controls throughout development.
17. Deliver a functioning application with testable modules.

### Final Deliverables

- Complete backend source code
- Complete Vue frontend
- MySQL database schema and migrations
- Seed data
- Working authentication
- Functional account, income, expense, and transfer modules
- Interactive dashboard
- Monthly and yearly reports
- Budget management
- Working exports
- API documentation
- Automated tests
- Docker configuration
- Deployment and installation guide
- Example environment file

**Start by designing the database schema and ledger rules, then implement the backend, frontend, reports, and tests in logical phases. Continue through the deliverables, verifying each completed phase before moving to the next.**
