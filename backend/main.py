from fastapi import FastAPI, UploadFile, File, HTTPException, Body, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from typing import List
import pandas as pd
from models import MappingItem, MappingUpdate, DashboardData, PnLResponse
from logic import process_upload, get_initial_mappings, calculate_pnl, get_dashboard_data
from ai_service import generate_insights
from auth import Token, create_access_token, get_current_user, USERS_DB, verify_password, get_password_hash
from datetime import timedelta
from dotenv import load_dotenv

import os
import json
import pickle
from pathlib import Path
from datetime import datetime

# Load environment variables
load_dotenv()

app = FastAPI()

# ... (rest of imports)

# Data persistence configuration
DATA_DIR = Path("./data")
DATA_DIR.mkdir(exist_ok=True)
CSV_PATH = DATA_DIR / "current_data.pkl"
MAPPINGS_PATH = DATA_DIR / "mappings.json"
OVERRIDES_PATH = DATA_DIR / "overrides.json"
METADATA_PATH = DATA_DIR / "metadata.json"

# State (with persistence)
current_df = None
current_mappings = get_initial_mappings()
current_overrides = {} # Format: {"line_num": {"month": value}}

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
            
        # Save overrides
        with open(OVERRIDES_PATH, 'w') as f:
            json.dump(current_overrides, f)
        
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
    global current_df, current_mappings, current_overrides
    
    try:
        # Load dataframe
        if CSV_PATH.exists():
            with open(CSV_PATH, 'rb') as f:
                current_df = pickle.load(f)
            
            # Clean columns of loaded data to match new logic
            if current_df is not None:
                current_df.columns = [c.strip() for c in current_df.columns]
                print(f"✅ Loaded data: {len(current_df)} rows (Columns cleaned)")
        
        # Load mappings
        if MAPPINGS_PATH.exists():
            with open(MAPPINGS_PATH, 'r') as f:
                mappings_dict = json.load(f)
                current_mappings = [MappingItem(**m) for m in mappings_dict]
            print(f"✅ Loaded {len(current_mappings)} mappings")
            
        # Load overrides
        if OVERRIDES_PATH.exists():
            with open(OVERRIDES_PATH, 'r') as f:
                current_overrides = json.load(f)
            print(f"✅ Loaded overrides for {len(current_overrides)} lines")
        
        # Load metadata
        if METADATA_PATH.exists():
            with open(METADATA_PATH, 'r') as f:
                metadata = json.load(f)
            print(f"✅ Last upload: {metadata.get('last_upload', 'Unknown')}")
                
    except Exception as e:
        print(f"⚠️ Error loading data: {e}")
        current_df = None
        current_mappings = get_initial_mappings()
        current_overrides = {}

@app.on_event("startup")
async def startup_event():
    """Load persisted data on startup"""
    load_data()



@app.post("/pnl/override")
def update_pnl_override(data: dict):
    """Update a specific cell in the P&L"""
    global current_overrides
    
    line_num = str(data.get("line_number"))
    month = data.get("month")
    value = data.get("value")
    
    if not line_num or not month:
        raise HTTPException(status_code=400, detail="Missing line_number or month")
        
    if line_num not in current_overrides:
        current_overrides[line_num] = {}
        
    current_overrides[line_num][month] = float(value)
    save_data()
    return {"message": "Override saved"}

