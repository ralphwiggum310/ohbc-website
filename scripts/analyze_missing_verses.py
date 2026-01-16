import sqlite3
from pathlib import Path

def main():
    # Paths
    base_dir = Path(__file__).parent.parent
    source_db = base_dir / "data" / "bible" / "NIV'11.SQLite3"
    target_db = base_dir / "data" / "bible" / "bibles.db"
    
    # Connect to databases
    source_conn = sqlite3.connect(str(source_db))
    target_conn = sqlite3.connect(str(target_db))
    
    # Get all book numbers from source
    source_cur = source_conn.cursor()
    source_cur.execute("SELECT DISTINCT book_number FROM verses ORDER BY book_number")
    source_books = [row[0] for row in source_cur.fetchall()]
    
    print(f"Found {len(source_books)} distinct book numbers in source database:")
    print(", ".join(map(str, source_books)))
    
    # Check verse counts by book in source and target
    print("\nVerse counts by book (Source vs Target):")
    print("-" * 80)
    print(f"{'Book #':<8} {'Source Count':<12} {'Target Count':<12} 'Status'")
    print("-" * 80)
    
    total_source = 0
    total_target = 0
    
    for book in sorted(source_books):
        # Get count from source
        source_cur.execute(
            "SELECT COUNT(*) FROM verses WHERE book_number = ?", 
            (book,)
        )
        source_count = source_cur.fetchone()[0]
        total_source += source_count
        
        # Get count from target
        target_cur = target_conn.cursor()
        target_cur.execute(
            "SELECT COUNT(*) FROM t_niv2011 WHERE book = ?", 
            (book,)
        )
        target_count = target_cur.fetchone()[0]
        total_target += target_count
        
        status = "✅" if source_count == target_count else "❌"
        print(f"{book:<8} {source_count:<12} {target_count:<12} {status}")
    
    print("-" * 80)
    print(f"{'Total':<8} {total_source:<12} {total_target:<12} "
          f"{'' if total_source == total_target else '❌'}")
    
    # Check specific verses
    print("\nChecking specific verses:")
    print("-" * 80)
    
    # Revelation 22:21 (book 750 in source, 66 in target)
    source_cur.execute(
        "SELECT text FROM verses WHERE book_number = 750 AND chapter = 22 AND verse = 21"
    )
    rev_verse = source_cur.fetchone()
    print(f"Revelation 22:21 in source: {'Found' if rev_verse else 'Not found'}")
    
    target_cur = target_conn.cursor()
    target_cur.execute(
        "SELECT text FROM t_niv2011 WHERE book = 66 AND chapter = 22 AND verse = 21"
    )
    rev_verse_target = target_cur.fetchone()
    print(f"Revelation 22:21 in target: {'Found' if rev_verse_target else 'Not found'}")
    
    # Check for any issues with the transfer
    print("\nChecking for potential issues:")
    print("-" * 80)
    
    # Check for any books that might have been skipped
    target_cur.execute("SELECT DISTINCT book FROM t_niv2011 ORDER BY book")
    target_books = [row[0] for row in target_cur.fetchall()]
    
    print(f"Books in target: {len(target_books)} (should be 66)")
    
    # Check for any missing books
    expected_books = set(range(1, 67))  # 1-66
    missing_books = expected_books - set(target_books)
    
    if missing_books:
        print(f"Missing books: {sorted(missing_books)}")
    else:
        print("All expected books are present in the target database")
    
    # Check for any books with 0 verses
    target_cur.execute("""
        SELECT book, COUNT(*) as count 
        FROM t_niv2011 
        GROUP BY book 
        HAVING count = 0
        ORDER BY book
    """)
    
    empty_books = target_cur.fetchall()
    if empty_books:
        print("\nBooks with 0 verses in target:")
        for book, count in empty_books:
            print(f"- Book {book}: {count} verses")
    
    # Close connections
    source_conn.close()
    target_conn.close()

if __name__ == "__main__":
    main()
