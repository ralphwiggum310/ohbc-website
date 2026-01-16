const sqlite3 = require('better-sqlite3');
const path = require('path');

// Path to the database
const dbPath = path.join(process.cwd(), 'Bible api', 'C:\WindSurf\ohbc_website\data\bible\bibles.db');
console.log(`Checking database at: ${dbPath}`);

try {
  // Connect to the database
  const db = sqlite3(dbPath, { readonly: true });
  
  // Get book ID for John (should be 43 based on key_english table)
  const johnInfo = db.prepare('SELECT id FROM key_english WHERE abbreviation = ?').get('jhn');
  
  if (!johnInfo) {
    console.error('Could not find book of John in key_english table');
    process.exit(1);
  }
  
  const johnId = johnInfo.id;
  console.log(`Book ID for John: ${johnId}`);
  
  // Check if there are any verses in John 3
  const verseCount = db.prepare('SELECT COUNT(*) as count FROM t_king_james_bible WHERE book = ? AND chapter = ?')
    .get(johnId, 3).count;
    
  console.log(`\nNumber of verses in John 3 (KJV): ${verseCount}`);
  
  if (verseCount > 0) {
    // Show all verses in John 3
    console.log('\nVerses in John 3 (KJV):');
    const verses = db.prepare(`
      SELECT v.verse, v.text 
      FROM t_king_james_bible v 
      WHERE v.book = ? AND v.chapter = ? 
      ORDER BY v.verse
    `).all(johnId, 3);
    
    console.table(verses);
  } else {
    // Check if there are any verses at all in the KJV table
    const anyVerse = db.prepare('SELECT * FROM t_king_james_bible LIMIT 1').get();
    console.log('\nSample verse from KJV (any book/chapter):', anyVerse);
    
    // Check total count of verses in KJV
    const totalVerses = db.prepare('SELECT COUNT(*) as count FROM t_king_james_bible').get().count;
    console.log('Total verses in KJV table:', totalVerses);
  }
  
  db.close();
  
} catch (error) {
  console.error('Error:', error.message);
  if (error.code) console.error('Error code:', error.code);
}
