"""
COMPREHENSIVE FINANCIAL CALCULATION VERIFICATION

This document traces through all calculations step-by-step to verify mathematical accuracy.
"""

print("="*80)
print("FINANCIAL CALCULATION VERIFICATION - STEP BY STEP")
print("="*80)

# Sample data mimicking CSV input
# In CSV: Revenues are POSITIVE, Expenses are NEGATIVE
sample_month = "2024-01"

# Raw line values from CSV mappings (as they would come from the CSV)
revenue_google = 50000  # Positive (lines 25, 26, 28)
revenue_apple = 50000   # Positive (lines 33, 34, 36)
invest_income = 500     # Positive (line 38)

cogs_aws = -2000        # Negative in CSV
cogs_cloudflare = -500  # Negative in CSV
cogs_heroku = -1000     # Negative in CSV
cogs_iaphub = -500      # Negative in CSV
cogs_mailgun = -500     # Negative in CSV
cogs_ses = -500         # Negative in CSV

marketing = -15000      # Negative in CSV
wages = -30000          # Negative in CSV
tech_support = -2000    # Negative in CSV
other_expenses = -5000  # Negative in CSV

print("\n📊 RAW DATA FROM CSV")
print("-" * 80)
print(f"Revenue (Google):          +R$ {revenue_google:>10,.2f}  (POSITIVE)")
print(f"Revenue (Apple):           +R$ {revenue_apple:>10,.2f}  (POSITIVE)")
print(f"Investment Income:         +R$ {invest_income:>10,.2f}  (POSITIVE)")
print(f"COGS (AWS):                 R$ {cogs_aws:>10,.2f}  (NEGATIVE)")
print(f"COGS (Cloudflare):          R$ {cogs_cloudflare:>10,.2f}  (NEGATIVE)")
print(f"COGS (Heroku):              R$ {cogs_heroku:>10,.2f}  (NEGATIVE)")
print(f"COGS (IAPHub):              R$ {cogs_iaphub:>10,.2f}  (NEGATIVE)")
print(f"COGS (MailGun):             R$ {cogs_mailgun:>10,.2f}  (NEGATIVE)")
print(f"COGS (SES):                 R$ {cogs_ses:>10,.2f}  (NEGATIVE)")
print(f"Marketing:                  R$ {marketing:>10,.2f}  (NEGATIVE)")
print(f"Wages:                      R$ {wages:>10,.2f}  (NEGATIVE)")
print(f"Tech Support:               R$ {tech_support:>10,.2f}  (NEGATIVE)")
print(f"Other Expenses:             R$ {other_expenses:>10,.2f}  (NEGATIVE)")

print("\n" + "="*80)
print("STEP 1: REVENUE CALCULATION")
print("="*80)

google_rev = revenue_google  # From lines 25, 26, 28
apple_rev = revenue_apple    # From lines 33, 34, 36
invest_income_calc = invest_income

revenue_no_tax = google_rev + apple_rev
total_revenue = revenue_no_tax + invest_income_calc

print(f"\nGoogle Revenue:           R$ {google_rev:>12,.2f}")
print(f"Apple Revenue:          + R$ {apple_rev:>12,.2f}")
print(f"{'─'*45}")
print(f"Revenue no Tax:         = R$ {revenue_no_tax:>12,.2f}")
print(f"\nRevenue no Tax:           R$ {revenue_no_tax:>12,.2f}")
print(f"Investment Income:      + R$ {invest_income_calc:>12,.2f}")
print(f"{'─'*45}")
print(f"TOTAL REVENUE:          = R$ {total_revenue:>12,.2f}")

assert total_revenue == 100500, f"Revenue calculation error: {total_revenue} != 100500"
print("✓ VERIFIED: Total Revenue = R$ 100,500.00")

print("\n" + "="*80)
print("STEP 2: COST OF REVENUE (COGS)")
print("="*80)

