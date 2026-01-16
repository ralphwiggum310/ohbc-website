import sqlite3
import os
from pathlib import Path

def inspect_niv_db(db_path):
    """Inspect the NIV SQLite database structure."""
    if not os.path.exists(db_path):
        print(f"Error: Database not found at {db_path}")
        return
    
    try:
        # Connect to the database
        conn = sqlite3.connect(f'file:{db_path}?mode=ro', uri=True)
        cursor = conn.cursor()
        
        # Get all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [t[0] for t in cursor.fetchall()]
        
        print(f"\n=== NIV Database Structure ===")
        print(f"Database: {Path(db_path).name}")
        print(f"Location: {db_path}")
        
        for table in tables:
            print(f"\nTable: {table}")
            print("-" * (len(table) + 8))
            
            # Get column info
            cursor.execute(f"PRAGMA table_info({table})")
            columns = cursor.fetchall()
            
            print("Columns:")
            for col in columns:
                col_id, col_name, col_type, not_null, default_val, is_pk = col
                pk = "PRIMARY KEY" if is_pk else ""
                null = "NOT NULL" if not_null else ""
                default = f"DEFAULT {default_val}" if default_val is not None else ""
                print(f"  {col_name}: {col_type} {null} {pk} {default}".strip())
            
            # Get row count
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            row_count = cursor.fetchone()[0]
            print(f"\n  Rows: {row_count:,}")
            
            # Get sample data (first row)
            if row_count > 0:
                cursor.execute(f"SELECT * FROM {table} LIMIT 1")
                sample = cursor.fetchone()
                col_names = [col[1] for col in columns]
                
                print("\n  Sample row:")
                for name, value in zip(col_names, sample):
                    val_str = str(value)
                    if len(val_str) > 50:
                        val_str = val_str[:47] + "..."
                    print(f"    {name}: {val_str}")
        
        # Check for verses table
        verses_tables = [t for t in tables if 'verse' in t.lower()]
        if verses_tables:
            print("\n=== Potential Verses Tables ===")
            for vt in verses_tables:
                cursor.execute(f"SELECT COUNT(*) FROM {vt}")
                count = cursor.fetchone()[0]
                print(f"- {vt}: {count:,} rows")
                
                # Get column info
                cursor.execute(f"PRAGMA table_info({vt})")
                cols = [c[1] for c in cursor.fetchall()]
                print(f"  Columns: {', '.join(cols)}")
                
                # Get sample verse
                try:
                    cursor.execute(f"SELECT * FROM {vt} LIMIT 1")
                    sample = cursor.fetchone()
                    if sample:
                        print(f"  Sample: {str(sample)[:100]}...")
                except:
                    pass
                
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
        inspect_niv_db(str(db_path))
    else:
        print("NIV'11.SQLite3 not found in expected locations.")
        print("Please provide the correct path to the NIV'11.SQLite3 file.")
