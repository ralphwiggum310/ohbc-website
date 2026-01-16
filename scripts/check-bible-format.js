const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to the database
const dbPath = path.join('C:\\WindSurf\\ohbc_website\\data\\bible\\bibles.db');

// Connect to the database
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        return;
    }
    console.log('Connected to the database.');
});

// Check the structure of an existing Bible version table
db.serialize(() => {
    // Show the first few rows from a known good table
    db.get("SELECT * FROM t_king_james_bible LIMIT 5", [], (err, rows) => {
        if (err) {
            console.error('Error querying the database:', err.message);
            return;
        }
        console.log('Sample data from KJV:');
        console.log(rows);
    });

    // Show the table schema
    db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='t_king_james_bible'", [], (err, row) => {
        if (err) {
            console.error('Error getting table schema:', err.message);
            return;
        }
        console.log('\nTable schema for KJV:');
        console.log(row.sql);
    });

    // Show the list of all Bible version tables
    db.all("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 't_%' ORDER BY name", [], (err, tables) => {
        if (err) {
            console.error('Error getting table list:', err.message);
            return;
        }
        console.log('\nAvailable Bible version tables:');
        console.log(tables.map(t => t.name).join('\n'));
    });
});

// Close the database connection when done
process.on('exit', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing the database:', err.message);
        } else {
            console.log('\nDatabase connection closed.');
        }
    });
});
