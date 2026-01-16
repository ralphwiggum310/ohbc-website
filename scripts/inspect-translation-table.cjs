const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

// Path to the SQLite database
const dbPath = path.join('C:\\WindSurf\\ohbc_website\\data\\bible\\bibles.db');

async function inspectTranslationTable() {
  console.log('Inspecting Translation table structure...');
  
  // Open the database
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  try {
    // Check if the table exists
    const tableInfo = await db.all("PRAGMA table_info(Translation)");
    
    if (!tableInfo || tableInfo.length === 0) {
      console.log('Translation table does not exist');
      return;
    }

    console.log('\nTranslation table columns:');
    tableInfo.forEach(column => {
      console.log(`- ${column.name} (${column.type})`);
    });

    // Show a sample of the data
    console.log('\nSample data from Translation table:');
    const sampleData = await db.all('SELECT * FROM Translation LIMIT 5');
    console.log(sampleData);
    
  } catch (error) {
    console.error('Error inspecting Translation table:', error);
  } finally {
    // Close the database connection
    await db.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the inspection
inspectTranslationTable().catch(console.error);
