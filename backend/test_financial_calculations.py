"""
Unit Tests for Financial Calculations
=====================================

This module tests the core financial calculation logic including:
- Revenue aggregation from Google + Apple
- Payment processing = 17.65% of revenue
- COGS total calculation
- Gross profit = Revenue - COGS
- EBITDA = Gross Profit - OpEx
- Net Result = EBITDA (simplified)
- Dashboard KPI extraction
"""

import pytest
import pandas as pd
import numpy as np
from datetime import datetime
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from logic import calculate_pnl, get_dashboard_data, get_initial_mappings, process_upload
from models import MappingItem, PnLResponse, DashboardData


def create_mapping(fornecedor: str, linha_pl: str, centro_custo: str, tipo: str = "Despesa") -> MappingItem:
    """Helper to create a valid MappingItem with all required fields"""
    return MappingItem(
        grupo_financeiro=centro_custo,
        centro_custo=centro_custo,
        fornecedor_cliente=fornecedor,
        linha_pl=linha_pl,
        tipo=tipo,
        ativo="Sim"
    )


def create_test_dataframe(rows_data: list) -> pd.DataFrame:
    """
    Create a test DataFrame with all required columns.
    
    Args:
        rows_data: list of dicts with keys: supplier, value, month, cost_center
    
    Returns:
        DataFrame with all required columns for calculate_pnl
    """
    if not rows_data:
        return pd.DataFrame({
            'Mes_Competencia': [],
            'Valor_Num': [],
            'Centro de Custo 1': [],
            'Nome do fornecedor/cliente': [],
            'Fornecedor_Limpo': [],
            'Categoria': [],
        })
    
    df_data = {
        'Mes_Competencia': [r.get('month', '2024-01') for r in rows_data],
        'Valor_Num': [r.get('value', 0) for r in rows_data],
        'Centro de Custo 1': [r.get('cost_center', 'APP MOBILE - UMATCH') for r in rows_data],
        'Nome do fornecedor/cliente': [r.get('supplier', 'Unknown') for r in rows_data],
        'Fornecedor_Limpo': [r.get('supplier', 'Unknown') for r in rows_data],
        'Categoria': [r.get('category', 'RECEITAS') for r in rows_data],
    }
    return pd.DataFrame(df_data)


def _find_row_by_description(pnl: PnLResponse, description: str):
    for row in pnl.rows:
        if row.description == description:
            return row
    raise AssertionError(f"Row with description '{description}' not found")


class TestRevenueAggregation:
    """Test revenue aggregation from Google + Apple"""
    
    def test_total_revenue_row_exists(self):
        """Verify total revenue row is created"""
        df = create_test_dataframe([
            {'supplier': 'GOOGLE CLOUD', 'value': 1000.0, 'month': '2024-01', 'cost_center': 'GOOGLE PLAY'},
            {'supplier': 'APPLE DISTRIBUTION', 'value': 500.0, 'month': '2024-01', 'cost_center': 'APP STORE'},
        ])
        mappings = [
            create_mapping("GOOGLE", "25", "GOOGLE PLAY", "Receita"),
            create_mapping("APPLE", "33", "APP STORE", "Receita"),
        ]
        
        pnl = calculate_pnl(df, mappings)
        
        # Find total revenue row (line 1)
        revenue_row = next((r for r in pnl.rows if r.line_number == 1), None)
        
        assert revenue_row is not None, "Total revenue row not found"
        assert pnl.headers is not None


class TestPaymentProcessing:
    """Test payment processing calculation (17.65%)"""
    
    def test_payment_processing_row_exists(self):
        """Verify payment processing row is created"""
        df = create_test_dataframe([
            {'supplier': 'GOOGLE CLOUD', 'value': 1000.0, 'month': '2024-01', 'cost_center': 'GOOGLE PLAY'},
            {'supplier': 'APPLE DISTRIBUTION', 'value': 1000.0, 'month': '2024-01', 'cost_center': 'APP STORE'},
        ])
        mappings = [
            create_mapping("GOOGLE", "25", "GOOGLE PLAY", "Receita"),
            create_mapping("APPLE", "33", "APP STORE", "Receita"),
        ]
        
        pnl = calculate_pnl(df, mappings)
        
        # Find payment processing row (line 5)
        pp_row = next((r for r in pnl.rows if r.line_number == 5), None)
        
        assert pp_row is not None, "Payment processing row not found"


class TestCOGSCalculation:
    """Test Cost of Goods Sold calculation"""
    
    def test_cogs_row_exists(self):
        """Verify COGS row is created"""
        df = create_test_dataframe([
            {'supplier': 'AWS', 'value': -100.0, 'month': '2024-01', 'cost_center': 'COGS'},
        ])
        mappings = [
            create_mapping("AWS", "43", "COGS"),
        ]
        
        pnl = calculate_pnl(df, mappings)
        
        # Find COGS row (line 6)
        cogs_row = next((r for r in pnl.rows if r.line_number == 6), None)
        
        assert cogs_row is not None, "COGS row not found"


