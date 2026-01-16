import sqlite3
import sys
from pathlib import Path

def main():
    # Path to the database
    db_path = Path(__file__).parent.parent / "data" / "bible" / "bibles.db"
    
    if not db_path.exists():
        print(f"Error: Database not found at {db_path}")
        return 1
    
    try:
        # Connect to the database
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Check if the table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='t_niv2011'")
        table_exists = cursor.fetchone()
        
        if not table_exists:
            print("Error: t_niv2011 table not found in the database")
            return 1
            
        print("t_niv2011 table exists. Verifying data access...")
        
        # Get verse counts by book
        cursor.execute("""
            SELECT book, COUNT(*) as verse_count
            FROM t_niv2011
            GROUP BY book
            ORDER BY book
        """)
        
        rows = cursor.fetchall()
        
        print("\nVerse counts by book in t_niv2011:")
        print("-" * 50)
        
        total_verses = 0
        for book_num, count in rows:
            print(f"Book {book_num:3d}: {count:5,} verses")
            total_verses += count
        
        print("-" * 50)
        print(f"Total books: {len(rows)}")
        print(f"Total verses: {total_verses:,}")
        
        # Test getting a specific verse (John 3:16)
        print("\nTesting specific verse retrieval (John 3:16):")
        cursor.execute("""
            SELECT book, chapter, verse, substr(text, 1, 100) as text_sample
            FROM t_niv2011 
            WHERE book = 43 AND chapter = 3 AND verse = 16
        """)
        
        verse = cursor.fetchone()
        
        if verse:
            book, chapter, verse_num, text_sample = verse
            print("\nFound John 3:16 in t_niv2011:")
            print(f"Book: {book}, Chapter: {chapter}, Verse: {verse_num}")
            print(f"Text: {text_sample}...")
        else:
            print("John 3:16 not found in t_niv2011")
        
        # Check for Revelation 22:21 which was previously missing
        print("\nChecking for Revelation 22:21:")
        cursor.execute("""
            SELECT book, chapter, verse, substr(text, 1, 100) as text_sample
            FROM t_niv2011 
            WHERE book = 66 AND chapter = 22 AND verse = 21
        """)
        
        verse = cursor.fetchone()
        
        if verse:
            book, chapter, verse_num, text_sample = verse
            print("\nFound Revelation 22:21 in t_niv2011:")
            print(f"Book: {book}, Chapter: {chapter}, Verse: {verse_num}")
            print(f"Text: {text_sample}...")
        else:
            print("Revelation 22:21 not found in t_niv2011")
        
        return 0
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return 1
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    sys.exit(main())
