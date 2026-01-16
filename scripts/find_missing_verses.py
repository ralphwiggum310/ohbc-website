import sqlite3
from pathlib import Path

def get_verse_set(db_path, query, params=()):
    """Execute a query and return a set of (book, chapter, verse) tuples."""
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    cursor.execute(query, params)
    return {tuple(row) for row in cursor.fetchall()}

def main():
    # Paths
    base_dir = Path(__file__).parent.parent
    source_db = base_dir / "data" / "bible" / "NIV'11.SQLite3"
    target_db = base_dir / "data" / "bible" / "bibles.db"
    
    # Query to get all verses from source
    source_query = """
    SELECT book_number, chapter, verse
    FROM verses
    ORDER BY book_number, chapter, verse
    """
    
    # Query to get all verses from target
    target_query = """
    SELECT book, chapter, verse
    FROM t_niv2011
    ORDER BY book, chapter, verse
    """
    
    # Get verse sets from both databases
    print("Fetching verses from source database...")
    source_verses = get_verse_set(source_db, source_query)
    print(f"Found {len(source_verses):,} verses in source database")
    
    print("\nFetching verses from target database...")
    target_verses = get_verse_set(target_db, target_query)
    print(f"Found {len(target_verses):,} verses in target database")
    
    # Find missing verses
    missing_verses = source_verses - target_verses
    print(f"\nFound {len(missing_verses):,} missing verses")
    
    # Group missing verses by book and chapter
    missing_by_book = {}
    for book, chapter, verse in sorted(missing_verses):
        if book not in missing_by_book:
            missing_by_book[book] = {}
        if chapter not in missing_by_book[book]:
            missing_by_book[book][chapter] = []
        missing_by_book[book][chapter].append(verse)
    
    # Print summary by book
    print("\nMissing verses by book:")
    print("-" * 60)
    for book in sorted(missing_by_book.keys()):
        chapter_count = len(missing_by_book[book])
        verse_count = sum(len(v) for v in missing_by_book[book].values())
        print(f"Book {book}: {verse_count} verses across {chapter_count} chapters")
    
    # Print details for the first few missing verses
    print("\nSample of missing verses:")
    print("-" * 60)
    sample_count = 0
    for book in sorted(missing_by_book.keys()):
        for chapter in sorted(missing_by_book[book].keys()):
            verses = sorted(missing_by_book[book][chapter])
            print(f"Book {book}, Chapter {chapter}, Verses: {verses[:10]}{'...' if len(verses) > 10 else ''}")
            sample_count += 1
            if sample_count >= 5:  # Limit to first 5 chapters for brevity
                break
        if sample_count >= 5:
            break
    
    # Check if Revelation 22:21 is in the source
    print("\nChecking for specific verses:")
    print("-" * 60)
    
    # Book number for Revelation is 750 based on our mapping
    rev_query = """
    SELECT book_number, chapter, verse, substr(text, 1, 100) as sample
    FROM verses
    WHERE book_number = 750 AND chapter = 22 AND verse = 21
    """
    
    conn = sqlite3.connect(str(source_db))
    cursor = conn.cursor()
    cursor.execute(rev_query)
    result = cursor.fetchone()
    
    if result:
        book, chapter, verse, sample = result
        print(f"✅ Revelation 22:21 found in source: {sample}...")
    else:
        print("❌ Revelation 22:21 not found in source database")
    
    # Check John 3:16
    john_query = """
    SELECT book_number, chapter, verse, substr(text, 1, 100) as sample
    FROM verses
    WHERE book_number = 520 AND chapter = 3 AND verse = 16
    """
    
    cursor.execute(john_query)
    result = cursor.fetchone()
    
    if result:
        book, chapter, verse, sample = result
        print(f"✅ John 3:16 found in source: {sample}...")
    else:
        print("❌ John 3:16 not found in source database")
    
    conn.close()

if __name__ == "__main__":
    main()