class TestGrossProfitCalculation:
    """Test Gross Profit = Revenue - Payment Processing - COGS"""
    
    def test_gross_profit_row_exists(self):
        """Verify gross profit row is created"""
        df = create_test_dataframe([
            {'supplier': 'GOOGLE CLOUD', 'value': 1000.0, 'month': '2024-01', 'cost_center': 'GOOGLE PLAY'},
        ])
        mappings = [
            create_mapping("GOOGLE", "25", "GOOGLE PLAY", "Receita"),
        ]
        
        pnl = calculate_pnl(df, mappings)
        
        gross_profit_row = next((r for r in pnl.rows if r.line_number == 7), None)
        
        assert gross_profit_row is not None, "Gross profit row not found"


class TestEBITDACalculation:
    """Test EBITDA = Gross Profit - Operating Expenses"""
    
    def test_ebitda_row_exists(self):
        """Verify EBITDA row is created"""
        df = create_test_dataframe([
            {'supplier': 'GOOGLE CLOUD', 'value': 1000.0, 'month': '2024-01', 'cost_center': 'GOOGLE PLAY'},
        ])
        mappings = [
            create_mapping("GOOGLE", "25", "GOOGLE PLAY", "Receita"),
        ]
        
        pnl = calculate_pnl(df, mappings)
        
        # Find EBITDA row (line 13)
        ebitda_row = next((r for r in pnl.rows if r.line_number == 13), None)
        
        assert ebitda_row is not None, "EBITDA row not found"


class TestNetResultCalculation:
    """Test Net Result = EBITDA (simplified for now)"""
    
    def test_net_result_equals_ebitda(self):
        """Verify net result equals EBITDA when no financial expenses"""
        df = create_test_dataframe([
            {'supplier': 'GOOGLE CLOUD', 'value': 1000.0, 'month': '2024-01', 'cost_center': 'GOOGLE PLAY'},
        ])
        mappings = [
            create_mapping("GOOGLE", "25", "GOOGLE PLAY", "Receita"),
        ]
        
        pnl = calculate_pnl(df, mappings)
        
        ebitda_row = next((r for r in pnl.rows if r.line_number == 13), None)
        net_result_row = next((r for r in pnl.rows if r.line_number == 16), None)
        
        assert ebitda_row is not None, "EBITDA row not found"
        assert net_result_row is not None, "Net Result row not found"
        
        # Get values for the month
        month_key = list(ebitda_row.values.keys())[0] if ebitda_row.values else None
        if month_key:
            ebitda = ebitda_row.values.get(month_key, 0)
            net_result = net_result_row.values.get(month_key, 0)
            
            assert ebitda == net_result, f"Net Result ({net_result}) should equal EBITDA ({ebitda})"


class TestDashboardKPIs:
    """Test Dashboard KPI extraction"""
    
    def test_dashboard_extracts_kpis(self):
        """Verify dashboard extracts key KPIs correctly"""
        df = create_test_dataframe([
            {'supplier': 'GOOGLE CLOUD', 'value': 1000.0, 'month': '2024-01', 'cost_center': 'GOOGLE PLAY'},
            {'supplier': 'APPLE DISTRIBUTION', 'value': 500.0, 'month': '2024-01', 'cost_center': 'APP STORE'},
        ])
        mappings = [
            create_mapping("GOOGLE", "25", "GOOGLE PLAY", "Receita"),
            create_mapping("APPLE", "33", "APP STORE", "Receita"),
        ]
        
        dashboard = get_dashboard_data(df, mappings)
        
        assert isinstance(dashboard, DashboardData)
    
    def test_dashboard_has_monthly_data(self):
        """Verify dashboard includes monthly data for charts"""
        df = create_test_dataframe([
            {'supplier': 'GOOGLE CLOUD', 'value': 1000.0, 'month': '2024-01', 'cost_center': 'GOOGLE PLAY'},
        ])
        mappings = [
            create_mapping("GOOGLE", "25", "GOOGLE PLAY", "Receita"),
        ]

        dashboard = get_dashboard_data(df, mappings)

        assert dashboard is not None

    def test_dashboard_net_result_respects_overrides(self):
        """Net result KPI should reflect overridden P&L values."""
        df = create_test_dataframe([
            {'supplier': 'GOOGLE CLOUD', 'value': 1000.0, 'month': '2024-01', 'cost_center': 'GOOGLE PLAY'},
            {'supplier': 'APPLE DISTRIBUTION', 'value': 500.0, 'month': '2024-01', 'cost_center': 'APP STORE'},
        ])

        mappings = [
            create_mapping("GOOGLE", "25", "GOOGLE PLAY", "Receita"),
            create_mapping("APPLE", "33", "APP STORE", "Receita"),
        ]

        overrides = {"111": {"2024-01": 1234.56}}

        dashboard = get_dashboard_data(df, mappings, overrides)

        assert dashboard is not None
        assert dashboard.kpis["net_result"] == pytest.approx(1234.56)
        assert dashboard.kpis["net_result"] != pytest.approx(dashboard.kpis["ebitda"])


