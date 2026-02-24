# Free Deployment Guide (Cloudflare + Render + Atlas)

This guide keeps the project on free tiers.

## 1) MongoDB Atlas (M0 Free)

1. Create a free M0 cluster.
2. Create a DB user and copy the connection string.
3. Add your backend egress IP policy in Atlas network access.
   - For quick setup in free tier: allow `0.0.0.0/0` (not recommended for production).

## 2) Backend (Render Free, Docker)

1. In Render, create a new **Web Service** from this repo.
2. Root directory: `server`
3. Environment: `Docker`
4. Port: `5050`
5. Set environment variables from `server/.env.example`:
   - `PORT=5050`
   - `MONGODB_URI=...`
   - `JWT_SECRET=...`
   - `FRONTEND_URL=https://<your-pages-domain>.pages.dev`
6. Deploy and verify:
   - `https://<your-render-service>.onrender.com/`

Note:
- Free web services may sleep after inactivity.

## 3) Frontend (Cloudflare Pages Free)

1. In Cloudflare Pages, connect this repo.
2. Build settings:
   - Framework preset: `Vite`
   - Root directory: `client`
   - Build command: `npm run build`
   - Build output: `dist`
3. Environment variable:
   - `VITE_API_URL=https://<your-render-service>.onrender.com`
4. Deploy and open your `*.pages.dev` URL.

## 4) Post-deploy Checklist

1. Open frontend and test login/signup flow.
2. Confirm API calls succeed in browser devtools network tab.
3. Verify CORS:
   - `FRONTEND_URL` in backend must match your Pages domain.
4. Confirm key endpoints:
   - `GET /api/projects`
   - `GET /api/tasks`
