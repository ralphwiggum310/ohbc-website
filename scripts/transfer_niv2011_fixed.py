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
    
    # Drop the existing table if it exists
    cursor.execute("DROP TABLE IF EXISTS t_niv2011")
    
    # Create the table
    cursor.execute("""
    CREATE TABLE t_niv2011 (
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
    CREATE INDEX idx_niv2011_book_chapter_verse 
    ON t_niv2011 (book, chapter, verse)
    """)
    
    target_conn.commit()

def get_book_mapping():
    """Return a mapping from NIV book numbers to standard book numbers."""
    return {
        # Old Testament
        10: 1,     # Genesis
        20: 2,     # Exodus
        30: 3,     # Leviticus
        40: 4,     # Numbers
        50: 5,     # Deuteronomy
        60: 6,     # Joshua
        70: 7,     # Judges
        80: 8,     # Ruth
        90: 9,     # 1 Samuel
        100: 10,   # 2 Samuel
        110: 11,   # 1 Kings
        120: 12,   # 2 Kings
        130: 13,   # 1 Chronicles
        140: 14,   # 2 Chronicles
        150: 15,   # Ezra
        160: 16,   # Nehemiah
        170: 17,   # Alternative Esther (some versions)
        180: 17,   # Alternative Esther (some versions)
        190: 17,   # Esther
        200: 18,   # Job (alternative)
        210: 19,   # Psalms (alternative)
        220: 18,   # Job
        230: 19,   # Psalms
        240: 19,   # Psalms (continued)
        250: 19,   # Psalms (continued)
        260: 19,   # Psalms (continued)
        270: 19,   # Psalms (continued)
        280: 20,   # Proverbs
        290: 21,   # Ecclesiastes
        300: 22,   # Song of Solomon
        310: 23,   # Isaiah
        320: 23,   # Isaiah (continued)
        330: 24,   # Jeremiah
        340: 25,   # Lamentations
        350: 26,   # Ezekiel
        360: 27,   # Daniel
        370: 28,   # Hosea
        380: 29,   # Joel
        390: 30,   # Amos
        400: 31,   # Obadiah
        410: 32,   # Jonah
        420: 33,   # Micah
        430: 34,   # Nahum
        440: 35,   # Habakkuk
        450: 36,   # Zephaniah
        460: 37,   # Haggai
        470: 38,   # Zechariah
        480: 39,   # Malachi
        
        # New Testament
        490: 40,   # Matthew
        500: 41,   # Mark
        510: 42,   # Luke
        520: 43,   # John
        530: 44,   # Acts
        540: 45,   # Romans
        550: 46,   # 1 Corinthians
        560: 47,   # 2 Corinthians
        570: 48,   # Galatians
        580: 49,   # Ephesians
        590: 50,   # Philippians
        600: 51,   # Colossians
        610: 52,   # 1 Thessalonians
        620: 53,   # 2 Thessalonians
        630: 54,   # 1 Timothy
        640: 55,   # 2 Timothy
        650: 56,   # Titus
        660: 57,   # Philemon
        670: 58,   # Hebrews
        680: 59,   # James
        690: 60,   # 1 Peter
        700: 61,   # 2 Peter
        705: 62,   # Alternative 1 John (some versions)
        710: 62,   # 1 John
        715: 63,   # Alternative 2 John (some versions)
        720: 63,   # 2 John
        725: 64,   # Alternative 3 John (some versions)
        730: 64,   # 3 John
        735: 65,   # Alternative Jude (some versions)
        740: 65,   # Jude
        745: 66,   # Alternative Revelation (some versions)
        750: 66,   # Revelation
        755: 66    # Alternative Revelation (some versions)
    }

def transfer_data(source_conn, target_conn, batch_size=1000):
    """Transfer data from source to target database."""
    source_cur = source_conn.cursor()
    target_cur = target_conn.cursor()
    
    # Get book mapping
    book_mapping = get_book_mapping()
    
    # Get total count of verses to transfer
    source_cur.execute("SELECT COUNT(*) FROM verses")
    total_verses = source_cur.fetchone()[0]
    print(f"Found {total_verses:,} verses to transfer")
    
    # Get all verses with their book numbers
    source_cur.execute("SELECT book_number, chapter, verse, text FROM verses")
    
    # Process and insert verses in batches
    batch = []
    processed = 0
    skipped = 0
    
    print(f"Processing verses in batches of {batch_size}...")
    
    while True:
        rows = source_cur.fetchmany(batch_size)
        if not rows:
            break
            
        for book_num, chapter, verse, text in rows:
            # Map the book number
            if book_num in book_mapping:
                mapped_book = book_mapping[book_num]
                batch.append((mapped_book, chapter, verse, text))
            else:
                print(f"Warning: Book number {book_num} not in mapping, skipping...")
                skipped += 1
                continue
            
            # Insert batch when it reaches the batch size
            if len(batch) >= batch_size:
                target_cur.executemany(
                    """
                    INSERT OR IGNORE INTO t_niv2011 (book, chapter, verse, text)
                    VALUES (?, ?, ?, ?)
                    """,
                    batch
                )
                processed += len(batch)
                target_conn.commit()
                batch = []
                print(f"Processed {processed:,} of {total_verses:,} verses...")
    
    # Insert any remaining verses
    if batch:
        target_cur.executemany(
            """
            INSERT OR IGNORE INTO t_niv2011 (book, chapter, verse, text)
            VALUES (?, ?, ?, ?)
            """,
            batch
        )
        processed += len(batch)
        target_conn.commit()
    
    print(f"\n✅ Transfer complete!")
    print(f"- Processed: {processed:,} verses")
    print(f"- Skipped: {skipped:,} verses (unmapped book numbers)")
    
    # Verify the transfer
    target_cur.execute("SELECT COUNT(*) FROM t_niv2011")
    count = target_cur.fetchone()[0]
    print(f"- Total verses in target table: {count:,}")

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
        (2, 1, 1, "Exodus 1:1"),
        (19, 23, 1, "Psalm 23:1"),
        (40, 1, 1, "Matthew 1:1"),
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
            print(f"✅ {ref}: {text[:80]}..." if len(text) > 80 else f"✅ {ref}: {text}")
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
        print("\nStarting data transfer...")
        transfer_data(source_conn, target_conn)
        
        # Verify the transfer
        print("\nVerifying data...")
        verify_transfer(target_conn)
        
        print("\n✅ All done!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        return 1
    finally:
        if 'source_conn' in locals():
            source_conn.close()
        if 'target_conn' in locals():
            target_conn.close()
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
