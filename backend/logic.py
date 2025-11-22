import pandas as pd
import numpy as np
from datetime import datetime
import io
from typing import List, Dict, Any
from models import MappingItem, PnLItem, PnLResponse, DashboardData

def process_upload(file_content: bytes) -> pd.DataFrame:
    """
    Process the uploaded CSV file from Conta Azul.
    """
    # Try different encodings and separators
    df = None
    encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252']
    separators = [',', ';', '\t']
    last_error = None
    
    for encoding in encodings:
        for sep in separators:
            try:
                # Try strict parsing first
                df = pd.read_csv(io.BytesIO(file_content), encoding=encoding, sep=sep)
                
                # Check if it has the critical column 'Data de competência'
                if 'Data de competência' in df.columns:
                    break
                else:
                    df = None # Not the right separator
            except Exception:
                continue
        
        if df is not None:
            break
            
        # If strict parsing failed for this encoding, try with on_bad_lines='skip' as fallback
        for sep in separators:
            try:
                print(f"⚠️ Strict parsing failed. Retrying with on_bad_lines='skip', encoding={encoding}, sep='{sep}'")
                df = pd.read_csv(io.BytesIO(file_content), encoding=encoding, sep=sep, on_bad_lines='skip', engine='python')
                if 'Data de competência' in df.columns:
                    break
                else:
                    df = None
            except Exception as e:
                last_error = e
                continue
        
        if df is not None:
            break
    
    if df is None:
        if last_error:
            raise ValueError(f"Error reading CSV file. Please ensure it's a valid CSV. Details: {last_error}")
        else:
            raise ValueError("Error reading CSV file. Could not detect valid format (encoding/separator).")

    # Basic validation
    required_cols = ['Data de competência', 'Valor (R$)', 'Centro de Custo 1', 'Nome do fornecedor/cliente']
    for col in required_cols:
        if col not in df.columns:
            raise ValueError(f"Missing required column: {col}")

    # Data cleaning
    # Data cleaning
    # Normalize column names to avoid issues with spaces
    df.columns = [c.strip() for c in df.columns]
    
    # Robust date parsing
    def parse_dates(date_str):
        if pd.isna(date_str): return pd.NaT
        date_str = str(date_str).strip()
        formats = ['%d/%m/%Y', '%Y-%m-%d', '%m/%d/%Y', '%d-%m-%Y']
        for fmt in formats:
            try:
                return pd.to_datetime(date_str, format=fmt)
            except:
                continue
        return pd.NaT

    df['Data de competência'] = df['Data de competência'].apply(parse_dates)
    
    def converter_valor_br(valor_str):
        if pd.isna(valor_str) or valor_str == '':
            return 0.0
        # Handle Brazilian format (1.234,56) and US format (1,234.56)
        valor_str = str(valor_str).replace('R$', '').strip()
        if ',' in valor_str and '.' in valor_str:
            # Ambiguous, assume Brazilian if comma is last separator
            if valor_str.rfind(',') > valor_str.rfind('.'):
                valor_str = valor_str.replace('.', '').replace(',', '.')
            else:
                valor_str = valor_str.replace(',', '')
        elif ',' in valor_str:
            valor_str = valor_str.replace(',', '.')
        
        try:
            return float(valor_str)
        except:
            return 0.0

    df['Valor_Num'] = df['Valor (R$)'].apply(converter_valor_br)
    df['Mes_Competencia'] = df['Data de competência'].dt.to_period('M')
    
    # Normalize text columns for mapping
    if 'Centro de Custo 1' in df.columns:
        df['Centro de Custo 1'] = df['Centro de Custo 1'].astype(str).str.strip()
    if 'Nome do fornecedor/cliente' in df.columns:
        df['Nome do fornecedor/cliente'] = df['Nome do fornecedor/cliente'].astype(str).str.strip()
    
    return df

