#!/usr/bin/env python3
"""
Test script to verify CSV upload processing
"""
import sys
sys.path.insert(0, './backend')

from logic import process_upload

# Test with the sample CSV file
csv_file_path = "Extratodemovimentações-2025-ExtratoFinanceiro.csv"

print(f"Testing CSV upload with file: {csv_file_path}")
print("-" * 50)

try:
    with open(csv_file_path, 'rb') as f:
        content = f.read()
    
    print(f"File size: {len(content)} bytes")
    
    # Try to process the upload
    df = process_upload(content)
    
    print(f"✓ Successfully processed!")
    print(f"  Rows: {len(df)}")
    print(f"  Columns: {list(df.columns)}")
    print(f"\nFirst few rows:")
    print(df.head())
    
    print(f"\nData types:")
    print(df.dtypes)
    
    print(f"\nSample values:")
    print(f"  Date range: {df['Data de competência'].min()} to {df['Data de competência'].max()}")
    print(f"  Total value: R$ {df['Valor_Num'].sum():,.2f}")
    
except Exception as e:
    print(f"✗ ERROR: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
