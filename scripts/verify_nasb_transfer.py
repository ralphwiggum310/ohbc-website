import sqlite3
from pathlib import Path

def verify_transfer():
    # Database path
    db_path = Path(__file__).parent.parent / 'data' / 'bible' / 'bibles.db'
    
    if not db_path.exists():
        print(f"Error: Database not found at {db_path}")
        return
    
    try:
        # Connect to the database
        conn = sqlite3.connect(f'file:{db_path}?mode=ro', uri=True)
        cursor = conn.cursor()
        
        # Check if table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='t_nasb1995'")
        if not cursor.fetchone():
            print("Error: t_nasb1995 table not found in the database")
            return
        
        print("=== NASB 1995 Data Verification ===\n")
        
        # 1. Get total count of verses
        cursor.execute("SELECT COUNT(*) FROM t_nasb1995")
        total_verses = cursor.fetchone()[0]
        print(f"1. Total verses in t_nasb1995: {total_verses:,}")
        
        # 2. Get count of distinct books
        cursor.execute("SELECT COUNT(DISTINCT book) FROM t_nasb1995")
        book_count = cursor.fetchone()[0]
        print(f"2. Number of distinct books: {book_count}")
        
        # 3. Check first and last verses
        print("\n3. Sample verses:")
        
        # First verse (Genesis 1:1)
        cursor.execute("""
            SELECT book, chapter, verse, substr(text, 1, 50) || '...' as preview 
            FROM t_nasb1995 
            WHERE book = 1 AND chapter = 1 AND verse = 1
        """)
        first_verse = cursor.fetchone()
        print(f"   - Genesis 1:1: {first_verse[3] if first_verse else 'Not found'}")
        
        # Last verse (Revelation 22:21)
        cursor.execute("""
            SELECT book, chapter, verse, substr(text, 1, 50) || '...' as preview 
            FROM t_nasb1995 
            WHERE book = 66 AND chapter = 22 AND verse = 21
        """)
        last_verse = cursor.fetchone()
        print(f"   - Revelation 22:21: {last_verse[3] if last_verse else 'Not found'}")
        
        # 4. Check for any missing data
        print("\n4. Data Quality Checks:")
        
        # Check for NULL values in required fields
        for column in ['book', 'chapter', 'verse', 'text']:
            cursor.execute(f"""
                SELECT COUNT(*) 
                FROM t_nasb1995 
                WHERE {column} IS NULL OR {column} = ''
            """)
            null_count = cursor.fetchone()[0]
            print(f"   - Rows with missing '{column}': {null_count}")
        
        # 5. Get sample verses from different testaments
        print("\n5. Sample verses from different testaments:")
        
        # Sample from Torah (Genesis 1:1)
        cursor.execute("""
            SELECT 'Genesis ' || chapter || ':' || verse as reference, text
            FROM t_nasb1995 
            WHERE book = 1 AND chapter = 1 AND verse = 1
        """)
        sample = cursor.fetchone()
        print(f"   - {sample[0]}: {sample[1][:60]}..." if sample else "   - Genesis 1:1 not found")
        
        # Sample from Gospels (John 3:16)
        cursor.execute("""
            SELECT 'John ' || chapter || ':' || verse as reference, text
            FROM t_nasb1995 
            WHERE book = 43 AND chapter = 3 AND verse = 16
        """)
        sample = cursor.fetchone()
        print(f"   - {sample[0]}: {sample[1][:60]}..." if sample else "   - John 3:16 not found")
        
        # Sample from Epistles (Romans 8:28)
        cursor.execute("""
            SELECT 'Romans ' || chapter || ':' || verse as reference, text
            FROM t_nasb1995 
            WHERE book = 45 AND chapter = 8 AND verse = 28
        """)
        sample = cursor.fetchone()
        print(f"   - {sample[0]}: {sample[1][:60]}..." if sample else "   - Romans 8:28 not found")
        
        # 6. Check verse counts by book
        print("\n6. Verse counts by book (first 5 books):")
        cursor.execute("""
            SELECT book, COUNT(*) as verse_count 
            FROM t_nasb1995 
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
        
    except sqlite3.Error as e:
        print(f"\n❌ Database error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    verify_transfer()
