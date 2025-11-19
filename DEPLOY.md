# Deployment Guide for Financial Control App

This guide explains how to deploy your application to **Render**.

## Prerequisites
1. A [GitHub](https://github.com/) account.
2. A [Render](https://render.com/) account.

## Step 1: Push Code to GitHub ✅
**Already completed!** Your code is at: `https://github.com/joseedson18/financial-control-app`

## Step 2: Deploy Backend via Blueprint

1. On the Render Blueprint page, click **"Retry"** to load the updated render.yaml.
2. Scroll down and click **"Apply"**.
3. Wait for the backend to deploy (3-5 minutes).
4. Copy the backend URL (will be something like `https://financial-control-backend.onrender.com`).

## Step 3: Deploy Frontend as Static Site

1. Go to your [Render Dashboard](https://dashboard.render.com/).
2. Click **"New +"** → **"Static Site"**.
3. Connect to your GitHub repository: `joseedson18/financial-control-app`.
4. Configure the static site:
   - **Name**: `financial-control-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
5. Add environment variable:
   - **Key**: `VITE_API_URL`
   - **Value**: Your backend URL from Step 2 (e.g., `https://financial-control-backend.onrender.com`)
6. Click **"Create Static Site"**.
7. Wait for deployment (2-3 minutes).

## Step 4: Update Backend Environment Variable

1. Go to your backend service in Render.
2. Navigate to **Environment** tab.
3. Update `FRONTEND_URL` to your frontend URL (e.g., `https://financial-control-frontend.onrender.com`).
4. The backend will automatically redeploy with the new CORS settings.

## Your App is Live! 🎉

- **Frontend**: `https://financial-control-frontend.onrender.com`
- **Backend API**: `https://financial-control-backend.onrender.com`

You can now upload your Conta Azul CSV files and use the application online!

## Notes
- Both services are on the free tier and will spin down after 15 minutes of inactivity.
- The first request after inactivity may take 30-60 seconds to wake up.
