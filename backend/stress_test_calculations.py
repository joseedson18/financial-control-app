"""
Stress Test Suite for Financial Calculations.
Run with: python3 backend/stress_test_calculations.py
"""
import unittest
import pandas as pd
import numpy as np
from logic import calculate_pnl, get_initial_mappings

class TestFinancialStress(unittest.TestCase):
    
    def setUp(self):
        self.mappings = get_initial_mappings()

    def create_dataframe(self, transactions):
        """Helper to create a prepared DataFrame similar to what logic.py expects"""
        df = pd.DataFrame(transactions)
        
        # Ensure required columns exist
        if 'Data de competência' not in df.columns:
            df['Data de competência'] = pd.to_datetime('2024-01-01')
            
        # Add derived columns that logic.py expects
        if 'Mes_Competencia' not in df.columns:
            df['Mes_Competencia'] = df['Data de competência'].dt.strftime('%Y-%m')
            
        if 'Valor_Num' not in df.columns:
            # Assume 'Valor (R$)' is already float in test data for simplicity, 
            # or copy it if it exists
            if 'Valor (R$)' in df.columns:
                df['Valor_Num'] = df['Valor (R$)']
            else:
                df['Valor_Num'] = 0.0
                
        return df

    def test_precision_rounding(self):
        """Test for floating point accumulation errors with many small transactions"""
        print("\nRunning Precision Rounding Test...")
        # Create 10,000 small transactions of 0.01
        data = []
        for i in range(10000):
            data.append({
                'Data de competência': pd.to_datetime('2024-01-15'),
                'Valor (R$)': 0.01,
                'Plano de contas': 'Revenue',
                'Centro de Custo 1': 'Google Play Net Revenue',
                'Nome do fornecedor/cliente': 'GOOGLE BRASIL PAGAMENTOS LTDA', # Exact match required
                'Descrição': f'Micro tx {i}'
            })
        
        df = self.create_dataframe(data)
        result = calculate_pnl(df, self.mappings)
        
        # Find Google Play Revenue row
        google_rows = [r for r in result.rows if 'Google Play Revenue' in r.description]
        if not google_rows:
            google_rows = [r for r in result.rows if 'RECEITA OPERACIONAL' in r.description]
            
        val = google_rows[0].values.get('2024-01', 0)
        
        self.assertAlmostEqual(val, 100.00, places=2, msg=f"Rounding error: {val} != 100.00")
        print(f"✅ Precision Test Passed: 10,000 x 0.01 = {val:.2f}")

    def test_large_numbers(self):
        """Test handling of very large numbers (Billions)"""
        print("\nRunning Large Numbers Test...")
        data = [
            {
                'Data de competência': pd.to_datetime('2024-01-01'),
                'Valor (R$)': 1_000_000_000.00,
                'Centro de Custo 1': 'Google Play Net Revenue',
                'Nome do fornecedor/cliente': 'GOOGLE BRASIL PAGAMENTOS LTDA',
                'Descrição': 'Big Rev'
            },
            {
                'Data de competência': pd.to_datetime('2024-01-01'),
                'Valor (R$)': -500_000_000.00,
                'Centro de Custo 1': 'Marketing & Growth Expenses',
                'Nome do fornecedor/cliente': 'MGA MARKETING LTDA',
                'Descrição': 'Big Cost'
            }
        ]
        
        df = self.create_dataframe(data)
        result = calculate_pnl(df, self.mappings)
        
        ebitda_row = [r for r in result.rows if '(=) EBITDA' in r.description][0]
        val = ebitda_row.values.get('2024-01', 0)
        
        expected = 323_500_000.00
        self.assertAlmostEqual(val, expected, places=2, msg=f"Large number mismatch: {val} != {expected}")
        print(f"✅ Large Number Test Passed: EBITDA = {val:,.2f}")

    def test_zero_division_margins(self):
        """Test margin calculations when revenue is zero"""
        print("\nRunning Zero Division Test...")
        data = [
            {
                'Data de competência': pd.to_datetime('2024-01-01'),
                'Valor (R$)': -100.00,
                'Centro de Custo 1': 'Marketing & Growth Expenses',
                'Nome do fornecedor/cliente': 'MGA MARKETING LTDA',
                'Descrição': 'Cost Only'
            }
        ]
        
        df = self.create_dataframe(data)
        result = calculate_pnl(df, self.mappings)
        
        margin_row = [r for r in result.rows if 'Margem EBITDA %' in r.description][0]
        val = margin_row.values.get('2024-01', 0)
        
        self.assertEqual(val, 0.0, f"Zero division failed, got {val}")
        print(f"✅ Zero Division Test Passed: Margin = {val}%")

    def test_negative_revenue_scenario(self):
        """Test scenario where refunds exceed sales (Negative Revenue)"""
        print("\nRunning Negative Revenue Test...")
        data = [
            {
                'Data de competência': pd.to_datetime('2024-01-01'),
                'Valor (R$)': -5000.00,
                'Centro de Custo 1': 'Google Play Net Revenue',
                'Nome do fornecedor/cliente': 'GOOGLE BRASIL PAGAMENTOS LTDA',
                'Descrição': 'Refunds'
            }
        ]
        
        df = self.create_dataframe(data)
        result = calculate_pnl(df, self.mappings)
        
        rev_row = [r for r in result.rows if 'RECEITA OPERACIONAL' in r.description][0]
        val = rev_row.values.get('2024-01', 0)
        
        self.assertEqual(val, -5000.00, "Negative revenue not preserved")
        
        pp_row = [r for r in result.rows if 'Payment Processing' in r.description][0]
        pp_val = pp_row.values.get('2024-01', 0)
        
        self.assertGreater(pp_val, 0, f"Fee refund should be positive, got {pp_val}")
        print(f"✅ Negative Revenue Test Passed: Revenue={val}, Fee Refund={pp_val}")

    def test_complex_consistency(self):
        """Verify A - B - C = D exactly across all lines"""
        print("\nRunning Consistency Test...")
        data = [
            {'Data de competência': pd.to_datetime('2024-01-01'), 'Valor (R$)': 10000.00, 'Centro de Custo 1': 'Google Play Net Revenue', 'Nome do fornecedor/cliente': 'GOOGLE BRASIL PAGAMENTOS LTDA'},
            {'Data de competência': pd.to_datetime('2024-01-01'), 'Valor (R$)': 20000.00, 'Centro de Custo 1': 'App Store Net Revenue', 'Nome do fornecedor/cliente': 'App Store (Apple)'},
            {'Data de competência': pd.to_datetime('2024-01-01'), 'Valor (R$)': -1000.00, 'Centro de Custo 1': 'Web Services Expenses', 'Nome do fornecedor/cliente': 'AWS'},
            {'Data de competência': pd.to_datetime('2024-01-01'), 'Valor (R$)': -5000.00, 'Centro de Custo 1': 'Marketing & Growth Expenses', 'Nome do fornecedor/cliente': 'MGA MARKETING LTDA'},
            {'Data de competência': pd.to_datetime('2024-01-01'), 'Valor (R$)': -2000.00, 'Centro de Custo 1': 'Wages Expenses', 'Nome do fornecedor/cliente': 'Diversos'} # Wages uses Diversos in mapping
        ]
        
        df = self.create_dataframe(data)
        result = calculate_pnl(df, self.mappings)
        
        # Helper to get value
        def get_val(desc_part):
            for r in result.rows:
                if desc_part in r.description:
                    return r.values.get('2024-01', 0)
            return 0
            
        revenue = get_val('RECEITA OPERACIONAL')
        pp = get_val('Payment Processing')
        cogs = get_val('COGS (Web Services)')
        gross_profit = get_val('LUCRO BRUTO')
        marketing = get_val('Marketing')
        wages = get_val('Salários')
        ebitda = get_val('(=) EBITDA')
        
        # Verify Gross Profit
        # PP and COGS are negative in display, so we add them (Revenue + (-Cost))
        calc_gp = revenue + pp + cogs
        self.assertAlmostEqual(calc_gp, gross_profit, places=2, msg=f"GP Mismatch: {calc_gp} != {gross_profit}")
        
        # Verify EBITDA
        calc_ebitda = gross_profit + marketing + wages
        self.assertAlmostEqual(calc_ebitda, ebitda, places=2, msg=f"EBITDA Mismatch: {calc_ebitda} != {ebitda}")
        
        print(f"✅ Consistency Test Passed: {revenue:.2f} + {pp:.2f} + {cogs:.2f} = {gross_profit:.2f}")
        print(f"✅ Consistency Test Passed: {gross_profit:.2f} + {marketing:.2f} + {wages:.2f} = {ebitda:.2f}")

    def test_fuzzy_matching(self):
        """Test if substring matching works for suppliers"""
        print("\nRunning Fuzzy Matching Test...")
        data = [
            # "GOOGLE BRASIL" should match "GOOGLE BRASIL PAGAMENTOS LTDA" mapping if logic is 'contains'
            # Wait, logic is: if m.fornecedor_cliente in row.supplier
            # Mapping: "GOOGLE BRASIL PAGAMENTOS LTDA"
            # Row: "GOOGLE BRASIL" -> "GOOGLE BRASIL PAGAMENTOS LTDA" in "GOOGLE BRASIL" is FALSE.
            # Row: "PAGAMENTO GOOGLE BRASIL PAGAMENTOS LTDA REF JAN" -> TRUE.
            
            # Let's test the reverse: Mapping is substring of Row?
            # logic.py: if m_supp in supplier:
            # So Mapping must be SHORTER or EQUAL to Row.
            
            # Mapping: "AWS"
            # Row: "AWS SERVICOS DE COMPUTACAO" -> "AWS" in "AWS SERVICOS..." -> TRUE.
            {
                'Data de competência': pd.to_datetime('2024-01-01'), 
                'Valor (R$)': -100.00, 
                'Centro de Custo 1': 'Web Services Expenses', 
                'Nome do fornecedor/cliente': 'AWS SERVICOS DE COMPUTACAO LTDA'
            },
            # Mapping: "MGA MARKETING LTDA"
            # Row: "MGA MARKETING LTDA - NF 123" -> TRUE
            {
                'Data de competência': pd.to_datetime('2024-01-01'), 
                'Valor (R$)': -500.00, 
                'Centro de Custo 1': 'Marketing & Growth Expenses', 
                'Nome do fornecedor/cliente': 'MGA MARKETING LTDA - NF 123'
            }
        ]
        
        df = self.create_dataframe(data)
        result = calculate_pnl(df, self.mappings)
        
        cogs_row = [r for r in result.rows if 'COGS (Web Services)' in r.description][0]
        val_cogs = cogs_row.values.get('2024-01', 0)
        
        self.assertEqual(val_cogs, -100.00, "Fuzzy match for AWS failed")
        
        marketing_row = [r for r in result.rows if 'Marketing' in r.description][0]
        val_mkt = marketing_row.values.get('2024-01', 0)
        
        self.assertEqual(val_mkt, -500.00, "Fuzzy match for MGA failed")
        print(f"✅ Fuzzy Matching Test Passed")

if __name__ == "__main__":
    unittest.main()