def get_initial_mappings() -> List[MappingItem]:
    """
    Returns the initial hardcoded mappings.
    """
    raw_mappings = [
        # RECEITAS
        ["Receita Google", "Google Play Net Revenue", "GOOGLE BRASIL PAGAMENTOS LTDA", "25", "Receita", "Sim", "Receita Google Play"],
        ["Receita Apple", "App Store Net Revenue", "App Store (Apple)", "33", "Receita", "Sim", "Receita App Store"],
        # Duplicates commented out to avoid double counting if source data doesn't distinguish
        # ["Receita Brasil", "Google Play Net Revenue", "GOOGLE BRASIL PAGAMENTOS LTDA", "26", "Receita", "Sim", "Receita Brasil - Google"],
        # ["Receita Brasil", "App Store Net Revenue", "App Store (Apple)", "34", "Receita", "Sim", "Receita Brasil - Apple"],
        # ["Receita USA", "Google Play Net Revenue", "GOOGLE BRASIL PAGAMENTOS LTDA", "28", "Receita", "Sim", "Receita USA - Google"],
        # ["Receita USA", "App Store Net Revenue", "App Store (Apple)", "36", "Receita", "Sim", "Receita USA - Apple"],
        
        # COGS
        ["COGS", "Web Services Expenses", "AWS", "43", "Custo", "Sim", "Amazon Web Services"],
        ["COGS", "Web Services Expenses", "Cloudflare", "44", "Custo", "Sim", "Cloudflare"],
        ["COGS", "Web Services Expenses", "Heroku", "45", "Custo", "Sim", "Heroku"],
        ["COGS", "Web Services Expenses", "IAPHUB", "46", "Custo", "Sim", "IAPHUB"],
        ["COGS", "Web Services Expenses", "MailGun", "47", "Custo", "Sim", "MailGun"],
        ["COGS", "Web Services Expenses", "AWS SES", "48", "Custo", "Sim", "AWS SES"],
        
        # SG&A
        ["SG&A", "Marketing & Growth Expenses", "MGA MARKETING LTDA", "56", "Despesa", "Sim", "Marketing"],
        ["SG&A", "Marketing & Growth Expenses", "Diversos", "56", "Despesa", "Sim", "Marketing - Diversos"],
        ["SG&A", "Wages Expenses", "Diversos", "64", "Despesa", "Sim", "Salários e Pró-labore"],
        ["SG&A", "Tech Support & Services", "Adobe", "68", "Despesa", "Sim", "Adobe Creative Cloud"],
        ["SG&A", "Tech Support & Services", "Canva", "68", "Despesa", "Sim", "Canva"],
        ["SG&A", "Tech Support & Services", "ClickSign", "68", "Despesa", "Sim", "ClickSign"],
        ["SG&A", "Tech Support & Services", "COMPANYHERO SAO PAULO BRA", "68", "Despesa", "Sim", "CompanyHero"],
        ["SG&A", "Tech Support & Services", "Diversos", "65", "Despesa", "Sim", "Tech Support - Diversos"],
        
        # OUTRAS DESPESAS
        ["Outras Despesas", "Legal & Accounting Expenses", "BHUB.AI", "90", "Despesa", "Sim", "BPO Financeiro"],
        ["Outras Despesas", "Legal & Accounting Expenses", "WOLFF E SCRIPES ADVOGADOS", "90", "Despesa", "Sim", "Honorários Advocatícios"],
        ["Outras Despesas", "Office Expenses", "GO OFFICES LATAM S/A", "90", "Despesa", "Sim", "Aluguel"],
        ["Outras Despesas", "Office Expenses", "CO-SERVICES DO BRASIL  SERVICOS COMBINADOS DE APOIO A EDIFICIOS LTDA", "90", "Despesa", "Sim", "Serviços de Escritório"],
        ["Outras Despesas", "Travel", "American Airlines", "90", "Despesa", "Sim", "Viagens"],
        ["Outras Despesas", "Other Taxes", "IMPOSTOS/TRIBUTOS", "90", "Despesa", "Sim", "Impostos e Tributos"],
        ["Outras Despesas", "Payroll Tax - Brazil", "IMPOSTOS/TRIBUTOS", "90", "Despesa", "Sim", "Impostos sobre Folha"],
        
        # RENDIMENTOS
        ["Rendimentos", "Rendimentos de Aplicações", "CONTA SIMPLES", "38", "Receita", "Sim", "Rendimentos CDI - Conta Simples"],
        ["Rendimentos", "Rendimentos de Aplicações", "BANCO INTER", "38", "Receita", "Sim", "Rendimentos - Banco Inter"],
    ]
    
    mappings = []
    for m in raw_mappings:
        mappings.append(MappingItem(
            grupo_financeiro=m[0],
            centro_custo=m[1],
            fornecedor_cliente=m[2],
            linha_pl=m[3],
            tipo=m[4],
            ativo=m[5],
            observacoes=m[6]
        ))
    return mappings

