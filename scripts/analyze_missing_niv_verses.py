import sqlite3
import json
from pathlib import Path

def get_verses(db_path, query, params=()):
    """Execute a query and return the results as a list of dictionaries."""
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute(query, params)
    results = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return results

def main():
    # Paths
    base_dir = Path(__file__).parent.parent
    source_db = base_dir / "data" / "bible" / "NIV'11.SQLite3"
    target_db = base_dir / "data" / "bible" / "bibles.db"
    
    # Get all book numbers from source
    source_books = get_verses(
        source_db,
        "SELECT DISTINCT book_number FROM verses ORDER BY book_number"
    )
    source_book_numbers = {book['book_number'] for book in source_books}
    
    # Get all book numbers from target
    target_books = get_verses(
        target_db,
        "SELECT DISTINCT book FROM t_niv2011 ORDER BY book"
    )
    target_book_numbers = {book['book'] for book in target_books}
    
    # Find missing books
    missing_books = source_book_numbers - target_book_numbers
    
    print(f"Books in source: {len(source_book_numbers)}")
    print(f"Books in target: {len(target_book_numbers)}")
    print(f"Missing books: {sorted(missing_books) if missing_books else 'None'}")
    
    # For each missing book, show details
    if missing_books:
        print("\nDetails of missing books:")
        print("-" * 80)
        
        for book_num in sorted(missing_books):
            # Get book info from source
            book_info = get_verses(
                source_db,
                """
                SELECT book_number, MIN(chapter) as min_chapter, MAX(chapter) as max_chapter,
                       MIN(verse) as min_verse, MAX(verse) as max_verse, COUNT(*) as verse_count
                FROM verses
                WHERE book_number = ?
                GROUP BY book_number
                """,
                (book_num,)
            )
            
            if book_info:
                info = book_info[0]
                print(f"Book {info['book_number']}:")
                print(f"  - Chapters: {info['min_chapter']}-{info['max_chapter']}")
                print(f"  - Verses: {info['min_verse']}-{info['max_verse']}")
                print(f"  - Total verses: {info['verse_count']:,}")
                
                # Get a sample verse
                sample = get_verses(
                    source_db,
                    """
                    SELECT chapter, verse, substr(text, 1, 100) as text_sample
                    FROM verses
                    WHERE book_number = ?
                    ORDER BY chapter, verse
                    LIMIT 1
                    """,
                    (book_num,)
                )
                
                if sample:
                    sample = sample[0]
                    print(f"  - Sample: {sample['chapter']}:{sample['verse']} - {sample['text_sample']}...")
                
                print()
    
    # Check for specific missing verses
    print("\nChecking for specific verses:")
    print("-" * 80)
    
    test_verses = [
        (66, 22, 21),  # Revelation 22:21
        (20, 1, 1),    # Exodus 1:1
        (65, 1, 1),    # Jude 1:1
        (64, 1, 1),    # 3 John 1:1
        (63, 1, 1),    # 2 John 1:1
        (62, 1, 1),    # 1 John 1:1
        (61, 1, 1),    # 2 Peter 1:1
        (60, 1, 1),    # 1 Peter 1:1
        (59, 1, 1),    # James 1:1
        (58, 1, 1),    # Hebrews 1:1
        (57, 1, 1),    # Philemon 1:1
        (56, 1, 1),    # Titus 1:1
        (55, 1, 1),    # 2 Timothy 1:1
        (54, 1, 1),    # 1 Timothy 1:1
        (53, 1, 1),    # 2 Thessalonians 1:1
        (52, 1, 1),    # 1 Thessalonians 1:1
        (51, 1, 1),    # Colossians 1:1
        (50, 1, 1),    # Philippians 1:1
        (49, 1, 1),    # Ephesians 1:1
        (48, 1, 1),    # Galatians 1:1
        (47, 1, 1),    # 2 Corinthians 1:1
        (46, 1, 1),    # 1 Corinthians 1:1
        (45, 1, 1),    # Romans 1:1
        (44, 1, 1),    # Acts 1:1
        (43, 1, 1),    # John 1:1
        (42, 1, 1),    # Luke 1:1
        (41, 1, 1),    # Mark 1:1
        (40, 1, 1),    # Matthew 1:1
    ]
    
    for book, chapter, verse in test_verses:
        # Check in target
        target_verse = get_verses(
            target_db,
            "SELECT book, chapter, verse, substr(text, 1, 50) as text_sample FROM t_niv2011 WHERE book = ? AND chapter = ? AND verse = ?",
            (book, chapter, verse)
        )
        
        if target_verse:
            status = "✅"
            verse_text = target_verse[0]['text_sample']
        else:
            # Check if it exists in source
            source_verse = get_verses(
                source_db,
                "SELECT book_number, chapter, verse, substr(text, 1, 50) as text_sample FROM verses WHERE book_number = ? AND chapter = ? AND verse = ?",
                (book, chapter, verse)
            )
            
            if source_verse:
                status = "❌ (missing in target)"
                verse_text = source_verse[0]['text_sample']
            else:
                status = "❌ (not in source)"
                verse_text = ""
        
        print(f"{status} Book {book:2d} {chapter:2d}:{verse:3d} - {verse_text}...")
    
    # Check verse counts by book
    print("\nVerse counts by book (target vs source):")
    print("-" * 80)
    print(f"{'Book':<6} {'Target':<8} {'Source':<8} {'Diff':<8} Status")
    print("-" * 80)
    
    all_book_numbers = sorted(source_book_numbers.union(target_book_numbers))
    
    for book_num in all_book_numbers:
        # Get count from target
        target_count = 0
        if book_num in target_book_numbers:
            target_count_result = get_verses(
                target_db,
                "SELECT COUNT(*) as count FROM t_niv2011 WHERE book = ?",
                (book_num,)
            )
            target_count = target_count_result[0]['count']
        
        # Get count from source
        source_count = 0
        if book_num in source_book_numbers:
            source_count_result = get_verses(
                source_db,
                "SELECT COUNT(*) as count FROM verses WHERE book_number = ?",
                (book_num,)
            )
            source_count = source_count_result[0]['count']
        
        diff = source_count - target_count
        status = "✅" if diff == 0 else f"❌ ({diff} missing)"
        
        print(f"{book_num:<6} {target_count:<8,} {source_count:<8,} {diff:<8} {status}")

if __name__ == "__main__":
    main()
