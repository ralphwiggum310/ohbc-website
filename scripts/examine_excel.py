import pandas as pd
import os
import json

# Path to the Excel file
excel_path = os.path.join('Bible api', 'NASB1995', 'NASB1995.xlsx')

print(f"Reading Excel file: {excel_path}")

# Read the Excel file
try:
    # Read the first sheet
    df = pd.read_excel(excel_path, sheet_name=0)
    
    # Print basic information
    print("\n=== File Information ===")
    print(f"Number of rows: {len(df)}")
    print(f"Number of columns: {len(df.columns)}")
    print("\nColumn names:")
    for i, col in enumerate(df.columns):
        print(f"  {i+1}. {col}")
    
    # Print first few rows
    print("\n=== First 5 rows ===")
    print(df.head().to_string())
    
    # Print data types
    print("\n=== Data Types ===")
    print(df.dtypes)
    
    # Count non-null values in each column
    print("\n=== Non-null values ===")
    print(df.count())
    
    # Save the first 100 rows to a JSON file for inspection
    output_path = os.path.join('Bible api', 'NASB1995', 'sample_data.json')
    df.head(100).to_json(output_path, orient='records', indent=2)
    print(f"\nSample data saved to: {output_path}")
    
except Exception as e:
    print(f"Error: {str(e)}")
    
    # If the above fails, try reading the file as CSV
    try:
        print("\nTrying to read as CSV...")
        df = pd.read_csv(excel_path)
        print("\nSuccessfully read as CSV!")
        print(f"Number of rows: {len(df)}")
        print(f"Number of columns: {len(df.columns)}")
        print("\nColumn names:")
        for i, col in enumerate(df.columns):
            print(f"  {i+1}. {col}")
        print("\nFirst 5 rows:")
        print(df.head().to_string())
    except Exception as e2:
        print(f"Also failed to read as CSV: {str(e2)}")
