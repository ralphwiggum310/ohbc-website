const sqlite3 = require('better-sqlite3');
const path = require('path');

// Source and target database paths
const sourceDbPath = 'C:\\WindSurf\\Bible\\NIV\\NIV\'11.SQLite3';
const targetDbPath = path.join(__dirname, '..', 'data', 'bible', 'Bibles.db');

// Book number mapping from source to key_english.id
// This is a simplified mapping - you may need to adjust based on actual data
const bookNumberToKeyEnglishId = {
    // Old Testament
    10: 1,    // Genesis
    20: 2,    // Exodus
    30: 3,    // Leviticus
    40: 4,    // Numbers
    50: 5,    // Deuteronomy
    60: 6,    // Joshua
    70: 7,    // Judges
    80: 8,    // Ruth
    90: 9,    // 1 Samuel
    100: 10,  // 2 Samuel
    110: 11,  // 1 Kings
    120: 12,  // 2 Kings
    130: 13,  // 1 Chronicles
    140: 14,  // 2 Chronicles
    150: 15,  // Ezra
    160: 16,  // Nehemiah
    190: 17,  // Esther
    220: 18,  // Job
    230: 19,  // Psalms
    240: 20,  // Proverbs
    250: 21,  // Ecclesiastes
    260: 22,  // Song of Solomon
    290: 23,  // Isaiah
    300: 24,  // Jeremiah
    310: 25,  // Lamentations
    330: 26,  // Ezekiel
    340: 29,  // Daniel
    350: 30,  // Hosea
    360: 31,  // Joel
    370: 32,  // Amos
    380: 33,  // Obadiah
    390: 34,  // Jonah
    400: 35,  // Micah
    410: 36,  // Nahum
    420: 37,  // Habakkuk
    430: 38,  // Zephaniah
    440: 39,  // Haggai
    450: 40,  // Zechariah
    460: 41,  // Malachi
    
    // New Testament
    470: 42,  // Matthew
    480: 43,  // Mark
    490: 44,  // Luke
    500: 45,  // John
    510: 46,  // Acts
    520: 47,  // Romans
    530: 48,  // 1 Corinthians
    540: 49,  // 2 Corinthians
    550: 50,  // Galatians
    560: 51,  // Ephesians
    570: 52,  // Philippians
    580: 53,  // Colossians
    590: 54,  // 1 Thessalonians
    600: 55,  // 2 Thessalonians
    610: 56,  // 1 Timothy
    620: 57,  // 2 Timothy
    630: 58,  // Titus
    640: 59,  // Philemon
    650: 60,  // Hebrews
    660: 61,  // James
    670: 62,  // 1 Peter
    680: 63,  // 2 Peter
    690: 64,  // 1 John
    700: 65,  // 2 John
    710: 66,  // 3 John
    720: 67,  // Jude
    730: 68   // Revelation
};

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
function updateNiv() {
    let sourceDb, targetDb;
    
    try {
        // Connect to source database
        console.log('Connecting to source database...');
        sourceDb = new sqlite3(sourceDbPath, { readonly: true });
        
        // Connect to target database
        console.log('Connecting to target database...');
        targetDb = new sqlite3(targetDbPath);
        
        // Verify the key_english table has the expected structure
        const keyEnglishColumns = getTableInfo(targetDb, 'key_english');
        console.log('\nKey English table columns:', keyEnglishColumns.map(c => c.name));
        
        // Get the list of valid book IDs from key_english
        const validBookIds = targetDb.prepare('SELECT id, name FROM key_english').all();
        console.log(`\nFound ${validBookIds.length} valid book IDs in key_english`);
        
        // Verify our mapping covers all source book numbers
        const sourceBookNumbers = sourceDb.prepare('SELECT DISTINCT book_number FROM verses ORDER BY book_number').all();
        console.log('\nSource book numbers:', sourceBookNumbers.map(b => b.book_number));
        
        // Check for any unmapped book numbers
        const unmappedBooks = sourceBookNumbers.filter(b => !bookNumberToKeyEnglishId[b.book_number]);
        if (unmappedBooks.length > 0) {
            console.error('\nERROR: The following book numbers are not mapped to key_english IDs:');
            console.error(unmappedBooks.map(b => `Book number: ${b.book_number}`).join('\n'));
            throw new Error('Unmapped book numbers found');
        }
        
        // Get verse count from source
        const verseCount = getRowCount(sourceDb, 'verses');
        console.log(`\nFound ${verseCount} verses in source database`);
        
        // Begin transaction
        console.log('\nStarting transaction...');
        targetDb.prepare('BEGIN TRANSACTION').run();
        
        try {
            const targetTable = 't_new_international_version';
            
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
                
                // Insert batch with mapping
                const insertMany = targetDb.transaction((verses) => {
                    for (const verse of verses) {
                        const keyEnglishId = bookNumberToKeyEnglishId[verse.book_number];
                        if (!keyEnglishId) {
                            console.error(`No mapping found for book_number: ${verse.book_number}`);
                            continue;
                        }
                        
                        insert.run(
                            keyEnglishId,  // Mapped book ID
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
                
                // Add a small delay to prevent UI freezing
                if (offset % 5000 === 0) {
                    console.log('Taking a short break...');
                    const start = Date.now();
                    while (Date.now() - start < 1000) { /* wait 1 second */ }
                }
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

// Run the update
updateNiv();
