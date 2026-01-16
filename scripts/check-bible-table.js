const { query } = require('../src/lib/db');

async function checkBibleTable() {
  try {
    console.log('Checking bible_verses table structure...');
    
    // Check if the table exists
    const tableExists = await query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='bible_verses'"
    );
    
    if (tableExists.length === 0) {
      console.error('ERROR: bible_verses table does not exist in the database.');
      console.log('\nPlease run the import-bible-translations.js script to create and populate the table.');
      return;
    }
    
    console.log('✓ bible_verses table exists');
    
    // Check the table structure
    const columns = await query('PRAGMA table_info(bible_verses)');
    console.log('\nTable structure:');
    console.table(columns);
    
    // Check the number of verses
    const count = await query('SELECT version, COUNT(*) as count FROM bible_verses GROUP BY version');
    console.log('\nNumber of verses by version:');
    console.table(count);
    
    // Check a sample verse
    const sample = await query('SELECT * FROM bible_verses LIMIT 1');
    console.log('\nSample verse:');
    console.log(sample[0]);
    
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

checkBibleTable();
