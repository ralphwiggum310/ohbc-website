import sqlite3
from pathlib import Path
import json

def get_book_samples(db_path, book_nums):
    """Get sample verses for the given book numbers."""
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    samples = {}
    for book_num in book_nums:
        cursor.execute("""
            SELECT book_number, chapter, verse, text
            FROM verses
            WHERE book_number = ?
            ORDER BY chapter, verse
            LIMIT 2  -- Get first and a middle verse
        """, (book_num,))
        
        verses = cursor.fetchall()
        if verses:
            samples[book_num] = []
            for verse in verses:
                book_num, chapter, verse_num, text = verse
                samples[book_num].append({
                    'reference': f"{chapter}:{verse_num}",
                    'text': text[:150] + ('...' if len(text) > 150 else '')
                })
    
    conn.close()
    return samples

def main():
    db_path = Path(__file__).parent.parent / "data" / "bible" / "NIV'11.SQLite3"
    output_file = Path(__file__).parent.parent / "data" / "bible" / "niv_book_mapping.json"
    
    if not db_path.exists():
        print(f"Error: Database not found at {db_path}")
        return
    
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    # Get all book numbers and their verse counts
    cursor.execute("""
        SELECT book_number, COUNT(*) as count,
               MIN(chapter) as min_chapter, MAX(chapter) as max_chapter,
               MIN(verse) as min_verse, MAX(verse) as max_verse
        FROM verses
        GROUP BY book_number
        ORDER BY book_number
    """)
    
    books = []
    for row in cursor.fetchall():
        book_num = row[0]
        books.append({
            'book_number': book_num,
            'verse_count': row[1],
            'chapter_range': (row[2], row[3]),
            'verse_range': (row[4], row[5])
        })
    
    # Get samples for all books
    book_nums = [book['book_number'] for book in books]
    samples = get_book_samples(db_path, book_nums)
    
    # Add samples to book info
    for book in books:
        book_num = book['book_number']
        if book_num in samples:
            book['samples'] = samples[book_num]
    
    # Save the report
    report = {
        'total_books': len(books),
        'total_verses': sum(book['verse_count'] for book in books),
        'books': books
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"Report generated: {output_file}")
    print(f"Total books: {len(books)}")
    print(f"Total verses: {sum(book['verse_count'] for book in books):,}")
    
    # Print a summary
    print("\nBook numbers and verse counts:")
    print("-" * 50)
    for book in sorted(books, key=lambda x: x['book_number']):
        print(f"Book {book['book_number']:3d}: {book['verse_count']:4,} verses | "
              f"Chapters {book['chapter_range'][0]}-{book['chapter_range'][1]} | "
              f"Verses {book['verse_range'][0]}-{book['verse_range'][1]}")
    
    conn.close()

if __name__ == "__main__":
    main()
