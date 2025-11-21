# Dashboard Data Persistence Fix - Deployment Guide

## Changes Made

### ✅ Backend Changes (`backend/main.py`)
1. **Added file persistence** to save uploaded data across restarts
2. **Auto-load data on startup** - Previously uploaded data is restored when backend wakes up
3. **New `/status` endpoint** - Health check showing data availability
4. **Persisted data location**: `backend/data/` directory
   - `current_data.pkl` - Uploaded CSV data
   - `mappings.json` - User-defined mappings
   - `metadata.json` - Last upload timestamp and row count

### ✅ Frontend Changes (`frontend/src/components/Dashboard.tsx`)
1. **Improved empty state UI** - Better user experience with helpful message
2. **Upload button** - Direct link to upload page when no data exists
3. **Better visual feedback** - Icon and clear instructions

## Deployment Instructions

### Option 1: Deploy to Render (Recommended)

Since your app is already on Render, follow these steps:

1. **Commit and push changes:**
   ```bash
   cd "/Users/joseedson18/Downloads/Automatização de Controle Financeiro com Dados do Conta Azul"
   git add .
   git commit -m "fix: Add data persistence to solve dashboard issue"
   git push
   ```

2. **Render will auto-deploy** - Wait for both services to redeploy:
   - Backend: `financial-control-backend`
   - Frontend: `financial-control-appfinancial-control`

3. **Verify the fix:**
   - Visit: https://financial-control-appfinancial-control.onrender.com
   - Upload a CSV file
   - View Dashboard - should show data ✅
   - Wait 15+ minutes or manually restart backend
   - Refresh Dashboard - **data should still be there!** ✅

### Option 2: Test Locally First

```bash
# Terminal 1 - Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev

# Open http://localhost:5173
# Test upload and dashboard
```

## Data Persistence Details

### Where is data stored?
- **Production (Render)**: `/opt/render/project/src/backend/data/`
- **Local**: `./backend/data/`

### How long does data persist?
- **Indefinitely** until you manually delete files or clear the data directory
- Survives backend restarts, sleeps, and redeployments
- **Important**: Render may clear disk on major platform updates (rare)

### What if I want to reset data?
Delete files in the data directory:
```bash
rm -rf backend/data/*
```

## Testing the Fix

### Test 1: Basic Upload
```bash
# Upload file
curl -X POST -F "file=@your_file.csv" \
  https://financial-control-backend-2hmh.onrender.com/upload

# Check dashboard
curl https://financial-control-backend-2hmh.onrender.com/dashboard | jq
```

### Test 2: Persistence After Restart
```bash
# 1. Upload file (see Test 1)
# 2. Wait for backend to sleep (~15 min) OR restart manually in Render dashboard
# 3. Check status endpoint
curl https://financial-control-backend-2hmh.onrender.com/status | jq

# Expected output:
{
  "status": "healthy",
  "data_loaded": true,
  "rows": <number>,
  "last_upload": "2025-11-21T...",
  "mappings_count": <number>
}
```

### Test 3: Frontend Dashboard
1. Go to https://financial-control-appfinancial-control.onrender.com
2. Upload CSV
3. Navigate to Dashboard
4. **Should see charts and KPIs** ✅
5. Restart backend service in Render
6. Refresh Dashboard
7. **Should STILL see charts and KPIs** ✅

## Troubleshooting

### Dashboard still shows "No Data Available"

**Check 1: Is backend healthy?**
```bash
curl https://financial-control-backend-2hmh.onrender.com/status
```

**Check 2: Did upload succeed?**
- Look for "File processed successfully" message
- Check status endpoint for `data_loaded: true`

**Check 3: Backend logs**
- Go to Render dashboard
- Open backend service
- Check logs for "✅ Loaded data" on startup

**Check 4: Frontend API URL**
- Verify `.env.production` has correct backend URL:
  ```
  VITE_API_URL=https://financial-control-backend-2hmh.onrender.com
  ```

### Data lost after deployment

- Render clears disk on **redeploy**
- After redeploying, you must re-upload the CSV file
- Data persists through **restarts** but not **redeployments**

### Future Enhancement: Database

For production apps with multiple users, consider:
1. PostgreSQL database (Render offers free tier)
2. User authentication
3. Multi-tenant support

## Files Modified

- ✏️ `backend/main.py` - Added persistence layer
- ✏️ `frontend/src/components/Dashboard.tsx` - Improved UX
- ➕ `backend/.gitignore` - Exclude data directory
- ➕ `DEPLOYMENT.md` - This file

## Success Criteria

- [x] Upload CSV file
- [x] View dashboard with data
- [x] Backend restarts/sleeps
- [x] Dashboard STILL shows data ✅
- [x] No "No data available" error after restart

## Support

If you encounter issues:
1. Check Render logs for both services
2. Verify `/status` endpoint shows `data_loaded: true`
3. Ensure frontend has correct `VITE_API_URL`
4. Re-upload CSV if needed after redeploy
