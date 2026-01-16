import sqlite3
from pathlib import Path

def main():
    db_path = Path(__file__).parent.parent / "data" / "bible" / "NIV'11.SQLite3"
    
    if not db_path.exists():
        print(f"Error: Database not found at {db_path}")
        return
    
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    # Get table info
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    
    print("Tables in the database:")
    print("=" * 50)
    for table in tables:
        table_name = table[0]
        print(f"\nTable: {table_name}")
        print("-" * 50)
        
        # Get column info
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        
        print("Columns:")
        for col in columns:
            print(f"  {col[1]} ({col[2]})")
        
        # Get row count
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        print(f"\n  Rows: {count:,}")
        
        # Get sample data if it's the verses table
        if table_name.lower() == 'verses':
            print("\nSample data:")
            cursor.execute(f"SELECT * FROM {table_name} LIMIT 3")
            for row in cursor.fetchall():
                print(f"  {row}")
    
    # Get distinct book numbers and their counts
    if 'verses' in [t[0].lower() for t in tables]:
        print("\nBook numbers and verse counts:")
        print("=" * 50)
        cursor.execute("""
            SELECT book_number, COUNT(*) as count
            FROM verses
            GROUP BY book_number
            ORDER BY book_number
        """)
        
        for book_num, count in cursor.fetchall():
            print(f"Book {book_num}: {count:,} verses")
    
    conn.close()

if __name__ == "__main__":
    main()
