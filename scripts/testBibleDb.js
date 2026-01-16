import sqlite3 from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testDatabase() {
  const dbPath = path.join(process.cwd(), 'Bible api', 'C:\WindSurf\ohbc_website\data\bible\bibles.db');
  console.log(`Testing database at: ${dbPath}`);
  
  try {
    // Connect to the database
    const db = sqlite3(dbPath, { readonly: true });
    
    // Test 1: Check if we can access the database
    console.log('\n[TEST 1] Database connection test');
    const testQuery = db.prepare('SELECT 1 as test').get();
    console.log('✅ Database connection successful:', testQuery);
    
    // Test 2: Check available translations
    console.log('\n[TEST 2] Available translations:');
    const translations = db.prepare('SELECT * FROM Translation').all();
    console.table(translations);
    
    if (translations.length === 0) {
      console.warn('⚠️  No translations found in the database!');
    } else {
      // Test 3: Get a sample verse from each translation
      console.log('\n[TEST 3] Sample verse from each translation:');
      for (const trans of translations) {
        try {
          // Find the verse table name - check both possible column names
          const tableName = trans.table_name || `t_${trans.id.toLowerCase()}`;
          
          const verse = db.prepare(`
            SELECT * FROM ${tableName} 
            WHERE book = 1 AND chapter = 1 AND verse = 1
          `).get();
          
          console.log(`\n${trans.name} (${trans.id}):`);
          console.log(`  Table: ${tableName}`);
          if (verse) {
            console.log(`  Verse: ${verse.text || verse.verse_text || 'No text field found'}`);
          } else {
            console.warn(`  No verse found in ${tableName} for Genesis 1:1`);
          }
        } catch (error) {
          console.error(`  Error querying ${trans.id}:`, error.message);
        }
      }
    }
    
    db.close();
    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

testDatabase();
