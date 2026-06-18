const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database path
const dbPath = path.join(__dirname, 'ohbc_users.db');

// Read and execute schema
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database.');
});

// Execute schema
db.exec(schema, (err) => {
  if (err) {
    console.error('Error executing schema:', err.message);
    process.exit(1);
  }
  console.log('Database schema created successfully.');
});

// Close connection
db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
    process.exit(1);
  }
  console.log('Database connection closed.');
});
