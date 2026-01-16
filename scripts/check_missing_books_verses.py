import sqlite3
from pathlib import Path

def get_verse_counts(db_path, query, params=()):
    """Execute a query and return a dictionary of verse counts by book."""
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    cursor.execute(query, params)
    return {row[0]: row[1] for row in cursor.fetchall()}

def main():
    # Paths
    base_dir = Path(__file__).parent.parent
    source_db = base_dir / "data" / "bible" / "NIV'11.SQLite3"
    target_db = base_dir / "data" / "bible" / "bibles.db"
    
    # Query to get verse counts by book from source
    source_query = """
    SELECT book_number, COUNT(*) as count
    FROM verses
    GROUP BY book_number
    ORDER BY book_number
    """
    
    # Query to get verse counts by book from target
    target_query = """
    SELECT book, COUNT(*) as count
    FROM t_niv2011
    GROUP BY book
    ORDER BY book
    """
    
    # Get verse counts from both databases
    print("Fetching verse counts from source database...")
    source_counts = get_verse_counts(source_db, source_query)
    print(f"Found {len(source_counts)} books in source database")
    
    print("\nFetching verse counts from target database...")
    target_counts = get_verse_counts(target_db, target_query)
    print(f"Found {len(target_counts)} books in target database")
    
    # Find missing books
    missing_books = set(source_counts.keys()) - {k for k, v in target_counts.items() if v > 0}
    print(f"\nBooks with missing verses: {sorted(missing_books)}")
    
    # Check specific books that should be there
    books_to_check = [20, 65, 66]  # Exodus, Jude, Revelation
    
    print("\nChecking specific books:")
    print("-" * 80)
    
    for book_num in books_to_check:
        # Check in source
        source_conn = sqlite3.connect(str(source_db))
        source_cur = source_conn.cursor()
        source_cur.execute(
            "SELECT COUNT(*) FROM verses WHERE book_number = ?", 
            (book_num,)
        )
        source_count = source_cur.fetchone()[0]
        
        # Check in target
        target_conn = sqlite3.connect(str(target_db))
        target_cur = target_conn.cursor()
        target_cur.execute(
            "SELECT COUNT(*) FROM t_niv2011 WHERE book = ?", 
            (book_num,)
        )
        target_count = target_cur.fetchone()[0]
        
        print(f"Book {book_num}:")
        print(f"  - Source verses: {source_count}")
        print(f"  - Target verses: {target_count}")
        
        # Get sample verses from source
        source_cur.execute("""
            SELECT chapter, verse, substr(text, 1, 50) as sample
            FROM verses
            WHERE book_number = ?
            ORDER BY chapter, verse
            LIMIT 1
        """, (book_num,))
        sample = source_cur.fetchone()
        if sample:
            print(f"  - Sample verse: {sample[0]}:{sample[1]} - {sample[2]}...")
        
        source_conn.close()
        target_conn.close()
    
    # Check Revelation 22:21 specifically
    print("\nChecking Revelation 22:21:")
    print("-" * 80)
    
    source_conn = sqlite3.connect(str(source_db))
    source_cur = source_conn.cursor()
    source_cur.execute("""
        SELECT book_number, chapter, verse, text
        FROM verses
        WHERE book_number = 750 AND chapter = 22 AND verse = 21
    """)
    
    rev_verse = source_cur.fetchone()
    if rev_verse:
        print(f"Found in source: Book {rev_verse[0]}, {rev_verse[1]}:{rev_verse[2]} - {rev_verse[3]}")
    else:
        print("Not found in source database")
    
    source_conn.close()
    
    # Check in target
    target_conn = sqlite3.connect(str(target_db))
    target_cur = target_conn.cursor()
    target_cur.execute("""
        SELECT book, chapter, verse, text
        FROM t_niv2011
        WHERE book = 66 AND chapter = 22 AND verse = 21
    """)
    
    rev_verse_target = target_cur.fetchone()
    if rev_verse_target:
        print(f"Found in target: Book {rev_verse_target[0]}, {rev_verse_target[1]}:{rev_verse_target[2]} - {rev_verse_target[3]}")
    else:
        print("Not found in target database")
    
    target_conn.close()

if __name__ == "__main__":
    main()
