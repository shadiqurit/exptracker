# Expense Tracker REST API Documentation

The REST API is versioned under `/api/v1` and protected by JWT access tokens and HTTP-Only refresh cookies with rotation.

## Base URL
- Development: `http://localhost:5000/api/v1`
- Swagger UI Documentation: `http://localhost:5000/api/docs`

## Authentication Endpoints

### 1. Register User
`POST /auth/register`
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+8801700000000",
  "defaultCurrency": "BDT",
  "timezone": "Asia/Dhaka"
}
```

### 2. Login
`POST /auth/login`
```json
{
  "email": "usera@example.com",
  "password": "UserA123!@#"
}
```

### 3. Refresh Access Token
`POST /auth/refresh`
(Automatically sends refresh token via HttpOnly cookie or in JSON body)

### 4. Logout
`POST /auth/logout`

---

## Accounts Endpoints

### 1. List Accounts with Calculated Balances
`GET /accounts` (Header: `Authorization: Bearer <token>`)

### 2. Create Account
`POST /accounts`
```json
{
  "name": "City Bank Savings",
  "type": "BANK",
  "accountNumber": "1029384756",
  "bankName": "City Bank Ltd.",
  "openingBalance": 25000.00,
  "currency": "BDT",
  "description": "Salary deposit account"
}
```

### 3. Account Statement
`GET /accounts/:id/statement`

---

## Transactions Endpoints

### 1. Record Income or Expense
`POST /transactions`
```json
{
  "accountId": "uuid-account-id",
  "categoryId": "uuid-category-id",
  "type": "INCOME",
  "amount": 50000.00,
  "transactionDate": "2026-10-05T10:00:00Z",
  "description": "Monthly Salary Deposit",
  "referenceNumber": "SAL-001"
}
```

---

## Fund Transfers Endpoints

### 1. Execute Fund Transfer
`POST /transfers`
```json
{
  "sourceAccountId": "uuid-bank-account",
  "destinationAccountId": "uuid-wallet-account",
  "amount": 3000.00,
  "transferDate": "2026-10-12T11:00:00Z",
  "description": "Bank to bKash transfer",
  "idempotencyKey": "unique-idemp-string-123"
}
```

### 2. Reverse Fund Transfer
`POST /transfers/:id/reverse`
```json
{
  "reason": "Reversing accidental duplicate transfer"
}
```

---

## Reports & Exports Endpoints

### 1. Monthly Financial Report
`GET /reports/monthly?month=10&year=2026`

### 2. Daily Transaction Report
`GET /reports/daily?date=2026-10-12`

### 3. Yearly Financial Report
`GET /reports/yearly?year=2026`

### 4. Export Report
`GET /reports/export?reportType=monthly&month=10&year=2026&format=pdf`
(Formats supported: `pdf`, `excel`, `csv`)
