import sqlite3
import os
from pathlib import Path

def get_table_info(db_path, table_name):
    """Get detailed column information for a table."""
    try:
        conn = sqlite3.connect(f'file:{db_path}?mode=ro', uri=True)
        cursor = conn.cursor()
        
        # Get column info
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        
        # Get sample data (first 2 rows)
        cursor.execute(f"SELECT * FROM {table_name} LIMIT 2")
        sample_rows = cursor.fetchall()
        
        conn.close()
        
        return {
            'columns': columns,
            'sample_rows': sample_rows
        }
    except sqlite3.Error as e:
        print(f"Error inspecting {table_name} in {db_path.name}: {e}")
        return None

def main():
    # Set up paths
    base_dir = Path(__file__).parent.parent
    source_db = base_dir / 'data' / 'bible' / 'NASB.sqlite'
    target_db = base_dir / 'data' / 'bible' / 'bibles.db'
    
    # Check source tables
    print("=== Source Database (NASB.sqlite) ===")
    source_conn = sqlite3.connect(f'file:{source_db}?mode=ro', uri=True)
    source_cursor = source_conn.cursor()
    source_tables = source_cursor.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
    source_tables = [t[0] for t in source_tables if not t[0].startswith('sqlite_')]
    print("Tables:", ", ".join(source_tables))
    
    # Check target tables
    print("\n=== Target Database (bibles.db) ===")
    target_conn = sqlite3.connect(f'file:{target_db}?mode=ro', uri=True)
    target_cursor = target_conn.cursor()
    target_tables = target_cursor.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
    target_tables = [t[0] for t in target_tables if not t[0].startswith('sqlite_')]
    print("Tables:", ", ".join(target_tables))
    
    # Get details for verse table in source
    source_table = 'verse' if 'verse' in source_tables else source_tables[0]
    print(f"\n=== Source Table: {source_table} ===")
    source_info = get_table_info(source_db, source_table)
    if source_info:
        print("\nColumns:")
        for col in source_info['columns']:
            print(f"  {col[1]} ({col[2]}) {'NOT NULL' if col[3] else ''} {'PRIMARY KEY' if col[5] else ''}")
        
        print("\nSample Rows:")
        for row in source_info.get('sample_rows', []):
            print("  ", row)
    
    # Get details for target table
    target_table = 't_nasb1995'
    if target_table in target_tables:
        print(f"\n=== Target Table: {target_table} ===")
        target_info = get_table_info(target_db, target_table)
        if target_info:
            print("\nColumns:")
            for col in target_info['columns']:
                print(f"  {col[1]} ({col[2]}) {'NOT NULL' if col[3] else ''} {'PRIMARY KEY' if col[5] else ''}")
            
            print("\nSample Rows:")
            for row in target_info.get('sample_rows', []):
                print("  ", row)
    
    # Check for book mapping
    if 'book' in source_tables:
        print("\n=== Source Book Table ===")
        book_info = get_table_info(source_db, 'book')
        if book_info:
            print("\nBook Table Columns:")
            for col in book_info['columns']:
                print(f"  {col[1]} ({col[2]})")
            
            print("\nSample Book Rows (first 5):")
            for row in book_info.get('sample_rows', [])[:5]:
                print("  ", row)
    
    source_conn.close()
    target_conn.close()

if __name__ == "__main__":
    main()
