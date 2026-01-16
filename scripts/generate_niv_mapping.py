import sqlite3
import json
from pathlib import Path

def get_book_names(db_path):
    """Extract book names and their corresponding numbers from the database."""
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    # Check for a books table with names
    cursor.execute("""
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name IN ('books', 'books_all')
    """)
    book_tables = [row[0] for row in cursor.fetchall()]
    
    book_mapping = {}
    
    for table in book_tables:
        cursor.execute(f"PRAGMA table_info({table})")
        columns = [col[1].lower() for col in cursor.fetchall()]
        
        if 'book_number' in columns and 'name' in columns:
            cursor.execute(f"SELECT book_number, name FROM {table}")
            for book_num, name in cursor.fetchall():
                if book_num not in book_mapping:
                    book_mapping[book_num] = name
    
    # If we didn't find book names, try to infer them from verses
    if not book_mapping:
        cursor.execute("""
            SELECT DISTINCT book_number, 
                   MIN(chapter) as min_chapter, 
                   MAX(chapter) as max_chapter,
                   COUNT(*) as verse_count
            FROM verses
            GROUP BY book_number
            ORDER BY book_number
        """)
        
        # Common Bible book names in order
        standard_books = [
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
        
        for i, (book_num, min_ch, max_ch, count) in enumerate(cursor.fetchall()):
            if i < len(standard_books):
                book_mapping[book_num] = standard_books[i]
            else:
                book_mapping[book_num] = f"Unknown_Book_{book_num}"
    
    conn.close()
    return book_mapping

def analyze_verse_distribution(db_path, book_mapping):
    """Analyze verse distribution across books and chapters."""
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    analysis = {}
    
    for book_num, book_name in book_mapping.items():
        cursor.execute("""
            SELECT chapter, COUNT(*) as verse_count
            FROM verses
            WHERE book_number = ?
            GROUP BY chapter
            ORDER BY chapter
        """, (book_num,))
        
        chapters = cursor.fetchall()
        if not chapters:
            continue
            
        analysis[book_num] = {
            'name': book_name,
            'chapter_count': len(chapters),
            'verse_count': sum(ch[1] for ch in chapters),
            'chapters': {}
        }
        
        for chapter, verse_count in chapters:
            # Get first and last verse numbers
            cursor.execute("""
                SELECT MIN(verse), MAX(verse)
                FROM verses
                WHERE book_number = ? AND chapter = ?
            """, (book_num, chapter))
            
            min_verse, max_verse = cursor.fetchone()
            
            # Get sample verses
            cursor.execute("""
                SELECT verse, text
                FROM verses
                WHERE book_number = ? AND chapter = ?
                ORDER BY verse
                LIMIT 1
            """, (book_num, chapter))
            
            sample = cursor.fetchone()
            sample_verse = f"{sample[0]}: {sample[1][:50]}..." if sample else "No verses found"
            
            analysis[book_num]['chapters'][chapter] = {
                'verse_count': verse_count,
                'verse_range': (min_verse, max_verse),
                'sample_verse': sample_verse
            }
    
    conn.close()
    return analysis

def main():
    # Path to the source database
    db_path = Path(__file__).parent.parent / "data" / "bible" / "NIV'11.SQLite3"
    
    if not db_path.exists():
        print(f"Error: Database not found at {db_path}")
        return
    
    print(f"Analyzing NIV 2011 database at: {db_path}")
    
    # Get book mapping
    print("\nExtracting book names and numbers...")
    book_mapping = get_book_names(db_path)
    
    print(f"\nFound {len(book_mapping)} books in the database:")
    for book_num, name in sorted(book_mapping.items()):
        print(f"  {book_num:3d}: {name}")
    
    # Analyze verse distribution
    print("\nAnalyzing verse distribution...")
    analysis = analyze_verse_distribution(db_path, book_mapping)
    
    # Save analysis to a JSON file
    output_file = Path(__file__).parent.parent / "data" / "bible" / "niv2011_analysis.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(analysis, f, indent=2)
    
    print(f"\nAnalysis saved to: {output_file}")
    
    # Print a summary
    print("\nBook Summary:")
    print("-" * 80)
    print(f"{'Book #':<5} {'Name':<20} {'Chapters':<10} {'Verses':<10}")
    print("-" * 80)
    
    total_verses = 0
    for book_num, data in sorted(analysis.items()):
        print(f"{book_num:<5} {data['name']:<20} {data['chapter_count']:<10} {data['verse_count']:<10,}")
        total_verses += data['verse_count']
    
    print("-" * 80)
    print(f"{'Total':<5} {'':<20} {'':<10} {total_verses:<10,}")

if __name__ == "__main__":
    main()
