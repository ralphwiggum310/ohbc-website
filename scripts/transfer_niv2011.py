import sqlite3
import os
import sys
from pathlib import Path

def get_db_paths():
    """Get paths for source and target databases."""
    base_dir = Path(__file__).parent.parent
    
    # Source database (NIV 2011)
    source_paths = [
        base_dir / "data" / "bible" / "NIV'11.SQLite3",
        base_dir / "Bible api" / "NIV" / "NIV'11.SQLite3"
    ]
    
    source_db = None
    for path in source_paths:
        if path.exists():
            source_db = path
            break
    
    if not source_db:
        raise FileNotFoundError("Could not find NIV'11.SQLite3 in expected locations")
    
    # Target database
    target_db = base_dir / "data" / "bible" / "bibles.db"
    
    return source_db, target_db

def create_target_table(target_conn):
    """Create the target table if it doesn't exist."""
    cursor = target_conn.cursor()
    
    # Create the table if it doesn't exist
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS t_niv2011 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book INTEGER NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER NOT NULL,
        text TEXT NOT NULL,
        UNIQUE(book, chapter, verse)
    )
    """)
    
    # Create indexes for faster lookups
    cursor.execute("""
    CREATE INDEX IF NOT EXISTS idx_niv2011_book_chapter_verse 
    ON t_niv2011 (book, chapter, verse)
    """)
    
    target_conn.commit()

def transfer_data(source_conn, target_conn, batch_size=1000):
    """Transfer data from source to target database."""
    source_cur = source_conn.cursor()
    target_cur = target_conn.cursor()
    
    # Clear existing data
    print("Clearing existing data from target table...")
    target_cur.execute("DELETE FROM t_niv2011")
    target_conn.commit()
    
    # Get total count of verses to transfer
    source_cur.execute("SELECT COUNT(*) FROM verses")
    total_verses = source_cur.fetchone()[0]
    print(f"Found {total_verses:,} verses to transfer")
    
    # First, get all verses and process book numbers in Python for better reliability
    print("Fetching all verses for processing...")
    
    # Get a list of all book numbers in the source database
    source_cur.execute("SELECT DISTINCT book_number FROM verses ORDER BY book_number")
    source_book_numbers = [row[0] for row in source_cur.fetchall()]
    print(f"Found {len(source_book_numbers)} distinct book numbers in source: {source_book_numbers}")
    
    # Get all verses
    source_cur.execute("SELECT book_number, chapter, verse, text FROM verses ORDER BY book_number, chapter, verse")
    all_verses = source_cur.fetchall()
    print(f"Found {len(all_verses):,} total verses in source database")
    
    # Define the mapping from NIV book numbers to standard book numbers
    # NIV uses book numbers in increments of 10 (10, 20, 30, etc.)
    # This maps them to standard 1-66 book numbers
    book_mapping = {
        # Old Testament
        10: 1,    # Genesis
        20: 2,    # Exodus
        30: 3,    # Leviticus
        40: 4,    # Numbers
        50: 5,    # Deuteronomy
        60: 6,    # Joshua
        70: 7,    # Judges
        80: 8,    # Ruth
        90: 9,    # 1 Samuel
        100: 10,  # 2 Samuel
        110: 11,  # 1 Kings
        120: 12,  # 2 Kings
        130: 13,  # 1 Chronicles
        140: 14,  # 2 Chronicles
        150: 15,  # Ezra
        160: 16,  # Nehemiah
        190: 17,  # Esther
        220: 18,  # Job
        
        # Psalms is split across multiple book numbers
        230: 19,  # Psalms 1-41
        240: 19,  # Psalms 42-72
        250: 19,  # Psalms 73-89
        260: 19,  # Psalms 90-106
        270: 19,  # Psalms 107-150
        
        280: 20,  # Proverbs
        290: 21,  # Ecclesiastes
        300: 22,  # Song of Solomon
        
        # Isaiah is split
        310: 23,  # Isaiah 1-33
        320: 23,  # Isaiah 34-66
        
        330: 24,  # Jeremiah
        340: 25,  # Lamentations
        350: 26,  # Ezekiel
        360: 27,  # Daniel
        370: 28,  # Hosea
        380: 29,  # Joel
        390: 30,  # Amos
        400: 31,  # Obadiah
        410: 32,  # Jonah
        420: 33,  # Micah
        430: 34,  # Nahum
        440: 35,  # Habakkuk
        450: 36,  # Zephaniah
        460: 37,  # Haggai
        470: 38,  # Zechariah
        480: 39,  # Malachi
        
        # New Testament
        490: 40,  # Matthew
        500: 41,  # Mark
        510: 42,  # Luke
        520: 43,  # John
        530: 44,  # Acts
        540: 45,  # Romans
        550: 46,  # 1 Corinthians
        560: 47,  # 2 Corinthians
        570: 48,  # Galatians
        580: 49,  # Ephesians
        590: 50,  # Philippians
        600: 51,  # Colossians
        610: 52,  # 1 Thessalonians
        620: 53,  # 2 Thessalonians
        630: 54,  # 1 Timothy
        640: 55,  # 2 Timothy
        650: 56,  # Titus
        660: 57,  # Philemon
        670: 58,  # Hebrews
        680: 59,  # James
        690: 60,  # 1 Peter
        700: 61,  # 2 Peter
        710: 62,  # 1 John
        720: 63,  # 2 John
        730: 64,  # 3 John
        740: 65,  # Jude
        750: 66,  # Revelation
        
        # Additional mappings based on analysis
        # Some books might have alternative numberings
        200: 18,  # Alternative for Job
        210: 19,  # Alternative for Psalms
        300: 22,  # Alternative for Song of Solomon
        310: 23,  # Alternative for Isaiah
        320: 23,  # Alternative for Isaiah (continued)
        400: 31,  # Alternative for Obadiah
        410: 32,  # Alternative for Jonah
        420: 33,  # Alternative for Micah
        430: 34,  # Alternative for Nahum
        440: 35,  # Alternative for Habakkuk
        450: 36,  # Alternative for Zephaniah
        460: 37,  # Alternative for Haggai
        470: 38,  # Alternative for Zechariah
        480: 39,  # Alternative for Malachi
         
        # Ensure all standard book numbers are covered
        750: 66,  # Revelation (ensure it's included)
        740: 65,  # Jude (ensure it's included)
        20: 2,    # Exodus (ensure it's included)
        
        # Add any other missing mappings based on analysis
        170: 15,  # Alternative for Ezra
        180: 16,  # Alternative for Nehemiah
        
        # Add more mappings as needed based on the analysis
        200: 18,  # Job alternative
        210: 19,  # Psalms alternative
        220: 18,  # Job alternative
        230: 19,  # Psalms 1-41
        240: 19,  # Psalms 42-72
        250: 19,  # Psalms 73-89
        260: 19,  # Psalms 90-106
        270: 19,  # Psalms 107-150
        280: 20,  # Proverbs
        290: 21,  # Ecclesiastes
        300: 22,  # Song of Solomon
        310: 23,  # Isaiah 1-33
        320: 23,  # Isaiah 34-66
        330: 24,  # Jeremiah
        340: 25,  # Lamentations
        350: 26,  # Ezekiel
        360: 27,  # Daniel
        370: 28,  # Hosea
        380: 29,  # Joel
        390: 30,  # Amos
        400: 31,  # Obadiah
        410: 32,  # Jonah
        420: 33,  # Micah
        430: 34,  # Nahum
        440: 35,  # Habakkuk
        450: 36,  # Zephaniah
        460: 37,  # Haggai
        470: 38,  # Zechariah
        480: 39,  # Malachi
        
        # New Testament (repeated to ensure coverage)
        490: 40,  # Matthew
        500: 41,  # Mark
        510: 42,  # Luke
        520: 43,  # John
        530: 44,  # Acts
        540: 45,  # Romans
        550: 46,  # 1 Corinthians
        560: 47,  # 2 Corinthians
        570: 48,  # Galatians
        580: 49,  # Ephesians
        590: 50,  # Philippians
        600: 51,  # Colossians
        610: 52,  # 1 Thessalonians
        620: 53,  # 2 Thessalonians
        630: 54,  # 1 Timothy
        640: 55,  # 2 Timothy
        650: 56,  # Titus
        660: 57,  # Philemon
        670: 58,  # Hebrews
        680: 59,  # James
        690: 60,  # 1 Peter
        700: 61,  # 2 Peter
        710: 62,  # 1 John
        720: 63,  # 2 John
        730: 64,  # 3 John
        740: 65,  # Jude
        750: 66   # Revelation
    }
    
    print(f"Processing {len(all_verses):,} verses...")
    processed_verses = []
    book_stats = {}
    
    for i, (book_num, chapter, verse, text) in enumerate(all_verses, 1):
        # Log progress
        if i % 1000 == 0 or i == len(all_verses):
            print(f"Processing verse {i:,} of {len(all_verses):,}...")
        
        # Map book numbers using our mapping
        if book_num in book_mapping:
            mapped_book = book_mapping[book_num]
            book_type = "NT" if mapped_book >= 40 else "OT"
        else:
            print(f"Warning: Book number {book_num} not found in mapping, skipping...")
            continue
        
        # Log the first occurrence of each book number
        if book_num not in book_stats:
            book_stats[book_num] = {
                'mapped_to': mapped_book,
                'count': 0,
                'first_verse': (chapter, verse, text[:50] + '...' if len(text) > 50 else text)
            }
            print(f"First occurrence of book {book_num} (mapped to {mapped_book}): "
                  f"chapter {chapter}, verse {verse}, text: {book_stats[book_num]['first_verse'][2]}")
        
        book_stats[book_num]['count'] += 1
            
        processed_verses.append((mapped_book, chapter, verse, text))
    
    print(f"\nBook mapping summary:")
    for book_num, stats in sorted(book_stats.items()):
        first_verse = stats['first_verse']
        print(f"  Book {book_num:2d}: {stats['count']:5,} verses, first verse: {first_verse[0]}:{first_verse[1]} {first_verse[2]}")
    
    print(f"\nMapped {len(processed_verses):,} verses to standard book numbers")
    
    # Sort by book, chapter, verse
    processed_verses.sort(key=lambda x: (x[0], x[1], x[2]))
    
    # Log some sample mappings
    print("\nSample mapped verses:")
    for i in range(0, len(processed_verses), len(processed_verses)//5):
        book, chapter, verse, text = processed_verses[i]
        print(f"  Book {book}, {chapter}:{verse} - {text[:50]}..." if len(text) > 50 else f"  Book {book}, {chapter}:{verse} - {text}")
    
    # Remove any duplicate verses (just in case)
    unique_verses = {}
    for verse in processed_verses:
        key = (verse[0], verse[1], verse[2])  # (book, chapter, verse)
        if key not in unique_verses:
            unique_verses[key] = verse
    
    # Convert back to list
    unique_verses = list(unique_verses.values())
    print(f"Found {len(unique_verses):,} unique verses after deduplication")
    
    # Transfer data in batches
    batch_size = 1000
    total_verses = len(unique_verses)
    transferred = 0
    
    print(f"Starting data transfer in batches of {batch_size}...")
    
    for i in range(0, total_verses, batch_size):
        batch = unique_verses[i:i + batch_size]
        
        # Insert the batch into the target database
        target_cur.executemany(
            """
            INSERT INTO t_niv2011 (book, chapter, verse, text)
            VALUES (?, ?, ?, ?)
            """,
            batch
        )
        
        # Commit after each batch
        target_conn.commit()
        
        # Update progress
        transferred += len(batch)
        progress = transferred / total_verses
        
        if transferred % batch_size == 0 or transferred == total_verses:
            print(f"Transferred {transferred:,} of {total_verses:,} verses ({progress:.1%})")
            
            # Verify the current batch was inserted
            target_cur.execute("SELECT COUNT(*) FROM t_niv2011")
            current_count = target_cur.fetchone()[0]
            print(f"  - Current total in database: {current_count:,} verses")
    
    print(f"\n✅ Successfully transferred {transferred:,} verses")

def verify_transfer(target_conn):
    """Verify the data was transferred correctly."""
    cursor = target_conn.cursor()
    
    # Get total count
    cursor.execute("SELECT COUNT(*) FROM t_niv2011")
    count = cursor.fetchone()[0]
    print(f"\nVerification:")
    print(f"- Total verses in target table: {count:,}")
    
    # Check sample verses
    samples = [
        (1, 1, 1, "Genesis 1:1"),
        (19, 23, 1, "Psalm 23:1"),
        (40, 1, 23, "Matthew 1:23"),
        (43, 3, 16, "John 3:16"),
        (66, 22, 21, "Revelation 22:21")
    ]
    
    print("\nSample verses:")
    for book, chapter, verse, ref in samples:
        cursor.execute(
            "SELECT text FROM t_niv2011 WHERE book = ? AND chapter = ? AND verse = ?",
            (book, chapter, verse)
        )
        result = cursor.fetchone()
        if result:
            text = result[0].replace('\n', ' ').strip()
            print(f"{ref}: {text[:80]}..." if len(text) > 80 else f"{ref}: {text}")
        else:
            print(f"❌ {ref} not found")
    
    # Check for missing data
    cursor.execute("SELECT COUNT(*) FROM t_niv2011 WHERE text IS NULL OR text = ''")
    missing_text = cursor.fetchone()[0]
    print(f"\nData quality:")
    print(f"- Verses with missing text: {missing_text}")

def main():
    try:
        # Get database paths
        source_db, target_db = get_db_paths()
        print(f"Source database: {source_db}")
        print(f"Target database: {target_db}")
        
        # Connect to databases
        source_conn = sqlite3.connect(f'file:{source_db}?mode=ro', uri=True)
        target_conn = sqlite3.connect(target_db)
        
        # Set up the target table
        print("\nSetting up target table...")
        create_target_table(target_conn)
        
        # Transfer the data
        transfer_data(source_conn, target_conn)
        
        # Verify the transfer
        verify_transfer(target_conn)
        
    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        if 'target_conn' in locals():
            target_conn.rollback()
        return 1
    finally:
        # Clean up connections
        if 'source_conn' in locals():
            source_conn.close()
        if 'target_conn' in locals():
            target_conn.close()
    
    print("\n✅ NIV 2011 data transfer completed successfully!")
    return 0

if __name__ == "__main__":
    sys.exit(main())
