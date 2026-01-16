import sqlite3
from pathlib import Path

def cleanup_niv():
    """Remove the NIV table from the bibles.db database."""
    # Path to the database
    db_path = Path(__file__).parent.parent / "data" / "bible" / "bibles.db"
    
    if not db_path.exists():
        print(f"Error: Database not found at {db_path}")
        return
    
    try:
        # Connect to the database
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Check if the table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='t_niv2011'")
        if not cursor.fetchone():
            print("NIV table (t_niv2011) does not exist in the database.")
            return
        
        # Drop the table
        cursor.execute("DROP TABLE t_niv2011")
        conn.commit()
        print("✅ Successfully removed the NIV table (t_niv2011) from the database.")
        
    except sqlite3.Error as e:
        print(f"Error cleaning up NIV data: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    cleanup_niv()
