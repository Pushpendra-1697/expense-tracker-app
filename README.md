# Ledgerly — MERN Expense Tracker

Full-stack expense management app built with MongoDB, Express, React, and Node.js. Includes JWT auth, budgets, accounts, analytics, recurring transactions, savings goals, and CSV export.

**Live app:** _(add after deployment)_  
**API:** _(add after deployment)_

## Features

- **Auth** — Register / login / logout with JWT + bcrypt; protected API + frontend route guards; per-user data isolation
- **Dashboard** — Balance, income, expenses, budget progress, recent transactions, income-vs-expense chart, quick add
- **Transactions** — CRUD with amount, type, category, account, note, date, recurring toggle; backend pagination + filters + search
- **Analytics** — Income/expenses/net savings, category pie chart, spending trends (Week | Month | 3 Months | Year)
- **Accounts & wallets** — Cash, Bank, Credit Card, Wallet, Savings with individual + combined balances
- **Budgets** — Monthly overall + per-category budgets with 50/75/90/100% warnings
- **Recurring** — Daily/Weekly/Monthly/Yearly; processed hourly via cron and on login/API access
- **Savings goals** — Target amount, current amount, target date, progress %
- **CSV export** — Respects active filters
- **Custom categories** — Users can add their own income/expense categories

## Architecture

```
expense-tracker-app/
├── backend/                 # Express REST API (MVC)
│   ├── src/
│   │   ├── config/          # DB connection
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, validation, errors, upload
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # Recurring jobs, balance updates
│   │   ├── validators/      # express-validator rules
│   │   ├── app.js
│   │   └── server.js
│   └── tests/               # Jest + Supertest
└── frontend/                # Vite + React + Redux Toolkit + Tailwind + Recharts
```

## API Endpoints

| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| POST | `/api/auth/register` | Register user | No |
| POST | `/api/auth/login` | Login, get JWT | No |
| GET | `/api/auth/me` | Current user | Yes |
| PATCH | `/api/auth/me` | Update profile / default budget | Yes |
| GET | `/api/dashboard` | Dashboard summary | Yes |
| GET | `/api/transactions` | Paginated list + filters | Yes |
| GET | `/api/transactions/:id` | Get one | Yes |
| POST | `/api/transactions` | Create | Yes |
| PUT | `/api/transactions/:id` | Update | Yes |
| DELETE | `/api/transactions/:id` | Delete | Yes |
| GET | `/api/transactions/export/csv` | CSV export | Yes |
| GET | `/api/accounts` | List accounts | Yes |
| POST | `/api/accounts` | Create account | Yes |
| PUT | `/api/accounts/:id` | Update account | Yes |
| DELETE | `/api/accounts/:id` | Delete account | Yes |
| GET | `/api/categories` | List categories | Yes |
| POST | `/api/categories` | Custom category | Yes |
| DELETE | `/api/categories/:id` | Delete custom category | Yes |
| GET | `/api/budgets` | Budget status | Yes |
| PUT | `/api/budgets` | Upsert budget | Yes |
| GET | `/api/goals` | List savings goals | Yes |
| POST | `/api/goals` | Create goal | Yes |
| PUT | `/api/goals/:id` | Update goal | Yes |
| DELETE | `/api/goals/:id` | Delete goal | Yes |
| GET | `/api/analytics?period=` | Analytics (`week\|month\|3months\|year`) | Yes |
| GET | `/api/health` | Health check | No |

## Local setup

### Prerequisites

- Node.js 18+
- MongoDB Atlas (or local MongoDB)

### Backend

```bash
cd backend
cp .env.example .env
# edit .env with your MongoDB URI and JWT secret
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
# set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

Open http://localhost:5173

## Environment variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default `5000`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRE` | Token lifetime (e.g. `7d`) |
| `CLIENT_URL` | Allowed CORS origin(s), comma-separated |
| `RATE_LIMIT_WINDOW_MS` | Auth rate-limit window |
| `RATE_LIMIT_MAX` | Max auth attempts per window |
| `NODE_ENV` | `development` / `production` / `test` |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL (e.g. `https://your-api.onrender.com/api`) |

## Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

Backend tests cover auth (register/login/protected rejection) and transaction CRUD including cross-user isolation.  
Frontend tests cover LoginForm, TransactionForm, and TransactionList with React Testing Library + Vitest.

## Deployment (free tiers)

### 1. MongoDB Atlas

1. Create a free cluster
2. Create a database user
3. Allow network access (`0.0.0.0/0` for Render)
4. Copy the connection string

### 2. Backend — Render

1. New **Web Service** from this GitHub repo
2. Root directory: `backend`
3. Build: `npm install`
4. Start: `npm start`
5. Set env vars from the table above (`CLIENT_URL` = your Vercel URL)

### 3. Frontend — Vercel

1. Import the repo in Vercel
2. Root directory: `frontend`
3. Build: `npm run build`
4. Output: `dist`
5. Set `VITE_API_URL` to `https://<your-render-service>.onrender.com/api`

## Security notes

- Passwords hashed with bcrypt
- JWT required on all private routes
- express-validator on auth + transaction writes
- Queries always scoped by `user: req.user._id` (no cross-user access by ID guessing)
- CORS limited to `CLIENT_URL` (not `*` with credentials)
- Rate limiting on `/api/auth/*`

## Known limitations

- Render free tier spins down after inactivity (first request may be slow)
- Attachment uploads are stored on the API filesystem (ephemeral on free hosts)
- Currency is USD-focused in the UI formatter
- Recurring occurrences are created by cron + on login/dashboard access, not a separate worker service

## License

MIT