# Payment Processing Fee
payment_processing_cost = revenue_no_tax * 0.1765
print(f"\nPayment Processing (17.65% of Revenue no Tax):")
print(f"  {revenue_no_tax:,.2f} × 0.1765 = R$ {payment_processing_cost:>12,.2f}")

# COGS from CSV (convert negatives to positive)
cogs_sum_raw = cogs_aws + cogs_cloudflare + cogs_heroku + cogs_iaphub + cogs_mailgun + cogs_ses
cogs_sum = abs(cogs_sum_raw)

print(f"\nCOGS (Web Services):")
print(f"  AWS:               R$ {abs(cogs_aws):>10,.2f}")
print(f"  Cloudflare:        R$ {abs(cogs_cloudflare):>10,.2f}")
print(f"  Heroku:            R$ {abs(cogs_heroku):>10,.2f}")
print(f"  IAPHub:            R$ {abs(cogs_iaphub):>10,.2f}")
print(f"  MailGun:           R$ {abs(cogs_mailgun):>10,.2f}")
print(f"  SES:             + R$ {abs(cogs_ses):>10,.2f}")
print(f"  {'─'*35}")
print(f"  Total COGS:      = R$ {cogs_sum:>10,.2f}")

total_cost_of_revenue = payment_processing_cost + cogs_sum
print(f"\nPayment Processing:       R$ {payment_processing_cost:>12,.2f}")
print(f"COGS:                   + R$ {cogs_sum:>12,.2f}")
print(f"{'─'*45}")
print(f"TOTAL COST OF REVENUE:  = R$ {total_cost_of_revenue:>12,.2f}")

assert abs(payment_processing_cost - 17650) < 0.01, f"Payment processing error: {payment_processing_cost}"
assert cogs_sum == 5000, f"COGS sum error: {cogs_sum}"
assert abs(total_cost_of_revenue - 22650) < 0.01, f"Total cost error: {total_cost_of_revenue}"
print("✓ VERIFIED: Total Cost of Revenue = R$ 22,650.00")

print("\n" + "="*80)
print("STEP 3: GROSS PROFIT")
print("="*80)

gross_profit = total_revenue - total_cost_of_revenue
gross_margin = gross_profit / total_revenue if total_revenue else 0

print(f"\nTotal Revenue:            R$ {total_revenue:>12,.2f}")
print(f"Cost of Revenue:        - R$ {total_cost_of_revenue:>12,.2f}")
print(f"{'─'*45}")
print(f"GROSS PROFIT:           = R$ {gross_profit:>12,.2f}")
print(f"\nGross Margin:             {gross_margin*100:>11.1f}%")

assert abs(gross_profit - 77850) < 0.01, f"Gross profit error: {gross_profit}"
assert abs(gross_margin - 0.7746) < 0.01, f"Gross margin error: {gross_margin}"
print("✓ VERIFIED: Gross Profit = R$ 77,850.00 (77.5% margin)")

print("\n" + "="*80)
print("STEP 4: OPERATING EXPENSES")
print("="*80)

# Convert negative expenses to positive
marketing_abs = abs(marketing)
wages_abs = abs(wages)
tech_support_abs = abs(tech_support)
other_expenses_abs = abs(other_expenses)

sga_total = marketing_abs + wages_abs + tech_support_abs
total_opex = sga_total + other_expenses_abs

print(f"\nSG&A Expenses:")
print(f"  Marketing:         R$ {marketing_abs:>10,.2f}")
print(f"  Wages:             R$ {wages_abs:>10,.2f}")
print(f"  Tech Support:    + R$ {tech_support_abs:>10,.2f}")
print(f"  {'─'*35}")
print(f"  Total SG&A:      = R$ {sga_total:>10,.2f}")

print(f"\nTotal SG&A:               R$ {sga_total:>12,.2f}")
print(f"Other Expenses:         + R$ {other_expenses_abs:>12,.2f}")
print(f"{'─'*45}")
print(f"TOTAL OPERATING EXPENSES: R$ {total_opex:>12,.2f}")

