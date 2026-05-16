# API Testing Guide (Postman)

Use this guide to test your Bank Management System API using Postman.

## 1. Authentication

### Register a new Customer
- **URL**: `POST http://localhost:8080/api/auth/register`
- **Body** (Raw JSON):
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "CUSTOMER"
}
```

### Login
- **URL**: `POST http://localhost:8080/api/auth/login`
- **Body** (Raw JSON):
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
**Important:** Copy the `token` from the response. You will need it for all subsequent requests! In Postman, go to the "Authorization" tab, select "Bearer Token", and paste the token there.

---

## 2. Account Operations (Requires Bearer Token)

### Create an Account
- **URL**: `POST http://localhost:8080/api/accounts/create`
- **Body**: (Empty body)
- **Response**: Will return your new `accountNumber` and initial `balance` of 0.

### Check Balance
- **URL**: `GET http://localhost:8080/api/accounts/balance/{accountNumber}`
- *(Replace `{accountNumber}` with the actual account number you received in the previous step)*

---

## 3. Transactions (Requires Bearer Token)

### Deposit Money
- **URL**: `POST http://localhost:8080/api/transactions/deposit`
- **Body** (Raw JSON):
```json
{
  "accountNumber": "YOUR_ACCOUNT_NUMBER",
  "amount": 500.00,
  "description": "Initial Deposit"
}
```

### Withdraw Money
- **URL**: `POST http://localhost:8080/api/transactions/withdraw`
- **Body** (Raw JSON):
```json
{
  "accountNumber": "YOUR_ACCOUNT_NUMBER",
  "amount": 100.00,
  "description": "ATM Withdrawal"
}
```

### Transfer Money
- **URL**: `POST http://localhost:8080/api/transactions/transfer`
- *(Note: You'll need to register another user and create another account first to have a target account)*
- **Body** (Raw JSON):
```json
{
  "accountNumber": "YOUR_SOURCE_ACCOUNT_NUMBER",
  "targetAccountNumber": "THE_OTHER_ACCOUNT_NUMBER",
  "amount": 50.00,
  "description": "Payment for lunch"
}
```

### View Transaction History
- **URL**: `GET http://localhost:8080/api/transactions/history/{accountNumber}`
- *(Replace `{accountNumber}` with your actual account number)*
- **Response**: Will return a list of all deposits, withdrawals, and transfers associated with your account.
