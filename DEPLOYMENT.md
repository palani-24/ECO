# 🚀 ECO Platform Deployment & Production Guide

This guide details how to deploy the **ECO: AI-Powered Smart Waste Management & Reward Platform** to production.

---

## 📌 Option A: Monorepo Deployment on Vercel (Recommended & Fastest)

The repository is pre-configured with `vercel.json` and `/api/index.js` for single-click deployment of both Frontend (React + Vite) and Backend API (Node.js/Express) on Vercel.

### Steps:
1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy production ECO platform"
   git push origin main
   ```
2. **Connect to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/new).
   - Import your GitHub repository `palani-24/ECO`.
3. **Configure Environment Variables in Vercel Project Settings**:
   - `MONGODB_URI`: `mongodb+srv://eco:...@cluster0.xwur980.mongodb.net/ecoreward`
   - `JWT_SECRET`: `your_secure_jwt_secret`
   - `GEMINI_API_KEY`: *(Optional)* Your Google AI Studio Gemini API key
   - `VITE_GOOGLE_MAPS_API_KEY`: *(Optional)* Google Maps API key
4. **Deploy**: Click **Deploy**. Vercel will automatically build the Vite app and mount the Express serverless routes.

---

## 📌 Option B: Dedicated Deployment (Vercel Frontend + Render Backend)

### 1. Database Setup (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Database User & Password.
3. Network Access: Allow Access from Anywhere (`0.0.0.0/0`).
4. Copy the connection string into `MONGODB_URI`.

### 2. Backend Deployment on Render.com
1. Log in to [Render.com](https://render.com) and click **New + -> Web Service**.
2. Connect your GitHub Repo (`palani-24/ECO`).
3. Set **Root Directory**: `backend`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `node server.js`
6. Add Environment Variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   - `NODE_ENV` = `production`
7. Click **Create Web Service**. Render will output your live Backend URL (e.g. `https://eco-backend.onrender.com`).

### 3. Frontend Deployment on Vercel
1. On Vercel, import the repo and set **Root Directory**: `frontend`.
2. Set **Framework Preset**: `Vite`.
3. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://eco-backend.onrender.com`
4. Deploy!

---

## 🔑 Test Credentials (Out of the Box)

Once deployed or seeded with `npm run seed`:

| Role | Email | Password | Features Access |
| :--- | :--- | :--- | :--- |
| **User** | `user@ecoreward.com` | `1234` | Pickup Scheduling, AI Scanner, Rewards Store, History |
| **Driver** | `driver@ecoreward.com` | `1234` | Assigned Pickups, Gatepass, Quality Audit, GPS Maps |
| **Admin** | `admin@ecoreward.com` | `1234` | Platform Analytics, Users/Drivers Approval, Coupons |

---

## ⚙️ Seed Database Command
To initialize or reset production/staging database tables:
```bash
cd backend
npm run seed
```
