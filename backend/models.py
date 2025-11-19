from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class MappingItem(BaseModel):
    grupo_financeiro: str
    centro_custo: str
    fornecedor_cliente: str
    linha_pl: str
    tipo: str
    ativo: str
    observacoes: Optional[str] = None

class MappingUpdate(BaseModel):
    mappings: List[MappingItem]

class DashboardData(BaseModel):
    kpis: Dict[str, Any]
    monthly_data: List[Dict[str, Any]]
    cost_structure: Dict[str, Any]

class PnLItem(BaseModel):
    line_number: int
    description: str
    values: Dict[str, float]  # month -> value
    is_header: bool = False
    is_total: bool = False

class PnLResponse(BaseModel):
    headers: List[str]
    rows: List[PnLItem]
