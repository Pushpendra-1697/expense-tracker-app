# Free deployment checklist

Repo: https://github.com/Pushpendra-1697/expense-tracker-app

## 1. MongoDB Atlas (free M0)

1. Go to https://cloud.mongodb.com and sign up / log in
2. Create a **FREE (M0)** cluster
3. Database Access → add user (username + password)
4. Network Access → Add IP Address → `0.0.0.0/0` (allow from anywhere for Render)
5. Database → Connect → Drivers → copy the URI  
   Example: `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/expense-tracker?retryWrites=true&w=majority`

## 2. Backend on Render (free)

1. https://dashboard.render.com → New → Web Service
2. Connect the GitHub repo `expense-tracker-app`
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Environment variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | *(Atlas URI from step 1)* |
| `JWT_SECRET` | *(long random string)* |
| `JWT_EXPIRE` | `7d` |
| `CLIENT_URL` | *(Vercel URL from step 3, e.g. https://ledgerly.vercel.app)* |

5. Deploy → copy the service URL, e.g. `https://ledgerly-api.onrender.com`

## 3. Frontend on Vercel (free)

```bash
cd frontend
npx vercel --prod
```

Or in the Vercel dashboard:
- Import repo, **Root Directory** = `frontend`
- Env: `VITE_API_URL` = `https://YOUR-RENDER-URL.onrender.com/api`

## 4. Wire CORS

After Vercel gives you a URL, set `CLIENT_URL` on Render to that exact origin (no trailing slash), then redeploy the backend.

## 5. Smoke test

1. Open the Vercel URL
2. Register a user
3. Add a transaction and confirm it appears on the dashboard

> Note: Render free tier sleeps after ~15 minutes idle; the first request after sleep can take 30–60s.