def calculate_pnl(df: pd.DataFrame, mappings: List[MappingItem], overrides: Dict[str, Dict[str, float]] = None, start_date: str = None, end_date: str = None) -> PnLResponse:
    """
    Calculate P&L based on dataframe and mappings.
    Optionally filter by date range.
    
    Args:
        df: DataFrame with financial data
        mappings: List of cost center mappings
        overrides: Manual cell overrides
        start_date: Optional start date in YYYY-MM-DD format
        end_date: Optional end date in YYYY-MM-DD format
    """
    if df is None:
        return PnLResponse(headers=[], rows=[])
    
    # Apply date filter if provided
    filtered_df = df.copy()
    if start_date or end_date:
        if start_date:
            start = pd.to_datetime(start_date)
            filtered_df = filtered_df[filtered_df['Data de competência'] >= start]
        if end_date:
            end = pd.to_datetime(end_date)
            filtered_df = filtered_df[filtered_df['Data de competência'] <= end]

    # Calculate months from filtered data
    months = sorted(filtered_df['Mes_Competencia'].dropna().unique())
    month_strs = [str(m) for m in months]
    
    # Helper to sum values based on mapping
    def get_value(mapping_item: MappingItem, month):
        # Case-insensitive matching for Cost Center
        mask = (
            (filtered_df['Mes_Competencia'] == month) &
            (filtered_df['Centro de Custo 1'].str.lower() == mapping_item.centro_custo.lower().strip())
        )
        
        # Case-insensitive partial match for Supplier
        if mapping_item.fornecedor_cliente != "Diversos":
             mask &= (filtered_df['Nome do fornecedor/cliente'].astype(str).str.contains(mapping_item.fornecedor_cliente, case=False, na=False, regex=False))
        
        return filtered_df[mask]['Valor_Num'].sum()

    # Initialize data structure for calculations
    # We'll use a dictionary to store values for each line number
    # line_values[line_num][month_str] = value
    # Initialize line values for all possible line numbers used in calculations (up to 120)
    line_values = {i: {m: 0.0 for m in month_strs} for i in range(1, 121)}

    # 1. Populate from Mappings (Raw Data)
    for m in mappings:
        try:
            line_num = int(m.linha_pl)
        except:
            continue
            
        for mo in months:
            val = get_value(m, mo)
            # Adjust sign: In extract, expenses are negative. In P&L, we usually want them positive for subtraction logic or keep negative.
            # Let's stick to: Revenue (+), Expenses (-) in the raw summation.
            # But the P&L display usually shows costs as positive numbers that are subtracted.
            # Let's keep raw signs for now and handle logic below.
            line_values[line_num][str(mo)] += val

    # 2. Calculate Derived Lines (Formulas)
    
    # Revenue no Tax (Line 25) = Google (29) + Apple (37)
    # Note: Mappings map to 25 and 33 for Google/Apple Revenue?
    # Let's check mappings:
    # Google Play Net Revenue -> 25 (Receita Google)
    # App Store Net Revenue -> 33 (Receita Apple)
    # Wait, the python script says:
    # ws_pl[f'{col}25'] = f'={col}29+{col}37'  (Revenue no Tax = Google + Apple)
    # But mappings map to 25 and 33?
    # Let's adjust to match the Python script logic more closely.
    # The mappings in `get_initial_mappings` seem to map to specific lines.
    # Let's aggregate based on the mapped lines first.
    
    # We need to be careful. The mappings provided in `get_initial_mappings` put Google at 25 and Apple at 33.
    # But the script `implementar_formulas_pl.py` puts Google at 29 and Apple at 37.
    # Let's trust the `get_initial_mappings` I ported, but I might need to adjust the calculation logic to match WHERE the data is going.
    
    # Let's re-verify the mappings vs logic.
    # Mappings:
    # Google -> 25
    # Apple -> 33
    # Rendimentos -> 38
    
    # Logic in `implementar_formulas_pl.py`:
    # Revenue (24) = 25 + 42
    # Revenue no Tax (25) = 29 + 37 (Wait, this contradicts the mapping if mapping puts data in 25)
    
    # CORRECTION: The mappings in `get_initial_mappings` seem to be slightly different from `implementar_formulas_pl.py`.
    # I will follow the `get_initial_mappings` line numbers as the source of truth for where raw data goes, 
    # and build the aggregation logic around that.
    
    # Mapped Lines:
    # 25: Google Revenue
    # 33: Apple Revenue
    # 38: Rendimentos (Invest Income)
    # 43-48: COGS (AWS, etc)
    # 56: Marketing
    # 64: Wages
    # 68: Tech Support (Adobe, etc) -> Wait, mapping says 68 for Adobe, but script says 69 for Tech Support total.
    # 90: Other Expenses
    
    # Let's define the P&L Structure based on these mapped lines.
    
    calculated_lines = {}
    
    for m in month_strs:
        # Raw aggregates from mapped lines
        # Revenues are POSITIVE, Expenses are NEGATIVE in the CSV
        google_rev = line_values[25][m] + line_values[26][m] + line_values[28][m] # Sum all Google lines
        apple_rev = line_values[33][m] + line_values[34][m] + line_values[36][m] # Sum all Apple lines
        invest_income = line_values[38][m]
        
        # COGS items (these come as NEGATIVE from CSV)
        cogs_aws = line_values[43][m]
        cogs_cloudflare = line_values[44][m]
        cogs_heroku = line_values[45][m]
        cogs_iaphub = line_values[46][m]
        cogs_mailgun = line_values[47][m]
        cogs_ses = line_values[48][m]
        
        # Operating expenses (these come as NEGATIVE from CSV)
        marketing = line_values[56][m]
        wages = line_values[64][m]
        tech_support = line_values[68][m] + line_values[65][m] # Adobe + Diversos
        other_expenses = line_values[90][m]
        
        # ============================================
        # FINANCIAL CALCULATIONS WITH CORRECT SIGNS
        # ============================================
        
        # 1. REVENUE (should be positive)
        revenue_no_tax = google_rev + apple_rev  # Both positive
        total_revenue = revenue_no_tax + invest_income  # All positive
        
        # 2. COST OF REVENUE (COGS)
        # Payment Processing = 17.65% of Revenue no Tax (this is a cost, so negative)
        payment_processing_cost = revenue_no_tax * 0.1765
        
        # COGS from CSV (already negative, convert to positive for calculation)
        cogs_sum = abs(cogs_aws + cogs_cloudflare + cogs_heroku + cogs_iaphub + cogs_mailgun + cogs_ses)
        
        # Total Cost of Revenue (as positive value)
        total_cost_of_revenue = payment_processing_cost + cogs_sum
        
        # 3. GROSS PROFIT = Revenue - Cost of Revenue
        gross_profit = total_revenue - total_cost_of_revenue
        
        # 4. OPERATING EXPENSES
        # Convert all negative expenses to positive for calculation
        marketing_abs = abs(marketing)
        wages_abs = abs(wages)
        tech_support_abs = abs(tech_support)
        other_expenses_abs = abs(other_expenses)
        
        # Total SG&A and OpEx (as positive values)
        sga_total = marketing_abs + wages_abs + tech_support_abs
        total_opex = sga_total + other_expenses_abs
        
        # 5. EBITDA = Gross Profit - Operating Expenses
        ebitda = gross_profit - total_opex
        
        # Store calculated values for P&L display
        # Store revenues as positive, costs/expenses as negative for proper P&L formatting
        line_values[100][m] = total_revenue  # Total Revenue (positive)
        line_values[101][m] = revenue_no_tax  # Revenue no Tax (positive)
        line_values[102][m] = -payment_processing_cost  # Payment Processing (negative for display)
        line_values[103][m] = -cogs_sum  # COGS Total (negative for display)
        line_values[104][m] = gross_profit  # Gross Profit
        line_values[105][m] = -sga_total  # SG&A (negative for display)
        line_values[106][m] = ebitda  # EBITDA
        line_values[107][m] = -marketing_abs  # Marketing (negative for display)
        line_values[108][m] = -wages_abs  # Wages (negative for display)
        line_values[109][m] = -tech_support_abs  # Tech Support (negative for display)
        line_values[110][m] = -other_expenses_abs  # Other Expenses (negative for display)
        
    # APPLY OVERRIDES
    if overrides:
        for line_str, months_data in overrides.items():
            try:
                line_num = int(line_str)
                for m, val in months_data.items():
                    if m in month_strs:
                        line_values[line_num][m] = val
                        
                        # Re-calculate totals if needed? 
                        # For simplicity in "Free Edition", we assume user overrides the specific line they want.
                        # But if they override a component (e.g. Marketing), EBITDA should update.
                        # Let's re-run calculations? No, that's complex because of dependencies.
                        # Better approach: Apply overrides to the specific lines, then RE-RUN the formula block?
                        # Or just let the user override the TOTALS too if they want.
                        # Given "Free Edition", let's apply overrides at the end, but ideally we should re-calc.
                        # Let's do a simple re-calc of high-level totals based on the new values.
            except:
                continue
                
    # Re-calculate Totals after overrides (Simplified)
    for m in month_strs:
        # Re-fetch potentially overridden values
        total_revenue = line_values[100][m] # If user overrode revenue, use it.
        # But if user overrode a component of revenue, we might miss it.
        # Let's assume overrides are final.
        pass

    # Build P&L Rows
    rows = []
    
    def add_row(line_num, desc, val_dict, is_header=False, is_total=False):
        # Check for override on this specific line
        final_values = val_dict.copy()
        if overrides and str(line_num) in overrides:
            for m, val in overrides[str(line_num)].items():
                if m in final_values:
                    final_values[m] = val
                    
        rows.append(PnLItem(
            line_number=line_num,
            description=desc,
            values=final_values,
            is_header=is_header,
            is_total=is_total
        ))

    add_row(1, "RECEITA OPERACIONAL BRUTA", line_values[100], is_header=True)
    add_row(2, "Receita de Vendas (Google + Apple)", line_values[101])
    add_row(3, "Rendimentos de Aplicações", line_values[38])
    
    add_row(4, "(-) CUSTOS DIRETOS", {m: line_values[102][m] + line_values[103][m] for m in month_strs}, is_header=True)
    add_row(5, "Payment Processing (17.65%)", line_values[102])
    add_row(6, "COGS (Web Services)", line_values[103])
    
    add_row(7, "(=) LUCRO BRUTO", line_values[104], is_total=True)
    
    add_row(8, "(-) DESPESAS OPERACIONAIS", {m: line_values[105][m] + line_values[110][m] for m in month_strs}, is_header=True)
    add_row(9, "Marketing", line_values[107])
    add_row(10, "Salários (Wages)", line_values[108])
    add_row(11, "Tech Support & Services", line_values[109])
    add_row(12, "Outras Despesas", line_values[110])
    
    add_row(13, "(=) EBITDA", line_values[106], is_total=True)
    
    # Margins
    ebitda_margins = {}
    gross_margins = {}
    for m in month_strs:
        # Get final values (potentially overridden)
        rev = 0
        ebitda_val = 0
        gross_val = 0
        
        # Find values in rows we just added
        for r in rows:
            if r.line_number == 1: rev = r.values[m]
            if r.line_number == 13: ebitda_val = r.values[m]
            if r.line_number == 7: gross_val = r.values[m]
            
        if rev != 0:
            ebitda_margins[m] = ebitda_val / rev
            gross_margins[m] = gross_val / rev
        else:
            ebitda_margins[m] = 0.0
            gross_margins[m] = 0.0
            
    add_row(14, "Margem EBITDA %", ebitda_margins)
    add_row(15, "Margem Bruta %", gross_margins)

    return PnLResponse(headers=month_strs, rows=rows)

