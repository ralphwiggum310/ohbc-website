import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'data', 'bible', 'Bibles.db');

async function listAllTables() {
  console.log('Listing all tables in the database...');
  
  const db = new Database(dbPath, { readonly: true });
  
  try {
    // Get all tables
    const tables = db.prepare(
      "SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name"
    ).all();
    
    console.log('\nTables in the database:');
    console.log('----------------------');
    
    for (const table of tables) {
      console.log(`\nTable: ${table.name}`);
      console.log('Schema:');
      console.log(table.sql);
      
      // Get row count
      try {
        const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get().count;
        console.log(`Row count: ${count}`);
        
        // Get column names and sample data
        if (count > 0) {
          const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
          console.log('Columns:', columns.map(c => c.name).join(', '));
          
          if (count <= 10) {
            const sample = db.prepare(`SELECT * FROM ${table.name} LIMIT 5`).all();
            console.log('Sample data:', JSON.stringify(sample, null, 2));
          } else {
            const sample = db.prepare(`SELECT * FROM ${table.name} LIMIT 2`).all();
            console.log('Sample data (first 2 rows):', JSON.stringify(sample, null, 2));
          }
        }
      } catch (error) {
        console.error(`Error querying table ${table.name}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('Error listing tables:', error);
  } finally {
    db.close();
  }
}

listAllTables().catch(console.error);
