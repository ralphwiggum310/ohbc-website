// Use dynamic import to handle ESM modules
async function testBibleApi() {
  try {
    console.log('Testing Bible API...');
    
    // Dynamically import the db module
    const dbModule = await import('../src/lib/db');
    const { query } = dbModule;
    
    // Test database connection and query
    console.log('\n1. Testing database connection and key_english table...');
    const bookInfo = await query("SELECT id, name FROM key_english WHERE LOWER(name) = 'genesis'");
    console.log('Book info:', JSON.stringify(bookInfo, null, 2));

    if (!bookInfo || !Array.isArray(bookInfo) || bookInfo.length === 0) {
      console.error('No book found with name "genesis" in key_english table');
      return;
    }

    const bookId = bookInfo[0]?.id;
    if (!bookId) {
      console.error('No book ID found in book info:', bookInfo);
      return;
    }
    
    console.log('\n2. Testing bible_verses table with book_id:', bookId);
    
    const verses = await query(
      `SELECT book_id, chapter, verse, text, version 
       FROM bible_verses 
       WHERE book_id = ? AND chapter = 1 AND version = 'KJV'
       ORDER BY verse`,
      [bookId]
    );
    
    console.log('Verses found:', verses?.length || 0);
    if (verses && Array.isArray(verses) && verses.length > 0) {
      console.log('First verse:', JSON.stringify(verses[0], null, 2));
    } else {
      console.log('No verses found. Checking if table exists...');
      // Check if the table exists
      const tables = await query("SELECT name FROM sqlite_master WHERE type='table'");
      console.log('Available tables:', tables);
      
      if (tables.some((t: any) => t.name === 'bible_verses')) {
        console.log('bible_verses table exists. Checking for any data...');
        const anyVerse = await query("SELECT * FROM bible_verses LIMIT 1");
        console.log('Sample verse data:', anyVerse);
      } else {
        console.log('bible_verses table does not exist!');
      }
    }

  } catch (error) {
    console.error('Error testing Bible API:');
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    } else {
      console.error('Unknown error:', error);
    }
  }
}

// Run the test
testBibleApi().catch(error => {
  console.error('Unhandled error in testBibleApi:', error);
  process.exit(1);
});
