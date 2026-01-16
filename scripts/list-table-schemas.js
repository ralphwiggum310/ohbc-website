import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.join(__dirname, '..', 'data', 'bible', 'Bibles.db');
const db = new Database(dbPath, { readonly: true });

try {
  console.log('Database schemas:');
  console.log('-----------------');

  // Get all tables
  const tables = db.prepare(
    "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
  ).all();

  if (!tables || tables.length === 0) {
    console.log('No tables found in the database.');
    db.close();
    process.exit(0);
  }

  // Process each table
  tables.forEach((table) => {
    console.log(`\nTable: ${table.name}`);
    console.log('SQL:', table.sql);
    
    try {
      // Get row count for each table
      const row = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
      console.log(`Row count: ${row.count}`);
      
      // Get column info for each table
      console.log('Columns:');
      const columns = db.pragma(`table_info(${table.name})`);
      columns.forEach(col => {
        console.log(`  ${col.name} (${col.type}${col.notnull ? ' NOT NULL' : ''}${col.pk ? ' PRIMARY KEY' : ''})`);
      });
    } catch (error) {
      console.error(`Error processing table ${table.name}:`, error.message);
    }
  });
} catch (error) {
  console.error('Error:', error.message);
} finally {
  db.close();
}
