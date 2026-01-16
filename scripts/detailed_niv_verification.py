import sqlite3
from pathlib import Path

def get_connection(db_path):
    """Create a database connection and return it."""
    return sqlite3.connect(str(db_path))

def get_books_in_database(conn):
    """Get a list of all books in the database with their verse counts."""
    cursor = conn.cursor()
    cursor.execute("""
        SELECT book_number, COUNT(*) as verse_count 
        FROM verses 
        GROUP BY book_number 
        ORDER BY book_number
    """)
    return {book: count for book, count in cursor.fetchall()}

def get_standard_book_names():
    """Return a mapping of standard book numbers to their names."""
    return {
        1: "Genesis", 2: "Exodus", 3: "Leviticus", 4: "Numbers", 5: "Deuteronomy",
        6: "Joshua", 7: "Judges", 8: "Ruth", 9: "1 Samuel", 10: "2 Samuel",
        11: "1 Kings", 12: "2 Kings", 13: "1 Chronicles", 14: "2 Chronicles", 15: "Ezra",
        16: "Nehemiah", 17: "Esther", 18: "Job", 19: "Psalms", 20: "Proverbs",
        21: "Ecclesiastes", 22: "Song of Solomon", 23: "Isaiah", 24: "Jeremiah",
        25: "Lamentations", 26: "Ezekiel", 27: "Daniel", 28: "Hosea", 29: "Joel",
        30: "Amos", 31: "Obadiah", 32: "Jonah", 33: "Micah", 34: "Nahum",
        35: "Habakkuk", 36: "Zephaniah", 37: "Haggai", 38: "Zechariah", 39: "Malachi",
        40: "Matthew", 41: "Mark", 42: "Luke", 43: "John", 44: "Acts",
        45: "Romans", 46: "1 Corinthians", 47: "2 Corinthians", 48: "Galatians",
        49: "Ephesians", 50: "Philippians", 51: "Colossians", 52: "1 Thessalonians",
        53: "2 Thessalonians", 54: "1 Timothy", 55: "2 Timothy", 56: "Titus",
        57: "Philemon", 58: "Hebrews", 59: "James", 60: "1 Peter", 61: "2 Peter",
        62: "1 John", 63: "2 John", 64: "3 John", 65: "Jude", 66: "Revelation"
    }

def main():
    # Paths
    base_dir = Path(__file__).parent.parent
    source_db = base_dir / "data" / "bible" / "NIV'11.SQLite3"
    target_db = base_dir / "data" / "bible" / "bibles.db"
    
    # Connect to databases
    source_conn = get_connection(source_db)
    target_conn = get_connection(target_db)
    
    # Get book names
    book_names = get_standard_book_names()
    
    # Get source books
    source_books = get_books_in_database(source_conn)
    print(f"Found {len(source_books)} unique book numbers in source database")
    
    # Get target books
    target_books = {}
    cursor = target_conn.cursor()
    cursor.execute("SELECT book, COUNT(*) FROM t_niv2011 GROUP BY book")
    for book, count in cursor.fetchall():
        target_books[book] = count
    
    print(f"Found {len(target_books)} unique books in target database\n")
    
    # Compare books
    print("Book Comparison:")
    print("-" * 80)
    print(f"{'Book #':<8} {'Book Name':<20} {'Source Verses':<15} {'Target Verses':<15} {'Status'}")
    print("-" * 80)
    
    all_books = set(source_books.keys()).union(set(target_books.keys()))
    missing_in_target = set()
    
    for book_num in sorted(all_books):
        source_count = source_books.get(book_num, 0)
        target_count = target_books.get(book_num, 0)
        
        if book_num in book_names:
            book_name = book_names[book_num]
        else:
            book_name = f"Unknown ({book_num})"
        
        if source_count == 0 and target_count > 0:
            status = "⚠️  Extra in target"
        elif source_count > 0 and target_count == 0:
            status = "❌ Missing in target"
            missing_in_target.add(book_num)
        elif source_count != target_count:
            status = f"⚠️  Count mismatch ({source_count} vs {target_count})"
        else:
            status = "✅ OK"
        
        print(f"{book_num:<8} {book_name:<20} {source_count:<15,} {target_count:<15,} {status}")
    
    # Check for missing books in target
    if missing_in_target:
        print("\nMissing Books in Target:")
        for book_num in sorted(missing_in_target):
            if book_num in book_names:
                print(f"- {book_names[book_num]} ({book_num})")
            else:
                print(f"- Unknown book number: {book_num}")
    
    # Check sample verses
    print("\nSample Verse Verification:")
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
    
    # Close connections
    source_conn.close()
    target_conn.close()

if __name__ == "__main__":
    main()
