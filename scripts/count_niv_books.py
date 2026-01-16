import sqlite3
from pathlib import Path

def main():
    db_path = Path(__file__).parent.parent / "data" / "bible" / "NIV'11.SQLite3"
    
    if not db_path.exists():
        print(f"Error: Database not found at {db_path}")
        return
    
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    # Get total number of verses
    cursor.execute("SELECT COUNT(*) FROM verses")
    total_verses = cursor.fetchone()[0]
    
    # Get number of distinct books
    cursor.execute("SELECT COUNT(DISTINCT book_number) FROM verses")
    num_books = cursor.fetchone()[0]
    
    # Get book numbers and their verse counts
    cursor.execute("""
        SELECT book_number, COUNT(*) as count
        FROM verses
        GROUP BY book_number
        ORDER BY book_number
    """)
    
    print(f"NIV Database Analysis")
    print("=" * 50)
    print(f"Total verses: {total_verses:,}")
    print(f"Number of distinct book numbers: {num_books}")
    print("\nBook numbers and verse counts:")
    print("-" * 50)
    
    books = cursor.fetchall()
    for book_num, count in books:
        print(f"Book {book_num}: {count:,} verses")
    
    # Check for standard book numbers (1-66)
    standard_books = set(range(1, 67))
    present_books = {book[0] for book in books}
    missing_standard = standard_books - present_books
    
    print("\nMissing standard book numbers:")
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
