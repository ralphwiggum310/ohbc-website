const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const backupDbPath = path.join(__dirname, '..', 'data', 'bible', 'bibles_backup_20251204_112321.db');
const db = new sqlite3.Database(backupDbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error opening backup database:', err);
    return;
  }
  
  console.log('Connected to backup database');
  
  // Check if t_nasb1995 table exists and has data
  db.all(
    "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%nasb%'",
    (err, tables) => {
      if (err) {
        console.error('Error checking for NASB table:', err);
        return;
      }
      
      console.log('NASB tables in backup:', tables);
      
      if (tables.length > 0) {
        // Check row count in the NASB table
        db.get("SELECT COUNT(*) as count FROM t_nasb1995", (err, row) => {
          if (err) {
            console.error('Error counting rows in t_nasb1995:', err);
          } else {
            console.log(`Row count in t_nasb1995: ${row.count}`);
            
            // Get a sample of the data
            db.all("SELECT * FROM t_nasb1995 LIMIT 5", (err, rows) => {
              if (err) {
                console.error('Error fetching sample data:', err);
              } else {
                console.log('Sample data from t_nasb1995:', JSON.stringify(rows, null, 2));
              }
              
              db.close();
            });
          }
        });
      } else {
        console.log('No NASB table found in backup');
        db.close();
      }
    }
  );
});
