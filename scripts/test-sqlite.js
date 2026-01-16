const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Path to the SQLite database file
const dbPath = path.join(process.cwd(), 'data', 'ohbc-dev.db');

// Check if the database file exists
const dbExists = fs.existsSync(dbPath);
console.log(`Database file exists: ${dbExists}`);
console.log(`Database path: ${dbPath}`);

// Create a new database connection
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  
  console.log('Successfully connected to the SQLite database');
  
  // Check if users table exists
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='user'", [], (err, row) => {
    if (err) {
      console.error('Error checking for user table:', err.message);
      return;
    }
    
    if (row) {
      console.log('User table exists');
      
      // List all users
      db.all('SELECT id, email, firstName, lastName, role FROM user', [], (err, rows) => {
        if (err) {
          console.error('Error querying users:', err.message);
          return;
        }
        
        console.log('\nUsers in the database:');
        if (rows.length > 0) {
          console.table(rows);
        } else {
          console.log('No users found in the database');
        }
        
        // Close the database connection
        db.close();
      });
    } else {
      console.log('User table does not exist');
      db.close();
    }
  });
});

// Handle errors after connection
db.on('error', (err) => {
  console.error('Database error:', err);
});
