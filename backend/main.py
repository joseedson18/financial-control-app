from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import pandas as pd
from models import MappingItem, MappingUpdate, DashboardData, PnLResponse
from logic import process_upload, get_initial_mappings, calculate_pnl, get_dashboard_data

import os

app = FastAPI()
# Force redeploy check

# CORS Configuration
# In production, FRONTEND_URL should be set to the actual frontend domain
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    frontend_url,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# State (in-memory for now)
current_df = None
current_mappings = get_initial_mappings()

@app.get("/")
def read_root():
    return {"message": "Financial Control API is running"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    global current_df
    content = await file.read()
    try:
        current_df = process_upload(content)
        return {"message": "File processed successfully", "rows": len(current_df)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/mappings", response_model=List[MappingItem])
def get_mappings():
    return current_mappings

@app.post("/mappings")
def update_mappings(update: MappingUpdate):
    global current_mappings
    current_mappings = update.mappings
    return {"message": "Mappings updated"}

@app.get("/pnl", response_model=PnLResponse)
def get_pnl():
    global current_df
    if current_df is None:
        # Return empty structure if no data
        return PnLResponse(headers=[], rows=[])
    
    return calculate_pnl(current_df, current_mappings)

@app.get("/dashboard", response_model=DashboardData)
def get_dashboard():
    global current_df, current_mappings
    if current_df is None:
        # Return empty structure
        return DashboardData(kpis={}, monthly_data=[], cost_structure={})
    
    return get_dashboard_data(current_df, current_mappings)
