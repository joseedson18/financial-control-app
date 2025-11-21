from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import pandas as pd
from models import MappingItem, MappingUpdate, DashboardData, PnLResponse
from logic import process_upload, get_initial_mappings, calculate_pnl, get_dashboard_data

import os
import json
import pickle
from pathlib import Path
from datetime import datetime

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

# Data persistence configuration
DATA_DIR = Path("./data")
DATA_DIR.mkdir(exist_ok=True)
CSV_PATH = DATA_DIR / "current_data.pkl"
MAPPINGS_PATH = DATA_DIR / "mappings.json"
METADATA_PATH = DATA_DIR / "metadata.json"

# State (with persistence)
current_df = None
current_mappings = get_initial_mappings()

# Persistence helper functions
def save_data():
    """Save current dataframe and mappings to disk"""
    try:
        if current_df is not None:
            with open(CSV_PATH, 'wb') as f:
                pickle.dump(current_df, f)
            
        # Save mappings
        mappings_dict = [m.model_dump() for m in current_mappings]
        with open(MAPPINGS_PATH, 'w') as f:
            json.dump(mappings_dict, f)
        
        # Save metadata
        metadata = {
            "last_upload": datetime.now().isoformat(),
            "rows": len(current_df) if current_df is not None else 0
        }
        with open(METADATA_PATH, 'w') as f:
            json.dump(metadata, f)
            
        return True
    except Exception as e:
        print(f"Error saving data: {e}")
        return False

def load_data():
    """Load dataframe and mappings from disk on startup"""
    global current_df, current_mappings
    
    try:
        # Load dataframe
        if CSV_PATH.exists():
            with open(CSV_PATH, 'rb') as f:
                current_df = pickle.load(f)
            print(f"✅ Loaded data: {len(current_df)} rows")
        
        # Load mappings
        if MAPPINGS_PATH.exists():
            with open(MAPPINGS_PATH, 'r') as f:
                mappings_dict = json.load(f)
                current_mappings = [MappingItem(**m) for m in mappings_dict]
            print(f"✅ Loaded {len(current_mappings)} mappings")
        
        # Load metadata
        if METADATA_PATH.exists():
            with open(METADATA_PATH, 'r') as f:
                metadata = json.load(f)
            print(f"✅ Last upload: {metadata.get('last_upload', 'Unknown')}")
                
    except Exception as e:
        print(f"⚠️ Error loading data: {e}")
        current_df = None
        current_mappings = get_initial_mappings()

@app.on_event("startup")
async def startup_event():
    """Load persisted data on startup"""
    load_data()

@app.get("/")
def read_root():
    return {"message": "Financial Control API is running"}

@app.get("/status")
def get_status():
    """Health check endpoint that returns data availability status"""
    has_data = current_df is not None
    metadata = {}
    
    if METADATA_PATH.exists():
        try:
            with open(METADATA_PATH, 'r') as f:
                metadata = json.load(f)
        except:
            pass
    
    return {
        "status": "healthy",
        "data_loaded": has_data,
        "rows": len(current_df) if has_data else 0,
        "last_upload": metadata.get("last_upload"),
        "mappings_count": len(current_mappings)
    }

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    global current_df
    content = await file.read()
    try:
        current_df = process_upload(content)
        save_data()  # Persist to disk
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
    save_data()  # Persist to disk
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
