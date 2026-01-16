import sqlite3
import os
from pathlib import Path

def main():
    # Get the source database path
    source_db = Path(__file__).parent.parent / "data" / "bible" / "NIV'11.SQLite3"
    
    if not source_db.exists():
        print(f"Error: Source database not found at {source_db}")
        return
    
    print(f"Analyzing {source_db}...\n")
    
    # Connect to the source database
    conn = sqlite3.connect(str(source_db))
    cursor = conn.cursor()
    
    # Get all tables in the database
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    print(f"Tables in database: {[t[0] for t in tables]}")
    
    # Get the structure of the verses table
    cursor.execute("PRAGMA table_info(verses)")
    columns = cursor.fetchall()
    print("\nVerses table structure:")
    for col in columns:
        print(f"  {col[1]} ({col[2]})")
    
    # Get book statistics
    cursor.execute("""
        SELECT book_number, COUNT(*) as verse_count, 
               MIN(chapter) as min_chapter, MAX(chapter) as max_chapter,
               MIN(verse) as min_verse, MAX(verse) as max_verse
        FROM verses
        GROUP BY book_number
        ORDER BY book_number
    """)
    
    print("\nBook Statistics:")
    print("Book#  Verses  Ch (min-max)  Verse (min-max)")
    print("-" * 50)
    for row in cursor.fetchall():
        book_num, count, min_ch, max_ch, min_v, max_v = row
        print(f"{book_num:5d} {count:7d}   {min_ch:2d}-{max_ch:3d}      {min_v:3d}-{max_v:3d}")
    
    # Get sample verses from each book
    print("\nSample verses from each book:")
    print("-" * 50)
    cursor.execute("""
        SELECT book_number, MIN(rowid) as first_verse_id, MAX(rowid) as last_verse_id
        FROM verses
        GROUP BY book_number
        ORDER BY book_number
    """)
    
    for book_num, first_id, last_id in cursor.fetchall():
        # Get first verse
        cursor.execute("""
            SELECT book_number, chapter, verse, substr(text, 1, 50) as text_sample
            FROM verses
            WHERE rowid = ?
        """, (first_id,))
        first_verse = cursor.fetchone()
        
        # Get last verse
        cursor.execute("""
            SELECT book_number, chapter, verse, substr(text, 1, 50) as text_sample
            FROM verses
            WHERE rowid = ?
        """, (last_id,))
        last_verse = cursor.fetchone()
        
        print(f"\nBook {book_num}:")
        print(f"  First: {first_verse[1]}:{first_verse[2]} - {first_verse[3]}...")
        print(f"  Last:  {last_verse[1]}:{last_verse[2]} - {last_verse[3]}...")
    
    conn.close()

if __name__ == "__main__":
    main()
