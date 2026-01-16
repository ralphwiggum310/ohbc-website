const sqlite3 = require('better-sqlite3');
const path = require('path');

// Source and target database paths
const sourceDbPath = 'C:\\WindSurf\\Bible\\NIV\\NIV\'11.SQLite3';
const targetDbPath = path.join(__dirname, '..', 'data', 'bible', 'Bibles.db');

// Connect to both databases
console.log('Connecting to source database...');
const sourceDb = new sqlite3(sourceDbPath, { readonly: true });
console.log('Connecting to target database...');
const targetDb = new sqlite3(targetDbPath);

// Begin transaction for the target database
const transaction = targetDb.transaction(() => {
    console.log('Starting transaction...');
    
    // Clear the existing NIV data
    console.log('Clearing existing NIV data...');
    targetDb.prepare('DELETE FROM t_new_international_version').run();
    
    // Get all verses from the source database
    console.log('Fetching verses from source database...');
    const verses = sourceDb.prepare('SELECT * FROM verses').all();
    
    console.log(`Found ${verses.length} verses to import`);
    
    // Prepare the insert statement for the target database
    const insert = targetDb.prepare(
        'INSERT INTO t_new_international_version (book, chapter, verse, text) VALUES (?, ?, ?, ?)'
    );
    
    // Insert each verse into the target database
    console.log('Inserting verses into target database...');
    let count = 0;
    const batchSize = 1000;
    
    for (const verse of verses) {
        insert.run(
            verse.book_number,
            verse.chapter,
            verse.verse,
            verse.text
        );
        
        count++;
        if (count % batchSize === 0) {
            console.log(`Processed ${count} verses...`);
        }
    }
    
    console.log(`Successfully imported ${count} verses`);
    
    // Update the version information if needed
    console.log('Updating version information...');
    const now = new Date().toISOString();
    targetDb.prepare(
        'UPDATE Translation SET last_updated = ? WHERE abbreviation = ?'
    ).run(now, 'NIV');
    
    console.log('NIV update completed successfully!');
});

// Execute the transaction
try {
    transaction();
} catch (error) {
    console.error('Error during transaction:', error);
} finally {
    // Close database connections
    sourceDb.close();
    targetDb.close();
    console.log('Database connections closed');
}
