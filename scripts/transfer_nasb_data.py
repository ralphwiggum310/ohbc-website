import sqlite3
import os
from pathlib import Path

def get_db_connection(db_path, read_only=True):
    """Create a database connection to the SQLite database."""
    try:
        if read_only:
            # For read-only access, we need to use URI format with mode=ro
            uri = f"file:{db_path}?mode=ro"
            return sqlite3.connect(uri, uri=True)
        return sqlite3.connect(db_path)
    except sqlite3.Error as e:
        print(f"Error connecting to database {db_path}: {e}")
        raise

def get_table_info(conn, table_name):
    """Get column information for a table."""
    try:
        cursor = conn.cursor()
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        print(f"\nStructure of {table_name}:")
        for col in columns:
            print(f"  {col[1]} ({col[2]})")
        return columns
    except sqlite3.Error as e:
        if "no such table" in str(e):
            print(f"Table {table_name} does not exist")
            return None
        print(f"Error getting table info for {table_name}: {e}")
        return None

def get_table_names(conn):
    """Get all table names in the database."""
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        return [row[0] for row in cursor.fetchall()]
    except sqlite3.Error as e:
        print(f"Error getting table names: {e}")
        return []

def transfer_data(source_conn, target_conn, source_table, target_table):
    """Transfer data from source table to target table."""
    try:
        source_cur = source_conn.cursor()
        target_cur = target_conn.cursor()
        
        # Define explicit column mapping
        column_mapping = {
            'book_id': 'book',  # Map book_id in source to book in target
            'chapter': 'chapter',
            'verse': 'verse',
            'text': 'text'
        }
        
        # Create source and target column lists
        source_cols = []
        target_cols = []
        
        # Get required target columns (NOT NULL columns must be included)
        target_cols_info = target_cur.execute(f"PRAGMA table_info({target_table})").fetchall()
        required_cols = [col[1] for col in target_cols_info if col[3] == 1]  # NOT NULL columns
        
        # Build source and target column lists based on mapping
        for src_col, tgt_col in column_mapping.items():
            # Only include if target column is required or exists in target
            if tgt_col in [col[1] for col in target_cols_info]:
                source_cols.append(src_col)
                target_cols.append(tgt_col)
        
        # Verify all required columns are covered
        missing_required = [col for col in required_cols if col not in target_cols]
        if missing_required:
            print(f"Warning: Missing required columns in mapping: {', '.join(missing_required)}")
        
        # Create column strings for SQL
        source_cols_str = ', '.join(f'"{col}"' for col in source_cols)
        target_cols_str = ', '.join(f'"{col}"' for col in target_cols)
        placeholders = ', '.join(['?'] * len(target_cols))
        
        # Get source data with explicit column selection
        source_query = f"SELECT {source_cols_str} FROM {source_table}"
        print(f"\nExecuting query: {source_query}")
        source_cur.execute(source_query)
        
        # Insert into target
        target_conn.execute("BEGIN TRANSACTION")
        try:
            # Clear existing data
            print(f"Clearing existing data from {target_table}...")
            target_cur.execute(f"DELETE FROM {target_table}")
            
            # Insert new data
            batch_size = 1000
            batch = []
            total_rows = 0
            
            print(f"Transferring data from {source_table} to {target_table}...")
            for row in source_cur:
                # Convert row to dict for easier manipulation
                row_dict = dict(zip(source_cols, row))
                
                # Map source columns to target columns
                mapped_values = []
                for src_col, tgt_col in zip(source_cols, target_cols):
                    if src_col in row_dict:
                        mapped_values.append(row_dict[src_col])
                    else:
                        # If source column doesn't exist, use a default value based on target type
                        col_info = next((c for c in target_cols_info if c[1] == tgt_col), None)
                        if col_info:
                            if 'INT' in col_info[2]:
                                mapped_values.append(0)  # Default integer
                            else:
                                mapped_values.append('')  # Default text
                
                batch.append(tuple(mapped_values))
                total_rows += 1
                
                if len(batch) >= batch_size:
                    insert_query = f"""
                        INSERT INTO {target_table} ({target_cols_str}) 
                        VALUES ({placeholders})
                    """.strip()
                    target_cur.executemany(insert_query, batch)
                    print(f"  Transferred {total_rows} rows...")
                    batch = []
            
            # Insert remaining rows
            if batch:
                insert_query = f"""
                    INSERT INTO {target_table} ({target_cols_str}) 
                    VALUES ({placeholders})
                """.strip()
                target_cur.executemany(insert_query, batch)
                print(f"  Transferred {total_rows} rows...")
            
            target_conn.commit()
            print(f"\nSuccessfully transferred {total_rows} rows from {source_table} to {target_table}")
            
            # Verify the transfer
            target_cur.execute(f"SELECT COUNT(*) as count FROM {target_table}")
            count = target_cur.fetchone()[0]
            print(f"Verification: {target_table} now contains {count} rows")
            
            if count == total_rows:
                print("Data transfer verified successfully!")
            else:
                print(f"Warning: Row count mismatch. Expected {total_rows}, found {count}")
                
            return True
            
        except sqlite3.Error as e:
            target_conn.rollback()
            print(f"Error during transfer: {e}")
            return False
            
    except sqlite3.Error as e:
        print(f"Error in transfer_data: {e}")
        return False

