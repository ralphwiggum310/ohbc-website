import sqlite3
from pathlib import Path

def main():
    # Path to the source database
    db_path = Path(__file__).parent.parent / "data" / "bible" / "NIV'11.SQLite3"
    
    if not db_path.exists():
        print(f"Error: Database not found at {db_path}")
        return
    
    # Connect to the database
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    # Get table info
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    print("Tables in the database:")
    for table in tables:
        print(f"- {table[0]}")
    
    # Check the structure of the verses table
    print("\nStructure of 'verses' table:")
    cursor.execute("PRAGMA table_info(verses)")
    columns = cursor.fetchall()
    for col in columns:
        print(f"- {col[1]} ({col[2]})")
    
    # Get distinct book numbers and their counts
    print("\nBook numbers and verse counts in source database:")
    print("-" * 50)
    cursor.execute("""
        SELECT book_number, COUNT(*) as count, 
               MIN(chapter) as min_chapter, MAX(chapter) as max_chapter,
               MIN(verse) as min_verse, MAX(verse) as max_verse
        FROM verses
        GROUP BY book_number
        ORDER BY book_number
    """)
    
    books = cursor.fetchall()
    print(f"{'Book #':<10} {'Verses':<8} {'Chapters':<12} {'Verse Range':<15} First Verse")
    print("-" * 80)
    
    for book in books:
        book_num, count, min_ch, max_ch, min_v, max_v = book
        
        # Get first verse text
        cursor.execute("""
            SELECT text FROM verses 
            WHERE book_number = ? AND chapter = ? AND verse = ?
        """, (book_num, min_ch, min_v))
        
        first_verse = cursor.fetchone()
        first_verse_text = first_verse[0][:60] + "..." if first_verse and len(first_verse[0]) > 60 else (first_verse[0] if first_verse else "")
        
        print(f"{book_num:<10} {count:<8,} {f"{min_ch}-{max_ch}":<12} {f"{min_v}-{max_v}":<15} {first_verse_text}")
    
    # Check for any books that might be missing
    print("\nChecking for standard book numbers (1-66) in source:")
    print("-" * 50)
    
    # Get all book numbers in the database
    cursor.execute("SELECT DISTINCT book_number FROM verses ORDER BY book_number")
    source_books = {row[0] for row in cursor.fetchall()}
    
    # Check which standard book numbers are missing
    standard_books = set(range(1, 67))
    missing_standard = standard_books - source_books
    
    if missing_standard:
        print(f"Missing standard book numbers: {sorted(missing_standard)}")
    else:
        print("All standard book numbers (1-66) are present")
    
    # Check for non-standard book numbers
    non_standard = source_books - standard_books
    print(f"\nNon-standard book numbers: {sorted(non_standard)}")
    
    # For non-standard books, try to identify what they might be
    if non_standard:
        print("\nDetails of non-standard books:")
        print("-" * 50)
        
        for book_num in sorted(non_standard):
            # Get a sample verse
            cursor.execute("""
                SELECT book_number, chapter, verse, substr(text, 1, 100) as sample
                FROM verses
                WHERE book_number = ?
                ORDER BY chapter, verse
                LIMIT 1
            """, (book_num,))
            
            sample = cursor.fetchone()
            if sample:
                print(f"Book {book_num}: {sample[3]}...")
    
    conn.close()

if __name__ == "__main__":
    main()
