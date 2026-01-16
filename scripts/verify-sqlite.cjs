const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs').promises;

// Possible database paths
const possiblePaths = [
  'C:\\WindSurf\\ohbc_website\\data\\bible\\bibles.db',
  path.join(process.cwd(), 'data', 'bible', 'bibles.db'),
  path.join(process.cwd(), 'Bible api', 'bibles.db'),
  path.join(process.cwd(), 'Bible api', 'Bibles.db'),
  path.join(process.cwd(), 'bibles.db'),
];

// Simple promisified query functions with better error handling
function dbAll(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    console.log(`[SQL] Executing: ${sql}`, params);
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error(`[SQL ERROR] ${err.message}`, { sql, params });
        reject(err);
      } else {
        console.log(`[SQL] Returned ${rows ? rows.length : 0} rows`);
        resolve(rows || []);
      }
    });
  });
}

function dbGet(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    console.log(`[SQL] Executing: ${sql}`, params);
    db.get(sql, params, (err, row) => {
      if (err) {
        console.error(`[SQL ERROR] ${err.message}`, { sql, params });
        reject(err);
      } else {
        console.log('[SQL] Returned row:', row);
        resolve(row || null);
      }
    });
  });
}

async function findDatabase() {
  for (const dbPath of possiblePaths) {
    try {
      await fs.access(dbPath);
      console.log(`Found database at: ${dbPath}`);
      return dbPath;
    } catch (error) {
      console.log(`Database not found at: ${dbPath}`);
    }
  }
  throw new Error('Could not find database file in any of the expected locations');
}

async function checkBibleVersesTable(db) {
  try {
    // Check if bible_verses table exists
    const tableExists = await dbGet(
      db,
      "SELECT name FROM sqlite_master WHERE type='table' AND name='bible_verses'"
    );

    if (!tableExists) {
      console.error('ERROR: bible_verses table does not exist in the database.');
      return false;
    }

    console.log('✓ bible_verses table exists');

    // Get table structure
    console.log('\nTable structure:');
    const columns = await dbAll(db, 'PRAGMA table_info(bible_verses)');
    console.table(columns);

    // Count verses by version
    console.log('\nNumber of verses by version:');
    const counts = await dbAll(db, 'SELECT version, COUNT(*) as count FROM bible_verses GROUP BY version');
    console.table(counts);

    // Get a sample verse
    console.log('\nSample verse:');
    const sample = await dbGet(db, 'SELECT * FROM bible_verses LIMIT 1');
    console.log(sample);

    // Test a query that the Bible reader would use
    console.log('\nTesting Bible reader query (John 3:16 in KJV):');
    const testQuery = await dbAll(
      db,
      `SELECT book, chapter, verse, text, version 
       FROM bible_verses 
       WHERE LOWER(book) = ? AND chapter = ? AND version = ? 
       ORDER BY verse`,
      ['john', 3, 'KJV']
    );

    if (testQuery && testQuery.length > 0) {
      console.log('✓ Test query successful!');
      console.log(`Found ${testQuery.length} verses in John 3 (KJV)`);
      console.log('Sample verse:', testQuery[0]);
    } else {
      console.log('No results for test query. The table might be empty.');
    }

    return true;
  } catch (error) {
    console.error('Error checking bible_verses table:', error);
    return false;
  }
}

async function main() {
  let db;
  try {
    // Find the database file
    const dbPath = await findDatabase();
    
    // Open the database with better error handling
    await new Promise((resolve, reject) => {
      db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('\nConnected to database successfully!');
          resolve(db);
        }
      });
    });
    
    try {
      // Check the database version
      const version = await dbGet(db, 'SELECT sqlite_version() as version');
      console.log(`SQLite version: ${version.version}`);

      // List all tables in the database
      console.log('\nListing all tables in the database...');
      const tables = await dbAll(db, "SELECT name, sql FROM sqlite_master WHERE type='table'");
      console.log('\nTables in the database:');
      console.table(tables.map(t => ({ name: t.name })));
      
      // Show table schemas
      console.log('\nTable schemas:');
      for (const table of tables) {
        console.log(`\nTable: ${table.name}`);
        console.log('Schema:', table.sql || 'No schema information');
        
        // Show column information
        const columns = await dbAll(db, `PRAGMA table_info(${table.name})`);
        if (columns && columns.length > 0) {
          console.log('Columns:');
          console.table(columns);
        }
      }

      // Check the bible_verses table specifically
      console.log('\nChecking bible_verses table...');
      await checkBibleVersesTable(db);
      
    } catch (queryError) {
      console.error('Error executing queries:', queryError);
    }

  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    // Close the database connection
    if (db) {
      return new Promise((resolve) => {
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
          } else {
            console.log('\nDatabase connection closed.');
          }
          resolve();
        });
      });
    }
  }
}

// Run the main function
main().catch(console.error);
