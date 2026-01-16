const sqlite3 = require('better-sqlite3');
const path = require('path');

// Source and target database paths
const sourceDbPath = 'C:\\WindSurf\\Bible\\NIV\\NIV\'11.SQLite3';
const targetDbPath = path.join(__dirname, '..', 'data', 'bible', 'Bibles.db');

// Function to get database schema
function getTableInfo(db, tableName) {
    try {
        return db.prepare(`PRAGMA table_info(${tableName})`).all();
    } catch (e) {
        console.error(`Error getting table info for ${tableName}:`, e.message);
        return [];
    }
}

// Function to get row count
function getRowCount(db, tableName) {
    try {
        const result = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get();
        return result ? result.count : 0;
    } catch (e) {
        console.error(`Error getting row count for ${tableName}:`, e.message);
        return 0;
    }
}

// Main function
async function updateNiv() {
    let sourceDb, targetDb;
    
    try {
        // Connect to source database
        console.log('Connecting to source database...');
        sourceDb = new sqlite3(sourceDbPath, { readonly: true });
        
        // Check source database structure
        console.log('\nSource database tables:');
        const sourceTables = sourceDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
        console.log(sourceTables.map(t => t.name).join(', '));
        
        // Check if verses table exists in source
        if (!sourceTables.some(t => t.name === 'verses')) {
            throw new Error("Source database does not contain a 'verses' table");
        }
        
        // Get verses table info
        console.log('\nSource verses table structure:');
        const versesInfo = getTableInfo(sourceDb, 'verses');
        console.log(versesInfo);
        
        // Get verse count
        const verseCount = getRowCount(sourceDb, 'verses');
        console.log(`\nFound ${verseCount} verses in source database`);
        
        // Connect to target database
        console.log('\nConnecting to target database...');
        targetDb = new sqlite3(targetDbPath);
        
        // Check if target table exists
        const targetTable = 't_new_international_version';
        const targetTables = targetDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
        
        if (!targetTables.some(t => t.name === targetTable)) {
            throw new Error(`Target database does not contain table '${targetTable}'`);
        }
        
        // Get target table info
        console.log(`\nTarget ${targetTable} table structure:`);
        const targetInfo = getTableInfo(targetDb, targetTable);
        console.log(targetInfo);
        
        // Get current row count in target
        const currentCount = getRowCount(targetDb, targetTable);
        console.log(`\nCurrent row count in target table: ${currentCount}`);
        
        // Ask for confirmation
        console.log('\nWARNING: This will delete all existing NIV data and replace it with new data from the source.');
        console.log('Press Ctrl+C to cancel or Enter to continue...');
        await new Promise(resolve => process.stdin.once('data', resolve));
        
        // Begin transaction
        console.log('\nStarting transaction...');
        targetDb.prepare('BEGIN TRANSACTION').run();
        
        try {
            // Clear existing data
            console.log('Clearing existing NIV data...');
            targetDb.prepare(`DELETE FROM ${targetTable}`).run();
            
            // Prepare insert statement
            const insert = targetDb.prepare(
                `INSERT INTO ${targetTable} (book, chapter, verse, text) VALUES (?, ?, ?, ?)`
            );
            
            // Get all verses from source database in batches
            console.log('Fetching and inserting verses...');
            const batchSize = 1000;
            let offset = 0;
            let totalInserted = 0;
            
            while (true) {
                const verses = sourceDb.prepare(
                    'SELECT book_number, chapter, verse, text FROM verses LIMIT ? OFFSET ?'
                ).all(batchSize, offset);
                
                if (verses.length === 0) break;
                
                // Insert batch
                const insertMany = targetDb.transaction((verses) => {
                    for (const verse of verses) {
                        insert.run(
                            verse.book_number,
                            verse.chapter,
                            verse.verse,
                            verse.text
                        );
                    }
                    return verses.length;
                });
                
                const inserted = insertMany(verses);
                totalInserted += inserted;
                offset += verses.length;
                
                console.log(`Processed ${offset} of ${verseCount} verses (${Math.round((offset / verseCount) * 100)}%)`);
            }
            
            // Update version information
            console.log('Updating version information...');
            const now = new Date().toISOString();
            targetDb.prepare(
                'UPDATE Translation SET last_updated = ? WHERE abbreviation = ?'
            ).run(now, 'NIV');
            
            // Commit transaction
            console.log('Committing transaction...');
            targetDb.prepare('COMMIT').run();
            
            console.log(`\nSuccessfully imported ${totalInserted} verses`);
            
        } catch (error) {
            console.error('Error during transaction, rolling back:', error.message);
            targetDb.prepare('ROLLBACK').run();
            throw error;
        }
        
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    } finally {
        // Close database connections
        if (sourceDb) sourceDb.close();
        if (targetDb) targetDb.close();
        console.log('Database connections closed');
    }
}

// Set up stdin for user input
process.stdin.setEncoding('utf8');

// Run the update
updateNiv()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
