import sqlite3
import os
from pathlib import Path

def get_table_info(conn, table_name):
    """Get detailed information about a table."""
    cursor = conn.cursor()
    
    # Get column info
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = cursor.fetchall()
    
    # Get sample data (first 2 rows)
    cursor.execute(f"SELECT * FROM {table_name} LIMIT 2")
    sample_rows = cursor.fetchall()
    
    # Get row count
    cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
    row_count = cursor.fetchone()[0]
    
    return {
        'columns': columns,
        'sample_rows': sample_rows,
        'row_count': row_count
    }

def main():
    # Path to NIV database
    db_path = Path("data/bible/NIV'11.SQLite3")
    
    if not db_path.exists():
        print(f"Error: Database not found at {db_path}")
        return
    
    try:
        # Connect to the database
        conn = sqlite3.connect(f'file:{db_path}?mode=ro', uri=True)
        cursor = conn.cursor()
        
        # Get all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        
        print(f"=== Database: {db_path.name} ===\n")
        print(f"Tables: {', '.join(tables)}\n")
        
        # Check for verses table (case insensitive)
        verses_tables = [t for t in tables if 'verse' in t.lower()]
        
        if not verses_tables:
            print("No obvious 'verses' table found. Available tables:")
            for table in tables:
                print(f"\n=== {table} ===")
                try:
                    info = get_table_info(conn, table)
                    print(f"Columns: {[col[1] for col in info['columns']]}")
                    print(f"Row count: {info['row_count']:,}")
                    if info['sample_rows']:
                        print("Sample row:", info['sample_rows'][0])
                except Exception as e:
                    print(f"  Error: {e}")
        else:
            print(f"Found potential verses tables: {', '.join(verses_tables)}\n")
            for table in verses_tables:
                print(f"=== {table} ===")
                info = get_table_info(conn, table)
                print(f"Columns: {[col[1] for col in info['columns']]}")
                print(f"Row count: {info['row_count']:,}")
                if info['sample_rows']:
                    print("Sample rows:")
                    for row in info['sample_rows']:
                        print(f"  {row}")
                print()
        
        # Check for any table with verse-like data
        if not verses_tables:
            print("\nSearching for tables with verse-like data...")
            for table in tables:
                try:
                    cursor.execute(f"SELECT * FROM {table} LIMIT 1")
                    row = cursor.fetchone()
                    if row and len(row) >= 4:  # At least book, chapter, verse, text
                        print(f"\nPotential verse data in {table}:")
                        print(f"Columns: {[desc[0] for desc in cursor.description]}")
                        print(f"Sample: {row}")
                except:
                    continue
        
        conn.close()
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")

if __name__ == "__main__":
    main()
