import sqlite3
import sys
from pathlib import Path

def verify_niv2011():
    """Verify the NIV 2011 data in bibles.db"""
    db_path = Path(__file__).parent.parent / "data" / "bible" / "bibles.db"
    
    if not db_path.exists():
        print(f"Error: Database not found at {db_path}")
        return 1
    
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Check if table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='t_niv2011'")
        if not cursor.fetchone():
            print("Error: Table 't_niv2011' not found in the database")
            return 1
        
        print("=== NIV 2011 Data Verification ===\n")
        
        # Get total count
        cursor.execute("SELECT COUNT(*) FROM t_niv2011")
        total_verses = cursor.fetchone()[0]
        print(f"1. Total verses: {total_verses:,}")
        
        # Get book count
        cursor.execute("SELECT COUNT(DISTINCT book) FROM t_niv2011")
        book_count = cursor.fetchone()[0]
        print(f"2. Number of books: {book_count}")
        
        # Check sample verses
        print("\n3. Sample verses:")
        samples = [
            (1, 1, 1, "Genesis 1:1"),
            (19, 23, 1, "Psalm 23:1"),
            (40, 1, 23, "Matthew 1:23"),
            (43, 3, 16, "John 3:16"),
            (66, 22, 21, "Revelation 22:21")
        ]
        
        for book, chapter, verse, ref in samples:
            cursor.execute(
                "SELECT text FROM t_niv2011 WHERE book = ? AND chapter = ? AND verse = ?",
                (book, chapter, verse)
            )
            result = cursor.fetchone()
            if result:
                text = result[0].replace('\n', ' ').strip()
                print(f"   - {ref}: {text[:80]}..." if len(text) > 80 else f"   - {ref}: {text}")
            else:
                print(f"   - ❌ {ref} not found")
        
        # Check for missing data
        print("\n4. Data quality checks:")
        
        checks = [
            ("book", "IS NULL OR book = 0"),
            ("chapter", "IS NULL OR chapter = 0"),
            ("verse", "IS NULL OR verse = 0"),
            ("text", "IS NULL OR text = ''")
        ]
        
        for field, condition in checks:
            cursor.execute(f"SELECT COUNT(*) FROM t_niv2011 WHERE {field} {condition}")
            count = cursor.fetchone()[0]
            print(f"   - Rows with invalid {field}: {count}")
        
        # Get verse counts by book
        print("\n5. Verse counts by book (first 5 books):")
        cursor.execute("""
            SELECT book, COUNT(*) as verse_count 
            FROM t_niv2011 
            GROUP BY book 
            ORDER BY book 
            LIMIT 5
        """)
        for book_num, count in cursor.fetchall():
            print(f"   - Book {book_num}: {count:,} verses")
        
        print("\n=== Verification Complete ===")
        
        if total_verses == 31102:
            print("\n✅ Data transfer verified successfully!")
        else:
            print(f"\n⚠️  Warning: Expected 31,102 verses but found {total_verses:,}")
        
        return 0
        
    except sqlite3.Error as e:
        print(f"\n❌ Database error: {e}")
        return 1
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    sys.exit(verify_niv2011())
