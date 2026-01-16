import sqlite3
from pathlib import Path

def get_book_info(db_path):
    """Get detailed information about books in the NIV database."""
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    # Get all book numbers and their verse counts
    cursor.execute("""
        SELECT book_number, COUNT(*) as verse_count,
               MIN(chapter) as min_chapter, MAX(chapter) as max_chapter,
               MIN(verse) as min_verse, MAX(verse) as max_verse
        FROM verses
        GROUP BY book_number
        ORDER BY book_number
    """)
    
    books = []
    for row in cursor.fetchall():
        book_num = row[0]
        # Get a sample verse
        cursor.execute("""
            SELECT chapter, verse, substr(text, 1, 50) as sample
            FROM verses
            WHERE book_number = ?
            ORDER BY chapter, verse
            LIMIT 1
        """, (book_num,))
        sample = cursor.fetchone()
        
        books.append({
            'book_number': book_num,
            'verse_count': row[1],
            'chapters': f"{row[2]}-{row[3]}",
            'verses_range': f"{row[4]}-{row[5]}",
            'sample': f"{sample[0]}:{sample[1]} - {sample[2]}..." if sample else "No sample"
        })
    
    conn.close()
    return books

def main():
    db_path = Path(__file__).parent.parent / "data" / "bible" / "NIV'11.SQLite3"
    
    if not db_path.exists():
        print(f"Error: Database not found at {db_path}")
        return
    
    print(f"Analyzing NIV database at: {db_path}")
    print("-" * 80)
    
    # Get book information
    books = get_book_info(db_path)
    
    # Print summary
    print(f"Found {len(books)} distinct book numbers in the database")
    print(f"Total verses: {sum(book['verse_count'] for book in books):,}")
    
    # Print detailed book information
    print("\nBook details:")
    print("-" * 80)
    print(f"{'Book #':<8} {'Verses':<8} {'Chapters':<12} {'Verse Range':<15} Sample")
    print("-" * 80)
    
    for book in sorted(books, key=lambda x: x['book_number']):
        print(f"{book['book_number']:<8} {book['verse_count']:<8,} "
              f"{book['chapters']:<12} {book['verses_range']:<15} {book['sample']}")
    
    # Check for standard book numbers (1-66)
    standard_books = set(range(1, 67))  # 1-66
    present_books = {book['book_number'] for book in books}
    missing_standard = standard_books - present_books
    
    print("\nAnalysis:")
    print("-" * 80)
    if missing_standard:
        print(f"Missing standard book numbers: {sorted(missing_standard)}")
    else:
        print("All standard book numbers (1-66) are present")
    
    # Check for non-standard book numbers
    non_standard = present_books - standard_books
    if non_standard:
        print(f"Non-standard book numbers found: {sorted(non_standard)}")
    
    # Check for potential split books (same book number appearing multiple times)
    book_counts = {}
    for book in books:
        book_num = book['book_number']
        if book_num in book_counts:
            book_counts[book_num] += 1
        else:
            book_counts[book_num] = 1
    
    split_books = {num: count for num, count in book_counts.items() if count > 1}
    if split_books:
        print("\nPotential split books (same book number appears in multiple ranges):")
        for book_num, count in sorted(split_books.items()):
            print(f"  - Book {book_num}: appears in {count} separate ranges")

if __name__ == "__main__":
    main()
