const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use the same database path as in your .env.local
const dbPath = path.join(process.cwd(), 'data', 'ohbc-dev.db');
console.log(`Attempting to connect to database at: ${dbPath}`);

// Create a new database connection
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    process.exit(1);
  }
  
  console.log('Successfully connected to the SQLite database');
  
  // Check if users table exists
  db.get(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='user';",
    (err, row) => {
      if (err) {
        console.error('Error checking for users table:', err.message);
        db.close();
        return;
      }
      
      if (row) {
        console.log('Users table exists');
        // Query for users
        db.all('SELECT id, email, firstName, lastName, role FROM user LIMIT 5', [], (err, rows) => {
          if (err) {
            console.error('Error querying users:', err.message);
          } else {
            console.log('\nSample users:');
            console.table(rows || []);
          }
          db.close();
        });
      } else {
        console.log('Users table does not exist');
        db.close();
      }
    }
  );
});
