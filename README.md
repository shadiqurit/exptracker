# Daily Expense & Income Management System

A modern, secure, responsive, and production-ready **Daily Expense & Income Tracker Web Application** built with Node.js, Express, TypeScript, Prisma ORM, MySQL 8+, Vue.js 3 (Composition API), Pinia, PrimeVue, and Apache ECharts.

---

## 🌟 Key Features

1. **Multi-User Authentication & Authorization**:
   - Secure Argon2id password hashing and short-lived JWT access tokens.
   - HttpOnly, secure refresh tokens with automatic token rotation.
   - Role-Based Access Control (`SUPER_ADMIN` and `USER`).
   - Strict user-level data isolation enforced on every backend endpoint and SQL query.
2. **Multiple Financial Accounts**:
   - Cash in hand, Bank accounts, Mobile banking (bKash/Nagad), Savings accounts, and Cards.
   - Individual and combined balance tracking with real-time ledger reconciliation.
   - Account archiving to preserve historical ledger integrity.
   - Detailed Account Statements with opening/closing balances and running totals.
3. **Double-Entry Financial Ledger Movement**:
   - All financial amounts stored using precise MySQL `DECIMAL(15,2)` precision.
   - Formula:
     $$\text{Current Balance} = \text{Opening Balance} + \sum(\text{Income}) + \sum(\text{Transfers In}) - \sum(\text{Expenses}) - \sum(\text{Transfers Out})$$
4. **Internal Account-to-Account Transfers**:
   - Atomic fund movement executed in a single ACID MySQL database transaction.
   - Transfers adjust source and destination account balances without affecting income or expense totals.
   - Complete transfer reversal and idempotency key protection against duplicate submissions.
5. **Interactive Financial Dashboard**:
   - 8 KPI cards: Total Net Wealth, Month Income, Month Expenses, Net Savings, Yearly Income, Yearly Expenses, Total Transactions, Budget Remaining.
   - Apache ECharts: Monthly Income vs Expenses, Category Expense Donut, Financial Trends, Account Distribution, Daily Velocity.
   - Quick date filters and individual account isolation filter.
6. **Audited Financial Reports & Multi-Format Exports**:
   - Daily Transaction Report
   - Monthly Financial Report (Account-wise reconciliation & category breakdown)
   - Yearly Financial Report (Month-by-month financial trend)
   - Account Statements & Category Expense Reports
   - **One-click exports in PDF, Excel (.xlsx), and CSV formats, plus print-ready view**.
7. **Budget Planning & Real-Time Monitoring**:
   - Overall monthly budget and category-specific spending targets.
   - Visual progress bars with proactive alerts at 80% and 100% threshold limits.
8. **Super Admin Management**:
   - User account activation/deactivation.
   - System operational statistics and health diagnostics.
   - Non-financial administrative isolation.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Backend API** | Node.js (v20+), Express.js, TypeScript, Prisma ORM, MySQL 8.0 |
| **Security & Auth** | Argon2id, JWT, Helmet, CORS, Express-Rate-Limit, Cookie-Parser, Zod |
| **Logging & Docs** | Pino structured logger, Pino-HTTP, Swagger UI / OpenAPI 3.0 |
| **Export Engines** | ExcelJS, PDFKit, CSV-Stringify |
| **Frontend** | Vue 3 (Composition API), Vite, TypeScript, Pinia, Vue Router |
| **UI Components** | PrimeVue 4 (Aura preset), Tailwind CSS, PrimeIcons |
| **Data Visualization** | Apache ECharts & Vue-ECharts |
| **Testing** | Vitest, Supertest |
| **DevOps** | Docker, Docker Compose, Nginx reverse proxy |

---

## 🔑 Pre-Seeded Demonstration Accounts

| Role | Email | Password | Initial State / Purpose |
|---|---|---|---|
| **User A** | `usera@example.com` | `UserA123!@#` | **Full Scenarios 1–5 pre-loaded:** Cash (৳8,000), Bank (৳72,000), Mobile Wallet (৳8,000). Total Net Wealth: **৳88,000**. |
| **User B** | `userb@example.com` | `UserB123!@#` | Multi-User Data Isolation test user. Completely independent accounts and records. |
| **Super Admin** | `sadiq@shadiqur.bd` | `Exp_tracker8080##` | User management, account activation toggle, operational metrics. |

---

## 🚀 Quick Start Guide (Local Development)

### Prerequisites
- Node.js v18+ (tested on Node v20/v24)
- MySQL Server 8.0+ running on port 3306

### 1. Database Setup
Ensure MySQL is running and create the database:
```sql
CREATE DATABASE IF NOT EXISTS expense_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Push schema to MySQL and generate Prisma client
npx prisma db push

# Seed demo users, categories, and test scenarios
npx tsx prisma/seed.ts

# Start backend server in development mode
npm run dev
```
Backend API will be running at `http://localhost:5000`.
Swagger API Docs will be available at `http://localhost:5000/api/docs`.

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🧪 Automated Testing

The repository includes integration tests verifying multi-user data isolation, financial reconciliation, atomic transfers, idempotency, and reversals.

To run the test suite:
```bash
cd backend
npm test
```

All 5 test suites verify:
- **Scenario 1:** Complete data isolation between User A and User B.
- **Scenario 2–5:** Multi-account balances, income deposits, expense deductions, and fund transfers equaling ৳88,000.
- **Scenario 6:** Monthly financial reports match ledger entries.
- **Scenario 7:** Transfer idempotency, reversal restorations, and deletion constraints on accounts with historical transactions.
- **Admin Security:** Strict role checks preventing standard users from accessing administrative endpoints.

---

## 🐳 Docker Deployment

To launch the complete application stack (MySQL 8.0, Backend, Frontend, and Nginx reverse proxy):

```bash
docker compose up -d --build
```
Access the application at `http://localhost`.

---

## 📁 Repository Structure

```text
exptracker/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema & ledger models
│   │   └── seed.ts             # Realistic seed data matching test scenarios
│   ├── src/
│   │   ├── config/             # Environment, Prisma & Pino logger
│   │   ├── controllers/        # Express controllers (Auth, Accounts, Transactions, etc.)
│   │   ├── middleware/         # Auth, validation, and error handlers
│   │   ├── routes/             # REST API v1 routing
│   │   ├── services/           # Business logic & ledger calculations
│   │   ├── validators/         # Zod request validation schemas
│   │   └── app.ts              # Express application entry
│   ├── tests/                  # Vitest integration tests
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/                # Axios client with auto-refresh interceptors
│   │   ├── components/         # Sidebar, Navbar, KpiCard
│   │   ├── layouts/            # AppLayout with responsive sidebar
│   │   ├── router/             # Vue Router navigation guards
│   │   ├── stores/             # Pinia Auth and Theme stores
│   │   ├── views/              # Dashboard, Accounts, Income, Expenses, Reports, etc.
│   │   └── main.ts             # PrimeVue & ECharts initialization
│   ├── Dockerfile
│   └── package.json
├── nginx/
│   └── nginx.conf              # Reverse proxy configuration
├── docs/
│   └── api.md                  # REST API specification
├── docker-compose.yml          # Containerized deployment
├── instructions.md             # Master specification requirements
└── README.md
```
