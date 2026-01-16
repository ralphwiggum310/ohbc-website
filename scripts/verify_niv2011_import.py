import sqlite3
from pathlib import Path

def main():
    # Path to the target database
    db_path = Path(__file__).parent.parent / "data" / "bible" / "bibles.db"
    
    if not db_path.exists():
        print(f"Error: Database not found at {db_path}")
        return
    
    # Connect to the database
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    # Check if the table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='t_niv2011'")
    if not cursor.fetchone():
        print("Error: Table 't_niv2011' does not exist in the database")
        return
    
    # Get total verse count
    cursor.execute("SELECT COUNT(*) FROM t_niv2011")
    total_verses = cursor.fetchone()[0]
    print(f"Total verses in t_niv2011: {total_verses:,}")
    
    # Get count of distinct books
    cursor.execute("SELECT COUNT(DISTINCT book) FROM t_niv2011")
    book_count = cursor.fetchone()[0]
    print(f"Number of distinct books: {book_count}")
    
    # Get verse count by book
    print("\nVerse count by book:")
    print("-" * 50)
    print(f"{'Book #':<8} {'Verses':<10} {'Book Name'}")
    print("-" * 50)
    
    # Standard book names in order
    book_names = [
        'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
        'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
        '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
        'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
        'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations',
        'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
        'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
        'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew',
        'Mark', 'Luke', 'John', 'Acts', 'Romans',
        '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians',
        'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy',
        'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter',
        '2 Peter', '1 John', '2 John', '3 John', 'Jude',
        'Revelation'
    ]
    
    cursor.execute("""
        SELECT book, COUNT(*) as verse_count 
        FROM t_niv2011 
        GROUP BY book 
        ORDER BY book
    """)
    
    for book_num, count in cursor.fetchall():
        book_name = book_names[book_num-1] if 1 <= book_num <= 66 else "Unknown"
        print(f"{book_num:<8} {count:<10,} {book_name}")
    
    # Check for missing books
    cursor.execute("SELECT DISTINCT book FROM t_niv2011")
    present_books = {row[0] for row in cursor.fetchall()}
    missing_books = [i+1 for i in range(66) if (i+1) not in present_books]
    
    if missing_books:
        print("\nMissing books:")
        for book_num in missing_books:
            print(f"- {book_names[book_num-1]} ({book_num})")
    else:
        print("\n✅ All 66 books are present!")
    
    # Check sample verses
    print("\nSample verses:")
    print("-" * 80)
    
    test_verses = [
        (1, 1, 1, "Genesis 1:1"),
        (2, 1, 1, "Exodus 1:1"),
        (19, 23, 1, "Psalm 23:1"),
        (40, 1, 1, "Matthew 1:1"),
        (43, 3, 16, "John 3:16"),
        (66, 22, 21, "Revelation 22:21")
    ]
    
    for book, chapter, verse, ref in test_verses:
        cursor.execute(
            "SELECT text FROM t_niv2011 WHERE book = ? AND chapter = ? AND verse = ?",
            (book, chapter, verse)
        )
        result = cursor.fetchone()
        if result:
            text = result[0].replace('\n', ' ').strip()
            print(f"✅ {ref}: {text[:80]}..." if len(text) > 80 else f"✅ {ref}: {text}")
        else:
            print(f"❌ {ref} not found")
    
    conn.close()

if __name__ == "__main__":
    main()
