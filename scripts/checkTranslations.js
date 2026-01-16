import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function checkTranslations() {
  const dbPath = 'C:\\WindSurf\\ohbc_website\\data\\bible\\bibles.db';
  console.log(`Checking translations in: ${dbPath}`);
  
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Get all translations
    const translations = await db.all('SELECT * FROM Translation');
    console.log('\nAvailable translations:');
    console.table(translations.map(t => ({
      id: t.id,
      name: t.name,
      abbreviation: t.abbreviation,
      language: t.language,
      table_name: t.table_name || 'N/A',
      has_data: '?'
    })));
    
    // Check which translation tables have data
    console.log('\nTranslation tables with data:');
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 't_%'");
    
    for (const {name} of tables) {
      const count = await db.get(`SELECT COUNT(*) as count FROM ${name}`);
      console.log(`- ${name}: ${count.count} verses`);
    }
    
    await db.close();
  } catch (error) {
    console.error('Error checking translations:', error);
  }
}

checkTranslations().catch(console.error);
