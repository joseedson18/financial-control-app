"""
Simple tests for P&L calculations.
Run with: pytest backend/test_simple.py -v
"""

def test_net_result_exists():
    """Test that Net Result line exists in P&L"""
    from logic import calculate_pnl, get_initial_mappings
    import pandas as pd
    
    # Create minimal sample data with all required columns
    df = pd.DataFrame({
        'Data de competência': ['2024-01-01'],
        'Mes_Competencia': ['2024-01'],
        'Centro de Custo 1': ['GOOGLE PLAY'],
        'Nome do fornecedor/cliente': ['GOOGLE BRASIL PAGAMENTOS LTDA'],
        'Valor_Num': [10000.00],
        'Fornecedor_Limpo': [' GOOGLE CLOUD'],
        'Categoria': ['RECEITAS'],
        'Descrição': ['Test'],
        'Plano de contas': ['Revenue']
    })
    
    # Calculate P&L
    result = calculate_pnl(df, get_initial_mappings())
    
    # Check that Net Result row exists
    net_result_rows = [r for r in result.rows if 'RESULTADO LÍQUIDO' in r.description.upper()]
    
    assert len(net_result_rows) > 0, "Net Result row missing from P&L"
    assert net_result_rows[0].is_total == True, "Net Result should be marked as total"
    
    print("✅ Net Result line exists in P&L")


def test_ebitda_equals_net_result():
    """Test that Net Result currently equals EBITDA"""
    from logic import calculate_pnl, get_initial_mappings
    import pandas as pd
    
    # Create sample data with all required columns
    df = pd.DataFrame({
        'Data de competência': ['2024-01-01', '2024-01-02', '2024-01-03'],
        'Mes_Competencia': ['2024-01', '2024-01', '2024-01'],
        'Centro de Custo 1': [
            'GOOGLE PLAY',
            'COGS',
            'MARKETING'
        ],
        'Nome do fornecedor/cliente': [
            'GOOGLE BRASIL PAGAMENTOS LTDA',
            'AWS',
            'MGA MARKETING LTDA'
        ],
        'Valor_Num': [100000.00, -10000.00, -5000.00],
        'Fornecedor_Limpo': ['GOOGLE CLOUD', 'AWS', 'MARKETING'],
        'Categoria': ['RECEITAS', 'CUSTOS', 'DESPESAS'],
        'Descrição': ['Revenue', 'AWS Cost', 'Marketing'],
        'Plano de contas': ['Revenue', 'Expense', 'Expense']
    })
    
    result = calculate_pnl(df, get_initial_mappings())
    
    # Find EBITDA and Net Result
    ebitda_row = [r for r in result.rows if r.description == '(=) EBITDA'][0]
    net_result_row = [r for r in result.rows if 'RESULTADO LÍQUIDO' in r.description.upper()][0]
    
    month = result.headers[0]
    
    assert ebitda_row.values[month] == net_result_row.values[month], \
        "Net Result should equal EBITDA (no financial expenses/taxes yet)"
    
    print(f"✅ EBITDA ({ebitda_row.values[month]:.2f}) equals Net Result ({net_result_row.values[month]:.2f})")


def test_validation_module():
    """Test that validation module works"""
    from validation import validate_dashboard_pnl_consistency
    
    # Mock data
    dashboard_data = {
        'kpis': {
            'total_revenue': 100000,
            'ebitda': 50000,
            'net_result': 50000,
            'gross_margin': 70.0
        }
    }
    
    pnl_data = {
        'headers': ['2024-01'],
        'rows': [
            {'description': 'RECEITA OPERACIONAL BRUTA', 'values': {'2024-01': 100000}},
            {'description': 'LUCRO BRUTO', 'values': {'2024-01': 70000}},
            {'description': '(=) EBITDA', 'values': {'2024-01': 50000}},
            {'description': '(=) RESULTADO LÍQUIDO', 'values': {'2024-01': 50000}}
        ]
    }
    
    valid, errors = validate_dashboard_pnl_consistency(dashboard_data, pnl_data)
    
    assert valid == True, f"Validation should pass. Errors: {errors}"
    assert len(errors) == 0, "Should have no errors"
    
    print("✅ Validation module works correctly")


if __name__ == '__main__':
    print("Running simple P&L tests...\n")
    
    try:
        test_net_result_exists()
        test_ebitda_equals_net_result()
        test_validation_module()
        print("\n🎉 All tests passed!")
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
    except Exception as e:
        print(f"\n❌ Error running tests: {e}")
