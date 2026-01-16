import sqlite3
from pathlib import Path

def main():
    # Path to the source database
    source_db = Path(__file__).parent.parent / "data" / "bible" / "NIV'11.SQLite3"
    
    # Connect to the source database
    conn = sqlite3.connect(str(source_db))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get all distinct book numbers and their counts
    cursor.execute("""
        SELECT book_number, COUNT(*) as verse_count,
               MIN(chapter) as min_chapter, MAX(chapter) as max_chapter,
               MIN(verse) as min_verse, MAX(verse) as max_verse
        FROM verses
        GROUP BY book_number
        ORDER BY book_number
    """)
    
    print("Detailed Book Analysis for NIV 2011 Database")
    print("=" * 80)
    print(f"{'Book #':<8} {'Verses':<8} {'Chapters':<12} {'Verses':<12} Sample Verse")
    print("-" * 80)
    
    # For each book, get more details
    for row in cursor.fetchall():
        book_num = row['book_number']
        
        # Get a sample verse from the beginning and end of the book
        cursor.execute("""
            SELECT chapter, verse, substr(text, 1, 50) as sample
            FROM verses
            WHERE book_number = ?
            ORDER BY chapter, verse
            LIMIT 1
        """, (book_num,))
        first_verse = cursor.fetchone()
        
        cursor.execute("""
            SELECT chapter, verse, substr(text, 1, 50) as sample
            FROM verses
            WHERE book_number = ?
            ORDER BY chapter DESC, verse DESC
            LIMIT 1
        """, (book_num,))
        last_verse = cursor.fetchone()
        
        # Print book info
        print(f"{book_num:<8} {row['verse_count']:<8} "
              f"{row['min_chapter']}-{row['max_chapter']:<10} "
              f"{row['min_verse']}-{row['max_verse']:<10} "
              f"First: {first_verse['chapter']}:{first_verse['verse']} "
              f'"{first_verse["sample"]}..."')
        
        print(f"{' ' * 29}Last:  {last_verse['chapter']}:{last_verse['verse']} "
              f'"{last_verse["sample"]}..."')
        
        # Print a separator between books
        print("-" * 80)
    
    # Get a list of all book numbers for reference
    cursor.execute("SELECT DISTINCT book_number FROM verses ORDER BY book_number")
    book_numbers = [row[0] for row in cursor.fetchall()]
    
    print("\nBook Numbers in Source Database:")
    print(", ".join(map(str, book_numbers)))
    
    conn.close()

if __name__ == "__main__":
    main()
