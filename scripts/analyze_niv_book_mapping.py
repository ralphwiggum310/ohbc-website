import sqlite3
from pathlib import Path

def get_book_samples(db_path, book_numbers):
    """Get sample verses for specific book numbers."""
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    for book_num in sorted(book_numbers):
        # Get a sample verse
        cursor.execute("""
            SELECT book_number, chapter, verse, substr(text, 1, 100) as sample
            FROM verses
            WHERE book_number = ?
            ORDER BY chapter, verse
            LIMIT 1
        """, (book_num,))
        
        result = cursor.fetchone()
        if result:
            book_num, chapter, verse, sample = result
            print(f"Book {book_num} (Chapter {chapter}, Verse {verse}): {sample}...")
    
    conn.close()

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
    
    # Group books by their first digit to identify patterns
    book_groups = {}
    for book_num, count in books:
        first_digit = str(book_num)[0]
        if first_digit not in book_groups:
            book_groups[first_digit] = []
        book_groups[first_digit].append((book_num, count))
    
    # Print book groups
    for digit in sorted(book_groups.keys()):
        group_books = book_groups[digit]
        print(f"\nBooks starting with {digit}:")
        print("-" * 50)
        for book_num, count in sorted(group_books):
            print(f"Book {book_num}: {count:,} verses")
    
    # Get sample verses for each group
    for digit in sorted(book_groups.keys()):
        group_books = book_groups[digit]
        sample_books = [book_num for book_num, _ in group_books]
        print(f"\nSample verses for books starting with {digit}:")
        print("-" * 50)
        get_book_samples(db_path, sample_books)
    
    # Check for standard book numbers (1-66)
    standard_books = set(range(1, 67))
    present_books = {book_num for book_num, _ in books}
    missing_standard = standard_books - present_books
    
    print("\nMissing standard book numbers (1-66):")
    print("-" * 50)
    if missing_standard:
        print(", ".join(map(str, sorted(missing_standard))))
    else:
        print("None")
    
    # Check for non-standard book numbers
    non_standard = present_books - standard_books
    print("\nNon-standard book numbers:")
    print("-" * 50)
    if non_standard:
        print(", ".join(map(str, sorted(non_standard))))
    else:
        print("None")
    
    conn.close()

if __name__ == "__main__":
    main()
