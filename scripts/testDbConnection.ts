import { query } from '../src/lib/db';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test query to get a list of tables
    const tables = await query("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('Tables in database:', tables.map((t: any) => t.name).join(', '));
    
    // Test query to get sample data from key_english
    const books = await query('SELECT * FROM key_english LIMIT 5');
    console.log('Sample books:', books);
    
    // Test query to get a specific verse
    const verse = await query(
      `SELECT v.*, b.name as book_name 
       FROM t_king_james_bible v
       JOIN key_english b ON b.id = v.book
       WHERE b.abbreviation = 'jhn' AND v.chapter = 3 AND v.verse = 16`
    );
    
    console.log('John 3:16:', verse);
    
  } catch (error) {
    console.error('Database test failed:', error);
  }
}

testConnection().catch(console.error);
