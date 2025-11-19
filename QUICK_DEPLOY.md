# Quick Deployment Steps

Your backend is already deployed! ✅

## Step 1: Get Backend URL
1. Go to: https://dashboard.render.com/
2. Click on `financial-control-backend` service
3. Copy the URL (looks like: `https://financial-control-backend-xxxx.onrender.com`)

## Step 2: Deploy Frontend
1. On Render dashboard, click **"New +"** → **"Static Site"**
2. Click **"Connect a repository"** → Select `joseedson18/financial-control-app`
3. Fill in the form:
   ```
   Name: financial-control-frontend
   Branch: main
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```
4. Click **"Advanced"** to add environment variable:
   ```
   Key: VITE_API_URL
   Value: [paste the backend URL from Step 1]
   ```
5. Click **"Create Static Site"**
6. Wait 2-3 minutes for it to build and deploy

## Step 3: Update Backend CORS
1. Go to your backend service → **"Environment"** tab
2. Find `FRONTEND_URL` and click **"Edit"**
3. Update the value to your new frontend URL (e.g., `https://financial-control-frontend.onrender.com`)
4. Click **"Save Changes"** (backend will auto-redeploy)

## Done! 🎉
Your app will be live at:
- Frontend: `https://financial-control-frontend.onrender.com`
- Backend API: `https://financial-control-backend-xxxx.onrender.com`

**Note**: First visit after inactivity may take 30-60 seconds (free tier limitation)
