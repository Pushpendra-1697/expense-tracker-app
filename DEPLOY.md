# Free deployment checklist

Repo: https://github.com/Pushpendra-1697/expense-tracker-app

**Live app:** https://frontend-eight-tawny-20.vercel.app  
**API:** https://backend-gray-kappa-99.vercel.app/api

> This project is deployed on **Vercel (frontend + backend)** + **MongoDB Atlas** (free). Render is optional if you prefer a long-running Node host.

## 1. MongoDB Atlas (free M0)

1. Go to https://cloud.mongodb.com and sign up / log in
2. Create a **FREE (M0)** cluster
3. Database Access → add user (username + password)
4. Network Access → Add IP Address → `0.0.0.0/0` (allow from anywhere)
5. Database → Connect → Drivers → copy the URI  
   Example: `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/expense-tracker?retryWrites=true&w=majority`

## 2. Backend on Vercel (free)

```bash
cd backend
npx vercel --prod
```

Set production env vars in the Vercel project (`backend`):

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | *(Atlas URI from step 1; URL-encode special chars in password)* |
| `JWT_SECRET` | *(long random string)* |
| `JWT_EXPIRE` | `7d` |
| `CLIENT_URL` | `https://frontend-eight-tawny-20.vercel.app` (comma-separate extra origins if needed) |

Also turn **off** Deployment Protection / SSO Protection for the backend project so the public API is reachable:

```bash
npx vercel project protection disable backend --sso --yes
```

## 3. Frontend on Vercel (free)

```bash
cd frontend
# bake API URL into the build
echo VITE_API_URL=https://backend-gray-kappa-99.vercel.app/api > .env.production
npx vercel --prod
```

## 4. Wire CORS — DONE

`CLIENT_URL` on the Vercel backend is set to:

`https://frontend-eight-tawny-20.vercel.app,https://frontend-pushpendra1697s-projects.vercel.app`

Backend was redeployed after the update.

## 5. Smoke test — DONE

Verified against the live API:

1. Health check returns OK
2. Register a user succeeds
3. Add a transaction succeeds
4. Dashboard shows the new transaction
5. CORS preflight allows the frontend origin

Manual UI check: open https://frontend-eight-tawny-20.vercel.app → Register → Add Transaction → confirm on Dashboard.

## Optional: Backend on Render instead

If you prefer Render for the API:

1. https://dashboard.render.com → New → Web Service
2. Root Directory: `backend`
3. Build: `npm install` · Start: `npm start`
4. Same env vars as above (`CLIENT_URL` = your Vercel frontend URL)
