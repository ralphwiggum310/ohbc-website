import sqlite3
from pathlib import Path

def main():
    # Path to the source database
    source_db = Path(__file__).parent.parent / "data" / "bible" / "NIV'11.SQLite3"
    
    # Connect to the source database
    conn = sqlite3.connect(str(source_db))
    cursor = conn.cursor()
    
    # Get all distinct book numbers and their counts
    cursor.execute("""
        SELECT book_number, COUNT(*) as verse_count
        FROM verses
        GROUP BY book_number
        ORDER BY book_number
    """)
    
    print("Book numbers and verse counts in source database:")
    print("-" * 60)
    print(f"{'Book #':<10} {'Verse Count':<12} Sample Verse")
    print("-" * 60)
    
    # For each book, get a sample verse
    for book_num, count in cursor.fetchall():
        cursor.execute("""
            SELECT chapter, verse, substr(text, 1, 50) as sample
            FROM verses
            WHERE book_number = ?
            LIMIT 1
        """, (book_num,))
        
        chapter, verse, sample = cursor.fetchone()
        print(f"{book_num:<10} {count:<12} {book_num}:{chapter}:{verse} - {sample}...")
    
    conn.close()

if __name__ == "__main__":
    main()
