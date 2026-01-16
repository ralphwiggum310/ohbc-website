import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

const DB_PATH = 'C:\\WindSurf\\ohbc_website\\data\\bible\\bibles.db';

async function inspectDatabase() {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  try {
    console.log('=== DATABASE INSPECTION ===');
    
    // List all tables
    const tables = await db.all(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );
    
    console.log('\n=== TABLES ===');
    console.table(tables);
    
    // Inspect each table
    for (const { name: tableName } of tables) {
      console.log('\n' + '='.repeat(50));
      console.log(`=== TABLE: ${tableName} ===`);
      
      try {
        // Get column info
        const columns = await db.all(`PRAGMA table_info(${tableName})`);
        console.log('\nCOLUMNS:');
        console.table(columns);
        
        // Get row count
        const count = await db.get(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log('\nROW COUNT:', count?.count);
        
        // Get sample data
        if (count?.count > 0) {
          const sample = await db.all(`SELECT * FROM ${tableName} LIMIT 1`);
          console.log('\nSAMPLE ROW:');
          console.log(JSON.stringify(sample[0], null, 2));
          
          // Try to identify and show column distributions for important columns
          const potentialIdColumns = columns.filter(c => 
            ['id', 'book', 'chapter', 'verse', 'v', 'b', 'c', 't', 'text']
            .includes(c.name.toLowerCase())
          );
          
          for (const col of potentialIdColumns) {
            try {
              const distinctCount = await db.get(
                `SELECT COUNT(DISTINCT ${col.name}) as count FROM ${tableName}`
              );
              console.log(`\nDistinct values in ${col.name}: ${distinctCount.count}`);
              
              // For columns with few distinct values, show them
              if (distinctCount.count <= 10) {
                const values = await db.all(
                  `SELECT DISTINCT ${col.name} as value FROM ${tableName} ORDER BY ${col.name} LIMIT 10`
                );
                console.log(`Sample ${col.name} values:`, values.map(v => v.value).join(', '));
              }
            } catch (e) {
              // Ignore errors for this column
            }
          }
        }
      } catch (error) {
        console.error(`Error inspecting table ${tableName}:`, error);
      }
    }
    
  } catch (error) {
    console.error('Error during database inspection:', error);
  } finally {
    await db.close();
  }
}

// Run the inspection
inspectDatabase().catch(console.error);
