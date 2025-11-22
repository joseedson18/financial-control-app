from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
import pandas as pd
from datetime import datetime

router = APIRouter()

@router.get("/pnl/transactions/{line_number}")
async def get_pnl_line_transactions(
    line_number: int,
    month: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Get all transactions that contribute to a specific P&L line.
    
    Args:
        line_number: The P&L line number (e.g., 9 for Marketing)
        month: Optional month filter in format 'YYYY-MM' or integer month
    
    Returns:
        {
            "line_number": int,
            "description": str,
            "month": str,
            "total": float,
            "transactions": [...]
        }
    """
    from main import current_df, current_mappings
    
    if current_df is None or current_df.empty:
        raise HTTPException(status_code=404, detail="No data loaded")
    
    # Find mapping for this line number
    line_mapping = None
    for mapping in current_mappings:
        if int(mapping.linha_pl) == line_number:
            line_mapping = mapping
            break
    
    if not line_mapping:
        raise HTTPException(
            status_code=404,
            detail=f"No mapping found for line {line_number}"
        )
    
    # Filter dataframe
    filtered_df = current_df.copy()
    
    # Apply month filter if provided
    if month:
        if '-' in str(month):  # Format: 'YYYY-MM'
            filtered_df = filtered_df[filtered_df['Mes_Competencia'] == month]
        else:  # Integer month
            filtered_df = filtered_df[filtered_df['Mes_Competencia'] == int(month)]
    
    # Apply Centro de Custo filter
    if line_mapping.centro_custo:
        filtered_df = filtered_df[
            filtered_df['Centro de Custo 1'].astype(str).str.contains(
                line_mapping.centro_custo, case=False, na=False
            )
        ]
    
    # Apply Fornecedor/Cliente filter
    if line_mapping.fornecedor_cliente and line_mapping.fornecedor_cliente != "Diversos":
        filtered_df = filtered_df[
            filtered_df['Nome do fornecedor/cliente'].astype(str).str.contains(
                line_mapping.fornecedor_cliente, case=False, na=False
            )
        ]
    
    # Build transaction list
    transactions = []
    total = 0.0
    
    for _, row in filtered_df.iterrows():
        transaction = {
            "date": row.get('Data de competência', '').strftime('%Y-%m-%d') if pd.notna(row.get('Data de competência')) else '',
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
        "total": total,
        "count": len(transactions),
        "transactions": transactions
    }
