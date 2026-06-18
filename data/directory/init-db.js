const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database path
const dbPath = path.join(__dirname, 'ohbc_directory.db');

// Create directory if it doesn't exist
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Connect to database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to SQLite directory database.');
});

// Read and execute schema
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

db.exec(schema, (err) => {
    if (err) {
        console.error('Error creating schema:', err.message);
        process.exit(1);
    }
    console.log('Directory database schema created successfully.');
});

// Close database connection
db.close((err) => {
    if (err) {
        console.error('Error closing database:', err.message);
        process.exit(1);
    }
    console.log('Directory database connection closed.');
});