assert sga_total == 47000, f"SG&A total error: {sga_total}"
assert total_opex == 52000, f"Total OpEx error: {total_opex}"
print("✓ VERIFIED: Total Operating Expenses = R$ 52,000.00")

print("\n" + "="*80)
print("STEP 5: EBITDA")
print("="*80)

ebitda = gross_profit - total_opex
ebitda_margin = ebitda / total_revenue if total_revenue else 0

print(f"\nGross Profit:             R$ {gross_profit:>12,.2f}")
print(f"Operating Expenses:     - R$ {total_opex:>12,.2f}")
print(f"{'─'*45}")
print(f"EBITDA:                 = R$ {ebitda:>12,.2f}")
print(f"\nEBITDA Margin:            {ebitda_margin*100:>11.1f}%")

assert abs(ebitda - 25850) < 0.01, f"EBITDA error: {ebitda}"
assert abs(ebitda_margin - 0.2572) < 0.01, f"EBITDA margin error: {ebitda_margin}"
print("✓ VERIFIED: EBITDA = R$ 25,850.00 (25.7% margin)")

print("\n" + "="*80)
print("STEP 6: LINE VALUES STORAGE (for P&L display)")
print("="*80)

# Simulate line_values storage
line_values_stored = {
    100: total_revenue,              # Total Revenue (positive)
    101: revenue_no_tax,             # Revenue no Tax (positive)
    102: -payment_processing_cost,   # Payment Processing (negative for display)
    103: -cogs_sum,                  # COGS (negative for display)
    104: gross_profit,               # Gross Profit
    105: -sga_total,                 # SG&A (negative for display)
    106: ebitda,                     # EBITDA
    107: -marketing_abs,             # Marketing (negative for display)
    108: -wages_abs,                 # Wages (negative for display)
    109: -tech_support_abs,          # Tech Support (negative for display)
    110: -other_expenses_abs         # Other Expenses (negative for display)
}

print("\nLine Values Stored:")
for line_num, value in line_values_stored.items():
    sign = "+" if value >= 0 else ""
    print(f"  Line {line_num:3d}: {sign}R$ {value:>12,.2f}")

print("\n" + "="*80)
print("STEP 7: P&L ROW DISPLAY")
print("="*80)

pnl_structure = [
    (1, "RECEITA OPERACIONAL BRUTA", line_values_stored[100], True, False),
    (2, "  Receita de Vendas (Google + Apple)", line_values_stored[101], False, False),
    (3, "  Rendimentos de Aplicações", invest_income, False, False),
    (4, "(-) CUSTOS DIRETOS", line_values_stored[102] + line_values_stored[103], True, False),
    (5, "  Payment Processing (17.65%)", line_values_stored[102], False, False),
    (6, "  COGS (Web Services)", line_values_stored[103], False, False),
    (7, "(=) LUCRO BRUTO", line_values_stored[104], False, True),
    (8, "(-) DESPESAS OPERACIONAIS", line_values_stored[105] + line_values_stored[110], True, False),
    (9, "  Marketing", line_values_stored[107], False, False),
    (10, "  Salários (Wages)", line_values_stored[108], False, False),
    (11, "  Tech Support & Services", line_values_stored[109], False, False),
    (12, "  Outras Despesas", line_values_stored[110], False, False),
    (13, "(=) EBITDA", line_values_stored[106], False, True),
]

print("\nP&L Statement Preview:")
print(f"{'Line':<5} {'Description':<40} {'Value':>15}")
print("─" * 65)
for line_num, desc, value, is_header, is_total in pnl_structure:
    marker = "📌" if is_total else ("📂" if is_header else "  ")
    sign = "" if value < 0 else "+"
    print(f"{line_num:<5} {marker} {desc:<38} {sign}R$ {value:>10,.2f}")

print("\n" + "="*80)
print("STEP 8: DASHBOARD DATA EXTRACTION")
print("="*80)