def main():
    # Set up paths
    base_dir = Path(__file__).parent.parent
    source_db = base_dir / 'data' / 'bible' / 'NASB.sqlite'
    target_db = base_dir / 'data' / 'bible' / 'bibles.db'
    
    if not source_db.exists():
        print(f"Source database not found: {source_db}")
        return
        
    if not target_db.exists():
        print(f"Target database not found: {target_db}")
        return
    
    print(f"Source database: {source_db}")
    print(f"Target database: {target_db}")
    
    # Connect to databases
    source_conn = get_db_connection(source_db, read_only=True)
    target_conn = get_db_connection(target_db, read_only=False)
    
    try:
        # Get source tables
        source_tables = get_table_names(source_conn)
        print("\nSource tables:", ", ".join(source_tables) if source_tables else "No tables found")
        
        if not source_tables:
            print("No tables found in source database")
            return
            
        # Get target tables (looking for t_nasb1995)
        target_tables = get_table_names(target_conn)
        print("\nTarget tables:", ", ".join(target_tables) if target_tables else "No tables found")
        
        target_table = 't_nasb1995'
        if target_table not in target_tables:
            print(f"\nTarget table '{target_table}' not found in target database")
            return
            
        # Show table structures
        print("\n=== Source Table Structure ===")
        
        # Look for a table with verse data (likely 'verse' table)
        source_table = 'verse' if 'verse' in source_tables else source_tables[0]
        print(f"\nExamining source table: {source_table}")
        source_cols = get_table_info(source_conn, source_table)
        
        # If the first table doesn't look right, try to find a better match
        if not any(col[1] in ['verse', 'text', 'chapter'] for col in source_cols) and len(source_tables) > 1:
            for table in source_tables:
                if table not in ['metadata', 'book']:  # Skip metadata and book tables
                    source_table = table
                    print(f"\nTrying different source table: {source_table}")
                    source_cols = get_table_info(source_conn, source_table)
                    if any(col[1] in ['verse', 'text', 'chapter'] for col in source_cols):
                        break
        
        print("\n=== Target Table Structure ===")
        target_cols = get_table_info(target_conn, target_table)
        
        if not source_cols or not target_cols:
            print("Cannot proceed with data transfer due to missing table information")
            return
            
        # Confirm before proceeding
        print("\nThis will transfer data from:")
        print(f"  Source: {source_table} in {source_db.name}")
        print(f"  Target: {target_table} in {target_db.name}")
        print("\nCommon columns:", 
              ", ".join(set(col[1] for col in source_cols) & set(col[1] for col in target_cols)))
              
        confirm = input("\nDo you want to proceed with the transfer? (yes/no): ")
        if confirm.lower() != 'yes':
            print("Transfer cancelled")
            return
            
        # Perform the transfer
        print("\nStarting data transfer...")
        success = transfer_data(source_conn, target_conn, source_table, target_table)
        
        if success:
            print("\nData transfer completed successfully!")
        else:
            print("\nData transfer failed. Please check the error messages above.")
            
    finally:
        source_conn.close()
        target_conn.close()

if __name__ == "__main__":
    main()
