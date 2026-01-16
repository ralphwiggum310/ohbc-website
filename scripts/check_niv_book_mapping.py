import sqlite3
from pathlib import Path

def main():
    db_path = Path(__file__).parent.parent / "data" / "bible" / "NIV'11.SQLite3"
    
    if not db_path.exists():
        print(f"Error: Database not found at {db_path}")
        return
    
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    # Get all book numbers and their verse counts
    cursor.execute("""
        SELECT book_number, COUNT(*) as count
        FROM verses
        GROUP BY book_number
        ORDER BY book_number
    """)
    
    books = cursor.fetchall()
    print(f"Found {len(books)} distinct book numbers in the NIV database")
    print("-" * 80)
    
    # Print book numbers and sample verses
    for book_num, count in books:
        # Get a sample verse
        cursor.execute("""
            SELECT chapter, verse, substr(text, 1, 50) as sample
            FROM verses
            WHERE book_number = ?
            ORDER BY chapter, verse
            LIMIT 1
        """, (book_num,))
        
        sample = cursor.fetchone()
        if sample:
            chapter, verse, text = sample
            print(f"Book {book_num:3d}: {count:4,} verses | {chapter:2}:{verse:3} - {text}...")
        else:
            print(f"Book {book_num:3d}: {count:4,} verses | No sample available")
    
    conn.close()

if __name__ == "__main__":
    main()
