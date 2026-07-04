# BudgetIQ - Backend

Backend API for BudgetIQ, a personal finance tracker built as a placement portfolio project.

Live API: https://budgetiq-backend-24xt.onrender.com
Frontend repo: https://github.com/Kanishkasharma2/budgetiq-frontend

## Features

- User authentication with JWT and bcrypt password hashing
- Add, edit, delete, and filter transactions (by category, type, date)
- Dashboard summary and 6-month spending trend (MongoDB aggregation)
- Monthly budget limits per category with spend tracking
- Recurring transactions auto-created monthly via a cron job

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT), bcrypt
- **Scheduling:** node-cron
- **Deployment:** Render

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Login, returns JWT |
| GET | /api/auth/me | Get current user |
| GET | /api/transactions | Get all transactions |
| POST | /api/transactions | Add a transaction |
| PUT | /api/transactions/:id | Update a transaction |
| DELETE | /api/transactions/:id | Delete a transaction |
| GET | /api/transactions/summary | Get dashboard totals |
| GET | /api/transactions/monthly-trend | Get 6-month spending trend |
| POST | /api/budgets | Set a budget limit |
| GET | /api/budgets?month=YYYY-MM | Get budgets for a month |

## Setup

```bash
npm install
```

Create a `.env` file:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

```bash
npm run dev
```
