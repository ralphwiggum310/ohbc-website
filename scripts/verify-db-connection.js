// Use dynamic import for ESM modules
import('node:module').then(async (module) => {
  // Create require function for dynamic imports
  const require = module.createRequire(import.meta.url);
  
  try {
    console.log('Verifying database connection and bible_verses table...');
    
    // Dynamically import the db module
    const { query } = await import('../src/lib/db.js');
    
    // 1. Check if the bible_verses table exists
    const tableCheck = await query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='bible_verses'"
    );
    
    if (!tableCheck || tableCheck.length === 0) {
      console.error('ERROR: bible_verses table does not exist in the database.');
      console.log('\nPlease run the import-bible-translations.js script to create and populate the table.');
      process.exit(1);
    }
    
    console.log('✓ bible_verses table exists');
    
    // 2. Check the table structure
    console.log('\nTable structure:');
    const columns = await query('PRAGMA table_info(bible_verses)');
    console.table(columns);
    
    // 3. Count verses by version
    console.log('\nNumber of verses by version:');
    const counts = await query('SELECT version, COUNT(*) as count FROM bible_verses GROUP BY version');
    console.table(counts);
    
    // 4. Get a sample verse
    console.log('\nSample verse:');
    const sample = await query('SELECT * FROM bible_verses LIMIT 1');
    console.log(sample[0]);
    
    // 5. Test a specific query that the Bible reader would use
    console.log('\nTesting Bible reader query (John 3:16 in KJV):');
    const testQuery = await query(
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
    
  } catch (error) {
    console.error('Error verifying database:', error);
    process.exit(1);
  }
}).catch(err => {
  console.error('Error initializing script:', err);
  process.exit(1);
});