@app.delete("/api/pnl/overrides")
def clear_pnl_overrides(current_user: dict = Depends(get_current_user)):
    """Clear all P&L overrides"""
    global current_overrides
    current_overrides = {}
    save_data()
    return {"message": "All overrides cleared"}

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
async def upload_file(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    global current_df
    content = await file.read()
    try:
        current_df = process_upload(content)
        save_data()  # Persist to disk
        return {"message": "File processed successfully", "rows": len(current_df)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/data")
def clear_data(current_user: dict = Depends(get_current_user)):
    """Clear all uploaded data"""
    global current_df
    current_df = None
    # Also clear metadata
    if CSV_PATH.exists():
        os.remove(CSV_PATH)
    if METADATA_PATH.exists():
        os.remove(METADATA_PATH)
    return {"message": "Data cleared successfully"}

@app.get("/mappings", response_model=List[MappingItem])
def get_mappings(current_user: dict = Depends(get_current_user)):
    return current_mappings

@app.post("/mappings")
def update_mappings(update: MappingUpdate, current_user: dict = Depends(get_current_user)):
    global current_mappings
    current_mappings = update.mappings
    save_data()  # Persist to disk
    return {"message": "Mappings updated"}

@app.delete("/api/mappings")
def reset_mappings(current_user: dict = Depends(get_current_user)):
    """Reset mappings to default"""
    global current_mappings
    current_mappings = get_initial_mappings()
    save_data()
    return {"message": "Mappings reset to default"}

@app.get("/pnl", response_model=PnLResponse)
def get_pnl(
    start_date: str = None, 
    end_date: str = None,
    current_user: dict = Depends(get_current_user)
):
    global current_df, current_overrides
    
    # Lazy load if data is missing but might exist on disk
    if current_df is None:
        print("⚠️ Data missing in memory, attempting lazy load...")
        load_data()
        
    if current_df is None or current_df.empty:
        raise HTTPException(status_code=404, detail="No data loaded. Please upload a CSV file.")
    
    return calculate_pnl(current_df, current_mappings, current_overrides, start_date, end_date)

@app.get("/pnl/transactions/{line_number}")
def get_pnl_line_transactions(
    line_number: int,
    month: str = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Get all transactions that contribute to a specific P&L line.
    
    Args:
        line_number: The P&L line number (e.g., 9 for Marketing, 56 from mapping)
        month: Optional month filter in format '2024-10' or integer
    
    Returns:
        JSON with line details and list of transactions
    """
    global current_df, current_mappings
    
    if current_df is None:
        load_data()
    
    if current_df is None or current_df.empty:
        raise HTTPException(status_code=404, detail="No data loaded")
    
    # Find mapping for this line number  
    line_mapping = None
    for mapping in current_mappings:
        try:
            if int(mapping.linha_pl) == line_number:
                line_mapping = mapping
                break
        except:
            continue
    
    if not line_mapping:
        raise HTTPException(
            status_code=404,
            detail=f"No mapping found for line {line_number}"
        )
    
    # Filter dataframe
    filtered_df = current_df.copy()
    
    # Apply month filter if provided
    if month:
        try:
            if '-' in str(month):  # Format: 'YYYY-MM'
                filtered_df = filtered_df[filtered_df['Mes_Competencia'].astype(str) == month]
            else:  # Could be Period object comparison
                filtered_df = filtered_df[filtered_df['Mes_Competencia'] == month]
        except Exception as e:
            print(f"Month filter error: {e}")
    
    # Apply Centro de Custo filter
    if line_mapping.centro_custo:
        filtered_df = filtered_df[
            filtered_df['Centro de Custo 1'].astype(str).str.contains(
                line_mapping.centro_custo, case=False, na=False, regex=False
            )
        ]
    
    # Apply Fornecedor/Cliente filter
    if line_mapping.fornecedor_cliente and line_mapping.fornecedor_cliente != "Diversos":
        filtered_df = filtered_df[
            filtered_df['Nome do fornecedor/cliente'].astype(str).str.contains(
                line_mapping.fornecedor_cliente, case=False, na=False, regex=False
            )
        ]
    
    # Build transaction list
    transactions = []
    total = 0.0
    
    for _, row in filtered_df.iterrows():
        try:
            date_val = row.get('Data de competência')
            date_str = date_val.strftime('%Y-%m-%d') if pd.notna(date_val) else ''
        except:
            date_str = ''
            
        transaction = {
            "date": date_str,
            "month": str(row.get('Mes_Competencia', '')),
            "centro_custo": str(row.get('Centro de Custo 1', '')),
            "fornecedor": str(row.get('Nome do fornecedor/cliente', '')),
            "descricao": str(row.get('Descrição', '')),
            "valor": float(row.get('Valor_Num', 0)),
            "categoria": str(row.get('Plano de contas', ''))
        }
        transactions.append(transaction)
        total += transaction['valor']
    
    return {
        "line_number": line_number,
        "description": line_mapping.descricao,
        "centro_custo_filter": line_mapping.centro_custo,
        "fornecedor_filter": line_mapping.fornecedor_cliente,
        "month": month if month else "all",
        "total": round(total, 2),
        "count": len(transactions),
        "transactions": transactions
    }

@app.get("/validate")
def validate_data(current_user: dict = Depends(get_current_user)):
    """
    Validate calculation consistency between Dashboard and P&L.
    Returns validation results and any errors found.
    """
    from validation import validate_dashboard_pnl_consistency, validate_calculation_logic
    
    global current_df, current_mappings, current_overrides
    
    if current_df is None:
        load_data()
    
    if current_df is None or current_df.empty:
        raise HTTPException(status_code=404, detail="No data loaded")
    
    # Calculate P&L and Dashboard
    pnl_data = calculate_pnl(current_df, current_mappings, current_overrides)
    dashboard_data = get_dashboard()
    
    # Run validations
    dashboard_valid, dashboard_errors = validate_dashboard_pnl_consistency(
        dashboard_data, pnl_data
    )
    
    latest_month = pnl_data['headers'][-1] if pnl_data['headers'] else None
    calc_valid = True
    calc_errors = []
    
    if latest_month:
        calc_valid, calc_errors = validate_calculation_logic(pnl_data, latest_month)
    
    return {
        "valid": dashboard_valid and calc_valid,
        "dashboard_validation": {
            "valid": dashboard_valid,
            "errors": dashboard_errors
        },
        "calculation_validation": {
            "valid": calc_valid,
            "errors": calc_errors,
            "month_validated": latest_month
        }
    }

@app.post("/api/insights")
def get_ai_insights(request: dict, current_user: dict = Depends(get_current_user)):
    """
    Generate AI insights from financial data using OpenAI.
    """
    try:
        data = request.get("data", {})
        api_key = request.get("api_key")
        
        if not data:
            raise HTTPException(status_code=400, detail="No data provided")
        
        insights = generate_insights(data, api_key)
        return {"insights": insights}
    except Exception as e:
        print(f"Error in /api/insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dashboard", response_model=DashboardData)
def get_dashboard(current_user: dict = Depends(get_current_user)):
    global current_df, current_mappings, current_overrides
    
    # Lazy load if data is missing but might exist on disk
    if current_df is None:
        print("⚠️ Data missing in memory, attempting lazy load...")
        load_data()
        
    if current_df is None:
        # Return empty structure
        return DashboardData(kpis={}, monthly_data=[], cost_structure={})
    
    # Note: get_dashboard_data needs to be updated to accept overrides too if we want charts to reflect edits
    # For now, let's update logic.py signature for get_dashboard_data as well
    return get_dashboard_data(current_df, current_mappings, current_overrides)

# Serve the built frontend (Vite) from the dist folder
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Resolve the absolute path to the frontend build output (../frontend/dist)
frontend_dist_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Financial Control API is running"}

if os.path.exists(frontend_dist_path):
    # Mount assets specifically to avoid conflict with catch-all
    assets_path = os.path.join(frontend_dist_path, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    # Catch-all route for SPA (React Router)
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Check if the file exists in dist (e.g. favicon.ico, robots.txt)
        file_path = os.path.join(frontend_dist_path, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # Otherwise serve index.html for client-side routing
        return FileResponse(os.path.join(frontend_dist_path, "index.html"))
else:
    print(f"⚠️ Frontend build not found at {frontend_dist_path}. Serving API only.")
    @app.get("/")
    def read_root():
        return {"message": "API running (Frontend not found)"}