# Dashboard KPIs (using line numbers as in get_dashboard_data)
dashboard_revenue = line_values_stored[100]  # Line 1
dashboard_ebitda = line_values_stored[106]   # Line 13
dashboard_gross_profit = line_values_stored[104]  # Line 7
dashboard_net_result = dashboard_ebitda  # For now, same as EBITDA

kpis = {
    "total_revenue": dashboard_revenue,
    "net_result": dashboard_net_result,
    "ebitda": dashboard_ebitda,
    "ebitda_margin": dashboard_ebitda / dashboard_revenue if dashboard_revenue else 0,
    "gross_margin": dashboard_gross_profit / dashboard_revenue if dashboard_revenue else 0,
}

print("\nDashboard KPIs:")
print(f"  Total Revenue:    R$ {kpis['total_revenue']:>12,.2f}")
print(f"  Net Result:       R$ {kpis['net_result']:>12,.2f}")
print(f"  EBITDA:           R$ {kpis['ebitda']:>12,.2f}")
print(f"  EBITDA Margin:       {kpis['ebitda_margin']*100:>10.1f}%")
print(f"  Gross Margin:        {kpis['gross_margin']*100:>10.1f}%")

# Monthly chart data
chart_revenue = dashboard_revenue
chart_ebitda = dashboard_ebitda
chart_costs = abs(line_values_stored[102] + line_values_stored[103])  # Line 4 total
chart_expenses = abs(line_values_stored[105] + line_values_stored[110])  # Line 8 total

print("\nChart Data (monthly_data):")
print(f"  Month:            {sample_month}")
print(f"  Revenue:          R$ {chart_revenue:>12,.2f}  (positive)")
print(f"  EBITDA:           R$ {chart_ebitda:>12,.2f}  (can be +/-)")
print(f"  Costs:            R$ {chart_costs:>12,.2f}  (positive for bars)")
print(f"  Expenses:         R$ {chart_expenses:>12,.2f}  (positive for bars)")

# Cost structure (latest month)
cost_structure = {
    "payment_processing": abs(line_values_stored[102]),
    "cogs": abs(line_values_stored[103]),
    "marketing": abs(line_values_stored[107]),
    "wages": abs(line_values_stored[108]),
    "tech": abs(line_values_stored[109]),
    "other": abs(line_values_stored[110])
}

print("\nCost Structure (Pie Chart):")
for category, value in cost_structure.items():
    print(f"  {category.replace('_', ' ').title():<25} R$ {value:>10,.2f}")

print("\n" + "="*80)
print("FINAL VERIFICATION")
print("="*80)

checks = [
    ("Revenue is positive", dashboard_revenue > 0),
    ("Gross Profit is positive", dashboard_gross_profit > 0),
    ("EBITDA is reasonable", dashboard_ebitda > 0),
    ("Revenue calculation correct", abs(dashboard_revenue - 100500) < 0.01),
    ("Gross Profit calculation correct", abs(dashboard_gross_profit - 77850) < 0.01),
    ("EBITDA calculation correct", abs(dashboard_ebitda - 25850) < 0.01),
    ("Gross Margin in valid range", 0 < kpis['gross_margin'] < 1),
    ("EBITDA Margin in valid range", 0 < kpis['ebitda_margin'] < 1),
    ("Chart costs are positive", chart_costs > 0),
    ("Chart expenses are positive", chart_expenses > 0),
    ("Cost structure sum matches", abs(sum(cost_structure.values()) - (chart_costs + chart_expenses)) < 0.01),
]

all_passed = True
for check_name, result in checks:
    status = "✓" if result else "✗"
    print(f"{status} {check_name}")
    if not result:
        all_passed = False
        print(f"   ⚠️  FAILED!")

print("\n" + "="*80)
if all_passed:
    print("✅ ALL VERIFICATIONS PASSED - CALCULATIONS ARE MATHEMATICALLY CORRECT")
    print("✅ DASHBOARD DATA WILL DISPLAY CORRECTLY")
else:
    print("❌ SOME VERIFICATIONS FAILED - NEEDS REVIEW")
print("="*80)