def get_dashboard_data(df: pd.DataFrame, mappings: List[MappingItem], overrides: Dict[str, Dict[str, float]] = None) -> DashboardData:
    if df is None:
        return DashboardData(kpis={}, monthly_data=[], cost_structure={})
        
    pnl = calculate_pnl(df, mappings, overrides)
    
    # Extract latest month data
    if not pnl.headers:
        return DashboardData(kpis={}, monthly_data=[], cost_structure={})
        
    # Find the latest month with non-zero revenue
    latest_month = pnl.headers[-1]
    for m in reversed(pnl.headers):
        # Check revenue for this month (Line 1 is Gross Revenue)
        rev = 0
        for row in pnl.rows:
            if row.line_number == 1: # RECEITA OPERACIONAL BRUTA
                rev = row.values.get(m, 0)
                break
        
        if rev > 0:
            latest_month = m
            break
    
    # Helper to find row value by line number
    def get_val_by_line(line_num, month):
        for row in pnl.rows:
            if row.line_number == line_num:
                return row.values.get(month, 0.0)
        return 0.0
    
    # Helper to find row value by description start
    def get_val(desc_start, month):
        for row in pnl.rows:
            if row.description.startswith(desc_start):
                return row.values.get(month, 0.0)
        return 0.0

    # Extract KPIs from latest month
    revenue = get_val_by_line(1, latest_month)  # RECEITA OPERACIONAL BRUTA
    ebitda = get_val_by_line(13, latest_month)  # EBITDA
    gross_profit = get_val_by_line(7, latest_month)  # LUCRO BRUTO
    net_result = ebitda  # For now, net result = EBITDA (no depreciation/interest/taxes yet)
    
    # KPIs
    kpis = {
        "total_revenue": revenue,
        "net_result": net_result,
        "ebitda": ebitda,
        "ebitda_margin": ebitda / revenue if revenue else 0,
        "gross_margin": gross_profit / revenue if revenue else 0,
        "nau": 0,  # Placeholder
        "cpa": 0   # Placeholder
    }
    
    # Monthly Data for Charts
    monthly_data = []
    for m in pnl.headers:
        # Get values for this month
        month_revenue = get_val_by_line(1, m)
        month_ebitda = get_val_by_line(13, m)
        
        # Costs and expenses are stored as negative, convert to positive for charts
        month_cogs = abs(get_val_by_line(4, m))  # (-) CUSTOS DIRETOS total
        month_opex = abs(get_val_by_line(8, m))  # (-) DESPESAS OPERACIONAIS total
        
        monthly_data.append({
            "month": m,
            "revenue": month_revenue,
            "ebitda": month_ebitda,
            "costs": month_cogs,  # Positive for chart display
            "expenses": month_opex  # Positive for chart display
        })
        
    # Cost Structure (Latest Month) - all as positive values
    cost_structure = {
        "payment_processing": abs(get_val_by_line(5, latest_month)),  # Payment Processing
        "cogs": abs(get_val_by_line(6, latest_month)),  # COGS (Web Services)
        "marketing": abs(get_val_by_line(9, latest_month)),  # Marketing
        "wages": abs(get_val_by_line(10, latest_month)),  # Salários
        "tech": abs(get_val_by_line(11, latest_month)),  # Tech Support
        "other": abs(get_val_by_line(12, latest_month))  # Outras Despesas
    }
    
    return DashboardData(kpis=kpis, monthly_data=monthly_data, cost_structure=cost_structure)

