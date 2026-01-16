import sqlite3 from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the database
const dbPath = path.join(process.cwd(), 'Bible api', 'C:\WindSurf\ohbc_website\data\bible\bibles.db');
console.log(`Testing connection to: ${dbPath}`);

try {
  // Try to open the database
  console.log('Attempting to open database...');
  const db = sqlite3(dbPath, { fileMustExist: true });
  
  // Basic connection test
  console.log('\n=== Connection Test ===');
  const version = db.prepare('SELECT sqlite_version() as version').get();
  console.log(`Connected to SQLite version: ${version.version}`);
  
  // List all tables
  console.log('\n=== Database Tables ===');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
  console.log(`Found ${tables.length} tables:`);
  tables.forEach((table, index) => {
    console.log(`${index + 1}. ${table.name}`);
  });
  
  // Close the database
  db.close();
  console.log('\nDatabase connection closed.');
  
} catch (error) {
  console.error('\n=== ERROR ===');
  console.error('Error connecting to database:');
  console.error(error.message);
  if (error.code) console.error('Error code:', error.code);
  
  // Check if file exists
  import fs from 'fs';
  try {
    const exists = fs.existsSync(dbPath);
    console.log(`\nFile exists: ${exists}`);
    if (exists) {
      const stats = fs.statSync(dbPath);
      console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Last modified: ${stats.mtime}`);
    }
  } catch (fsError) {
    console.error('Error getting file info:', fsError.message);
  }
}
