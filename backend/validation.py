"""
Validation module for financial calculations.

Validates consistency between Dashboard KPIs and P&L totals,
and internal calculation logic.
"""

from typing import Dict, List, Tuple


def validate_dashboard_pnl_consistency(
    dashboard_data: Dict,
    pnl_data: Dict
) -> Tuple[bool, List[str]]:
    """
    Validate that dashboard KPIs match P&L totals.
    
    Args:
        dashboard_data: Dashboard data from get_dashboard()
        pnl_data: P&L data from calculate_pnl()
    
    Returns:
        (is_valid, list_of_errors)
    """
    errors = []
    
    # Extract latest month from P&L
    if not pnl_data.get('headers'):
        return False, ["No P&L headers found"]
    
    latest_month = pnl_data['headers'][-1]
    
    # Helper function to find P&L value by description
    def find_value(description: str) -> float:
        for row in pnl_data['rows']:
            if description.lower() in row['description'].lower():
                return row['values'].get(latest_month, 0)
        return 0
    
    # Validate Revenue
    pnl_revenue = find_value('receita operacional bruta')
    dash_revenue = dashboard_data['kpis']['total_revenue']
    
    if abs(pnl_revenue - dash_revenue) > 0.01:
        errors.append(
            f"Revenue mismatch: Dashboard={dash_revenue:.2f}, P&L={pnl_revenue:.2f}"
        )
    
    # Validate EBITDA
    pnl_ebitda = find_value('ebitda')
    dash_ebitda = dashboard_data['kpis']['ebitda']
    
    if abs(pnl_ebitda - dash_ebitda) > 0.01:
        errors.append(
            f"EBITDA mismatch: Dashboard={dash_ebitda:.2f}, P&L={pnl_ebitda:.2f}"
        )
    
    # Validate Net Result
    pnl_net = find_value('resultado líquido')
    dash_net = dashboard_data['kpis']['net_result']
    
    if abs(pnl_net - dash_net) > 0.01:
        errors.append(
            f"Net Result mismatch: Dashboard={dash_net:.2f}, P&L={pnl_net:.2f}"
        )
    
    # Validate Gross Margin calculation
    gross_profit = find_value('lucro bruto')
    if dash_revenue > 0:
        expected_margin = (gross_profit / dash_revenue) * 100
        actual_margin = dashboard_data['kpis']['gross_margin']
        
        if abs(expected_margin - actual_margin) > 0.01:
            errors.append(
                f"Gross Margin mismatch: Expected={expected_margin:.2f}%, Actual={actual_margin:.2f}%"
            )
    
    return len(errors) == 0, errors


def validate_calculation_logic(pnl_data: Dict, month: str) -> Tuple[bool, List[str]]:
    """
    Validate internal calculation consistency for a specific month.
    
    Checks:
    - Gross Profit = Revenue - COGS - Payment Processing
    - EBITDA = Gross Profit - OpEx
    - Net Result = EBITDA (currently)
    
    Args:
        pnl_data: P&L data from calculate_pnl()
        month: Month to validate (e.g., '2024-10')
    
    Returns:
        (is_valid, list_of_errors)
    """
    errors = []
    
    # Helper function to find P&L value by description
    def find_value(description: str) -> float:
        for row in pnl_data['rows']:
            if description.lower() in row['description'].lower():
                return row['values'].get(month, 0)
        return 0
    
    # Get values
    revenue = find_value('receita operacional bruta')
    payment_proc = abs(find_value('payment processing'))
    cogs = abs(find_value('cogs'))
    gross_profit = find_value('lucro bruto')
    
    # Validate Gross Profit
    expected_gp = revenue - payment_proc - cogs
    if abs(gross_profit - expected_gp) > 0.01:
        errors.append(
            f"Gross Profit calculation error: Expected={expected_gp:.2f}, Actual={gross_profit:.2f}"
        )
    
    # Get OpEx components
    marketing = abs(find_value('marketing'))
    wages = abs(find_value('salários'))
    tech = abs(find_value('tech support'))
    other = abs(find_value('outras despesas'))
    
    total_opex = marketing + wages + tech + other
    
    ebitda = find_value('ebitda')
    expected_ebitda = gross_profit - total_opex
    
    if abs(ebitda - expected_ebitda) > 0.01:
        errors.append(
            f"EBITDA calculation error: Expected={expected_ebitda:.2f}, Actual={ebitda:.2f}"
        )
    
    # Validate Net Result = EBITDA
    net_result = find_value('resultado líquido')
    if abs(net_result - ebitda) > 0.01:
        errors.append(
            f"Net Result should equal EBITDA: EBITDA={ebitda:.2f}, Net Result={net_result:.2f}"
        )
    
    return len(errors) == 0, errors
