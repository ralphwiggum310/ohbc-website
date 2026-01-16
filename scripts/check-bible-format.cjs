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
    
    // Get a sample of the KJV table
    db.get("SELECT * FROM t_king_james_bible LIMIT 1", [], (err, row) => {
        if (err) {
            console.error('Error querying KJV table:', err.message);
            return;
        }
        console.log('Sample row from KJV table:');
        console.log(row);
        
        // Get the table schema
        db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='t_king_james_bible'", [], (err, schema) => {
            if (err) {
                console.error('Error getting table schema:', err.message);
                return;
            }
            console.log('\nTable schema for KJV:');
            console.log(schema.sql);
            
            // List all Bible version tables
            db.all("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 't_%' ORDER BY name", [], (err, tables) => {
                if (err) {
                    console.error('Error getting table list:', err.message);
                    return;
                }
                console.log('\nAvailable Bible version tables:');
                console.log(tables.map(t => `- ${t.name}`).join('\n'));
                
                // Close the database connection
                db.close();
            });
        });
    });
});