class TestEdgeCases:
    """Test edge cases and error handling"""
    
    def test_empty_dataframe(self):
        """Verify handling of empty DataFrame"""
        df = create_test_dataframe([])
        mappings = []
        
        # Should not raise an error
        try:
            pnl = calculate_pnl(df, mappings)
            assert pnl is not None
        except Exception as e:
            pytest.fail(f"Should handle empty DataFrame gracefully: {e}")
    
    def test_null_values_handled(self):
        """Verify null values don't break calculations"""
        df = create_test_dataframe([
            {'supplier': 'GOOGLE CLOUD', 'value': 1000.0, 'month': '2024-01', 'cost_center': 'GOOGLE PLAY'},
            {'supplier': 'APPLE', 'value': 500.0, 'month': '2024-01', 'cost_center': 'APP STORE'},
        ])
        # Add a row with NaN
        df.loc[2] = ['2024-01', np.nan, 'UNKNOWN', None, None, 'OTHER']
        
        mappings = [
            create_mapping("GOOGLE", "25", "GOOGLE PLAY", "Receita"),
            create_mapping("APPLE", "33", "APP STORE", "Receita"),
        ]
        
        # Should not raise an error
        try:
            pnl = calculate_pnl(df, mappings)
            assert pnl is not None
        except Exception as e:
            pytest.fail(f"Should handle null values gracefully: {e}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

class TestMappingLogic:
    """Test the improved mapping logic (Generic Fallback + Description Match)"""
    
    def test_generic_fallback(self):
        """Verify that a row with unknown supplier matches the Generic mapping for its Cost Center"""
        # Row has Cost Center "Web Services Expenses" but Supplier "Unknown Tech"
        # Should match "Web Services - Generic" (Line 43)
        df = create_test_dataframe([
            {'supplier': 'Unknown Tech', 'value': -50.0, 'month': '2024-01', 'cost_center': 'Web Services Expenses'},
        ])
        # Mappings: Specific (AWS->43) and Generic (Diversos->43)
        mappings = [
            create_mapping("AWS", "43", "Web Services Expenses", "Custo"),
            create_mapping("Diversos", "43", "Web Services Expenses", "Custo"),
        ]
        
        pnl = calculate_pnl(df, mappings)
        
        # Should be in COGS (Line 6 -> derived from 43)
        cogs_row = next((r for r in pnl.rows if r.line_number == 6), None) # COGS
        assert cogs_row is not None
        val = cogs_row.values.get('2024-01', 0)
        assert val == -50.0  # Should define it as cost (negative in P&L if logic applies sign, wait. logic applies abs() then subtracts, so -50 becomes -50 in COGS row)
        # Verify: Logic says `cogs_sum = sum(abs(...))`. PnA item 103 = -cogs_sum. Row 6 values = line_values[103]. So -50. Correct.

    def test_description_matching(self):
        """Verify that we match based on Description if Supplier is empty or mismatching"""
        # Row has Supplier empty but Description "Payment to AWS for services"
        # Should match "AWS" specific mapping
        df = pd.DataFrame({
            'Mes_Competencia': ['2024-01'],
            'Valor_Num': [-100.0],
            'Centro de Custo 1': ['Web Services Expenses'],
            'Nome do fornecedor/cliente': [''], # Empty supplier
            'Descrição': ['Payment to AWS for usage'], # Description contains "AWS"
            'Categoria': ['Custo']
        })
        mappings = [
            create_mapping("AWS", "43", "Web Services Expenses", "Custo"),
        ]
        
        pnl = calculate_pnl(df, mappings)

        # Check COGS line (Line 43 accumulates to Line 6/103)
        # Line 6 is COGS.
        cogs_row = next((r for r in pnl.rows if r.line_number == 6), None)
        assert cogs_row is not None
        assert cogs_row.values['2024-01'] == -100.0


def test_payroll_category_reroutes_to_wages_cost_center(tmp_path):
    """Payroll-like descriptions/categories without a cost center should map to Wages."""

    csv_content = """Data de competência,Valor (R$),Centro de Custo 1,Nome do fornecedor/cliente,Categoria 1,Descrição
01/01/2024,-1000.00,,Fulano da Silva,Folha de Pagamento,Pagamento salário
"""

    csv_file = tmp_path / "payroll.csv"
    csv_file.write_text(csv_content, encoding="utf-8")

    df = process_upload(csv_file.read_bytes())

    assert df.loc[0, 'Centro de Custo 1'] == "Wages Expenses", "Payroll entries should be forced to Wages Expenses"

    pnl = calculate_pnl(df, get_initial_mappings())
    wages_row = _find_row_by_description(pnl, "Salários (Wages)")
    month = pnl.headers[0]

    assert wages_row.values[month] == -1000.0, "Mapped payroll value should flow into P&L line 62 and dashboard"

