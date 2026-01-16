import sqlite3
import os
from pathlib import Path

def inspect_database(db_path):
    """Inspect the structure of the NIV SQLite database."""
    if not os.path.exists(db_path):
        print(f"Error: Database not found at {db_path}")
        return
    
    try:
        # Connect to the database
        conn = sqlite3.connect(f'file:{db_path}?mode=ro', uri=True)
        cursor = conn.cursor()
        
        # Get all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        
        print(f"\n=== Database: {Path(db_path).name} ===")
        print(f"Location: {db_path}")
        
        for table in tables:
            table_name = table[0]
            print(f"\nTable: {table_name}")
            print("-" * (len(table_name) + 8))
            
            # Get column info
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = cursor.fetchall()
            
            if columns:
                print("Columns:")
                for col in columns:
                    col_name, col_type = col[1], col[2]
                    not_null = "NOT NULL" if col[3] else ""
                    pk = "PRIMARY KEY" if col[5] else ""
                    print(f"  {col_name}: {col_type} {not_null} {pk}".strip())
            
            # Get row count
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            row_count = cursor.fetchone()[0]
            print(f"\n  Rows: {row_count:,}")
            
            # Get sample data (first 2 rows)
            if row_count > 0:
                cursor.execute(f"SELECT * FROM {table_name} LIMIT 2")
                sample_rows = cursor.fetchall()
                
                print("\n  Sample data:")
                for i, row in enumerate(sample_rows, 1):
                    # Truncate long text for display
                    row_display = []
                    for val in row:
                        if isinstance(val, str) and len(val) > 50:
                            row_display.append(f"{val[:50]}...")
                        else:
                            row_display.append(str(val))
                    print(f"  Row {i}: {', '.join(row_display)}")
        
        conn.close()
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")

if __name__ == "__main__":
    # Check both possible locations for the NIV database
    possible_paths = [
        Path("data/bible/NIV'11.SQLite3"),
        Path("Bible api/NIV/NIV'11.SQLite3")
    ]
    
    db_path = None
    for path in possible_paths:
        if path.exists():
            db_path = path
            break
    
    if db_path:
        inspect_database(str(db_path))
    else:
        print("NIV'11.SQLite3 not found in expected locations.")
        print("Please provide the correct path to the NIV'11.SQLite3 file.")
