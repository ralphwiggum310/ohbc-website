import sqlite3
from pathlib import Path

def get_book_counts(db_path, query):
    """Execute a query and return a dictionary of book numbers to verse counts."""
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute(query)
    return {row['book']: row['count'] for row in cursor.fetchall()}

def main():
    # Paths
    base_dir = Path(__file__).parent.parent
    source_db = base_dir / "data" / "bible" / "NIV'11.SQLite3"
    target_db = base_dir / "data" / "bible" / "bibles.db"
    
    # Query to get book counts from source
    source_query = """
    SELECT book_number as book, COUNT(*) as count
    FROM verses
    GROUP BY book_number
    ORDER BY book_number
    """
    
    # Query to get book counts from target
    target_query = """
    SELECT book, COUNT(*) as count
    FROM t_niv2011
    GROUP BY book
    ORDER BY book
    """
    
    # Get counts from both databases
    source_counts = get_book_counts(source_db, source_query)
    target_counts = get_book_counts(target_db, target_query)
    
    # Book number to name mapping for better readability
    book_names = {
        1: "Genesis", 2: "Exodus", 3: "Leviticus", 4: "Numbers", 5: "Deuteronomy",
        6: "Joshua", 7: "Judges", 8: "Ruth", 9: "1 Samuel", 10: "2 Samuel",
        11: "1 Kings", 12: "2 Kings", 13: "1 Chronicles", 14: "2 Chronicles",
        15: "Ezra", 16: "Nehemiah", 17: "Esther", 18: "Job", 19: "Psalms",
        20: "Proverbs", 21: "Ecclesiastes", 22: "Song of Solomon", 23: "Isaiah",
        24: "Jeremiah", 25: "Lamentations", 26: "Ezekiel", 27: "Daniel",
        28: "Hosea", 29: "Joel", 30: "Amos", 31: "Obadiah", 32: "Jonah",
        33: "Micah", 34: "Nahum", 35: "Habakkuk", 36: "Zephaniah",
        37: "Haggai", 38: "Zechariah", 39: "Malachi", 40: "Matthew",
        41: "Mark", 42: "Luke", 43: "John", 44: "Acts", 45: "Romans",
        46: "1 Corinthians", 47: "2 Corinthians", 48: "Galatians",
        49: "Ephesians", 50: "Philippians", 51: "Colossians",
        52: "1 Thessalonians", 53: "2 Thessalonians", 54: "1 Timothy",
        55: "2 Timothy", 56: "Titus", 57: "Philemon", 58: "Hebrews",
        59: "James", 60: "1 Peter", 61: "2 Peter", 62: "1 John",
        63: "2 John", 64: "3 John", 65: "Jude", 66: "Revelation"
    }
    
    # Compare counts
    print("Missing or incomplete books:")
    print("-" * 60)
    print(f"{'Book #':<8} {'Book Name':<20} {'Source':<10} {'Target':<10} 'Status'")
    print("-" * 60)
    
    all_books = set(source_counts.keys()).union(set(target_counts.keys()))
    missing_books = []
    
    for book in sorted(all_books):
        source_count = source_counts.get(book, 0)
        target_count = target_counts.get(book, 0)
        book_name = book_names.get(book, f"Unknown ({book})")
        
        if book not in target_counts or target_count == 0:
            status = "❌ MISSING"
            missing_books.append(book)
        elif source_count != target_count:
            status = f"⚠️  INCOMPLETE ({target_count}/{source_count})"
        else:
            status = "✅ COMPLETE"
            
        print(f"{book:<8} {book_name:<20} {source_count:<10} {target_count:<10} {status}")
    
    # Print summary
    print("\nSummary:")
    print(f"- Total books in source: {len(source_counts)}")
    print(f"- Total books in target: {len(target_counts)}")
    print(f"- Missing books: {len(missing_books)} ({', '.join(str(b) for b in missing_books)})")
    
    # Print mapping for missing books
    if missing_books:
        print("\nMapping for missing books (add to transfer script):")
        for book in missing_books:
            print(f"    {book}: {book},  # {book_names.get(book, f'Unknown {book}')}")

if __name__ == "__main__":
    main()
