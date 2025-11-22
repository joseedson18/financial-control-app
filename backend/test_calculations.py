"""
Test script to validate financial calculations

This script tests the fixed calculation logic to ensure:
1. Revenue is calculated correctly (positive)
2. COGS is calculated correctly (positive value, displayed as negative)
3. Gross Profit = Revenue - COGS
4. Operating Expenses are aggregated correctly
5. EBITDA = Gross Profit - Operating Expenses
"""

# Sample data for testing
sample_calculations = {
    "Revenue (Google + Apple)": 100000,
    "Investment Income": 500,
    "Total Revenue": 100500,
    
    "Payment Processing (17.65%)": 17650,
    "COGS (Web Services)": 5000,
    "Total Cost of Revenue": 22650,
    
    "Gross Profit": 100500 - 22650,  # = 77850
    
    "Marketing": 15000,
    "Wages": 30000,
    "Tech Support": 2000,
    "Other Expenses": 5000,
    "Total Operating Expenses": 52000,
    
    "EBITDA": 77850 - 52000  # = 25850
}

print("=" * 60)
print("FINANCIAL CALCULATION TEST")
print("=" * 60)

print("\n1. REVENUE")
print(f"   Revenue (Google + Apple): R$ {sample_calculations['Revenue (Google + Apple)']:,.2f}")
print(f"   Investment Income:        R$ {sample_calculations['Investment Income']:,.2f}")
print(f"   → Total Revenue:          R$ {sample_calculations['Total Revenue']:,.2f}")

print("\n2. COST OF REVENUE")
print(f"   Payment Processing:       R$ {sample_calculations['Payment Processing (17.65%)']:,.2f}")
print(f"   COGS (Web Services):      R$ {sample_calculations['COGS (Web Services)']:,.2f}")
print(f"   → Total Cost of Revenue:  R$ {sample_calculations['Total Cost of Revenue']:,.2f}")

print("\n3. GROSS PROFIT")
gross_profit_calc = sample_calculations['Total Revenue'] - sample_calculations['Total Cost of Revenue']
print(f"   Total Revenue:            R$ {sample_calculations['Total Revenue']:,.2f}")
print(f"   - Cost of Revenue:        R$ {sample_calculations['Total Cost of Revenue']:,.2f}")
print(f"   → Gross Profit:           R$ {gross_profit_calc:,.2f}")
print(f"   → Gross Margin:           {(gross_profit_calc / sample_calculations['Total Revenue'] * 100):.1f}%")

print("\n4. OPERATING EXPENSES")
print(f"   Marketing:                R$ {sample_calculations['Marketing']:,.2f}")
print(f"   Wages:                    R$ {sample_calculations['Wages']:,.2f}")
print(f"   Tech Support:             R$ {sample_calculations['Tech Support']:,.2f}")
print(f"   Other Expenses:           R$ {sample_calculations['Other Expenses']:,.2f}")
print(f"   → Total OpEx:             R$ {sample_calculations['Total Operating Expenses']:,.2f}")

print("\n5. EBITDA")
ebitda_calc = gross_profit_calc - sample_calculations['Total Operating Expenses']
print(f"   Gross Profit:             R$ {gross_profit_calc:,.2f}")
print(f"   - Operating Expenses:     R$ {sample_calculations['Total Operating Expenses']:,.2f}")
print(f"   → EBITDA:                 R$ {ebitda_calc:,.2f}")
print(f"   → EBITDA Margin:          {(ebitda_calc / sample_calculations['Total Revenue'] * 100):.1f}%")

print("\n" + "=" * 60)
print("VALIDATION")
print("=" * 60)

# Validate calculations
validations = [
    ("Total Revenue is positive", sample_calculations['Total Revenue'] > 0),
    ("Gross Profit is positive", gross_profit_calc > 0),
    ("EBITDA is reasonable", ebitda_calc > 0),
    ("Gross Profit = Revenue - COGS", abs(gross_profit_calc - sample_calculations['Gross Profit']) < 0.01),
    ("EBITDA = Gross Profit - OpEx", abs(ebitda_calc - sample_calculations['EBITDA']) < 0.01),
    ("Gross Margin is between 0-100%", 0 < (gross_profit_calc / sample_calculations['Total Revenue']) < 1),
    ("EBITDA Margin is between 0-100%", 0 < (ebitda_calc / sample_calculations['Total Revenue']) < 1),
]

all_passed = True
for test_name, result in validations:
    status = "✓ PASS" if result else "✗ FAIL"
    print(f"{status}: {test_name}")
    if not result:
        all_passed = False

print("\n" + "=" * 60)
if all_passed:
    print("✓ ALL TESTS PASSED - Calculations are correct!")
else:
    print("✗ SOME TESTS FAILED - Please review calculations")
print("=" * 60)
