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
    
    # First, check if there's a books table with names
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%book%'")
    book_tables = cursor.fetchall()
    print("Book-related tables found:")
    for table in book_tables:
        print(f"- {table[0]}")
    
    # Check if we have a books table with names
    if 'books' in [t[0] for t in book_tables]:
        print("\nBooks in the database:")
        print("-" * 80)
        cursor.execute("SELECT * FROM books")
        books = cursor.fetchall()
        
        # Get column names
        cursor.execute("PRAGMA table_info(books)")
        columns = [col[1] for col in cursor.fetchall()]
        print(" | ".join(columns))
        print("-" * 80)
        
        for book in books:
            print(" | ".join(str(x) for x in book))
    
    # Get distinct book numbers and sample verses
    print("\nBook numbers and sample verses:")
    print("-" * 80)
    cursor.execute("""
        SELECT book_number, COUNT(*) as verse_count, 
               MIN(chapter) as min_chapter, MAX(chapter) as max_chapter,
               (SELECT text FROM verses WHERE book_number = v.book_number AND chapter = 1 AND verse = 1 LIMIT 1) as first_verse
        FROM verses v
        GROUP BY book_number
        ORDER BY book_number
    """)
    
    books = cursor.fetchall()
    print(f"{'Book #':<8} {'Verses':<8} {'Chapters':<12} First Verse")
    print("-" * 80)
    
    for book in books:
        book_num, count, min_ch, max_ch, first_verse = book
        first_verse = first_verse[:80] + "..." if first_verse and len(first_verse) > 80 else (first_verse or "")
        print(f"{book_num:<8} {count:<8,} {f"{min_ch}-{max_ch}":<12} {first_verse}")
    
    # Check for specific books we know should exist
    test_books = [1, 2, 19, 40, 43, 66]  # Genesis, Exodus, Psalms, Matthew, John, Revelation
    print("\nChecking specific books:")
    print("-" * 80)
    
    for book_num in test_books:
        cursor.execute("""
            SELECT book_number, COUNT(*) as count, 
                   MIN(chapter) as min_ch, MAX(chapter) as max_ch,
                   MIN(verse) as min_v, MAX(verse) as max_v
            FROM verses 
            WHERE book_number = ?
        """, (book_num,))
        
        result = cursor.fetchone()
        if result:
            print(f"Book {book_num}: {result[1]:,} verses, chapters {result[2]}-{result[3]}, verses {result[4]}-{result[5]}")
        else:
            print(f"Book {book_num}: Not found in database")
    
    conn.close()

if __name__ == "__main__":
    main()
