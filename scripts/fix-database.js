import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'data', 'bible', 'Bibles.db');

// Backup the database before making changes
function backupDatabase() {
  const backupPath = dbPath + '.backup-' + new Date().toISOString().replace(/[:.]/g, '-');
  console.log(`Creating backup at: ${backupPath}`);
  fs.copyFileSync(dbPath, backupPath);
  return backupPath;
}

async function fixDatabase() {
  console.log('Starting database repair...');
  
  // Create backup
  const backupFile = backupDatabase();
  console.log(`Database backed up to: ${backupFile}`);
  
  const db = new Database(dbPath);
  
  try {
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Get all version tables (t_* tables that aren't system tables)
    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 't\\_%' ESCAPE '\\' AND name NOT LIKE 't\\_%\\_%' ESCAPE '\\'"
    ).all();
    
    console.log('\nFound version tables:', tables.map(t => t.name).join(', '));
    
    // Check and fix each table
    for (const { name: tableName } of tables) {
      console.log(`\nChecking table: ${tableName}`);
      
      try {
        // Check if table has the correct schema
        const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
        const columnNames = columns.map(c => c.name);
        
        // Expected columns
        const expectedColumns = ['id', 'book', 'chapter', 'verse', 'text'];
        const missingColumns = expectedColumns.filter(col => !columnNames.includes(col));
        
        if (missingColumns.length > 0) {
          console.log(`❌ Table ${tableName} is missing columns: ${missingColumns.join(', ')}`);
          
          // Create a new table with correct schema
          const tempTable = `${tableName}_new`;
          console.log(`Creating new table with correct schema: ${tempTable}`);
          
          db.exec(`
            CREATE TABLE ${tempTable} (
              id INTEGER PRIMARY KEY,
              book INTEGER NOT NULL,
              chapter INTEGER NOT NULL,
              verse INTEGER NOT NULL,
              text TEXT NOT NULL,
              FOREIGN KEY (book) REFERENCES key_english (id),
              UNIQUE(book, chapter, verse)
            )
          `);
          
          // Try to copy data if possible
          try {
            const commonColumns = columnNames.filter(c => expectedColumns.includes(c));
            if (commonColumns.length > 0) {
              const columnsStr = commonColumns.join(', ');
              db.exec(`
                INSERT INTO ${tempTable} (${columnsStr})
                SELECT ${columnsStr} FROM ${tableName}
              `);
              console.log(`✅ Migrated data to new table`);
            }
          } catch (error) {
            console.error('Could not migrate data:', error.message);
          }
          
          // Drop old table and rename new one
          console.log('Replacing old table...');
          db.exec(`
            DROP TABLE IF EXISTS ${tableName};
            ALTER TABLE ${tempTable} RENAME TO ${tableName};
          `);
          
          console.log(`✅ Table ${tableName} has been repaired`);
        } else {
          console.log(`✅ Table ${tableName} has the correct schema`);
        }
        
        // Check if table has data
        const count = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get().count;
        console.log(`- Contains ${count} verses`);
        
      } catch (error) {
        console.error(`Error checking table ${tableName}:`, error.message);
      }
    }
    
    // Check for missing foreign keys
    console.log('\nChecking foreign key constraints...');
    const fkViolations = db.prepare(
      `SELECT name FROM sqlite_master 
       WHERE type = 'table' 
       AND name LIKE 't\\_%' ESCAPE '\\'
       AND name NOT LIKE 't\\_%\\_%' ESCAPE '\\'
       AND name NOT IN (SELECT name FROM sqlite_master WHERE sql LIKE '%FOREIGN KEY%')`
    ).all();
    
    if (fkViolations.length > 0) {
      console.log('❌ Tables missing foreign key constraints:', fkViolations.map(t => t.name).join(', '));
    } else {
      console.log('✅ All version tables have foreign key constraints');
    }
    
    // Check for missing indexes
    console.log('\nChecking indexes...');
    const missingIndexes = [];
    const versionTables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 't\\_%' ESCAPE '\\'"
    ).all();
    
    for (const { name: tableName } of tables) {
      const indexes = db.prepare(
        `SELECT name FROM sqlite_master 
         WHERE type = 'index' 
         AND tbl_name = '${tableName}'
         AND (name LIKE 'idx_${tableName}_book' OR name LIKE 'idx_${tableName}_ref')`
      ).all();
      
      if (indexes.length < 2) {
        missingIndexes.push(tableName);
      }
    }
    
    if (missingIndexes.length > 0) {
      console.log('❌ Tables missing recommended indexes:', missingIndexes.join(', '));
      console.log('Creating missing indexes...');
      
      for (const tableName of missingIndexes) {
        try {
          db.exec(`
            CREATE INDEX IF NOT EXISTS idx_${tableName}_book ON ${tableName}(book);
            CREATE INDEX IF NOT EXISTS idx_${tableName}_ref ON ${tableName}(book, chapter, verse);
          `);
          console.log(`✅ Created indexes for ${tableName}`);
        } catch (error) {
          console.error(`Error creating indexes for ${tableName}:`, error.message);
        }
      }
    } else {
      console.log('✅ All version tables have the necessary indexes');
    }
    
    console.log('\nDatabase repair completed!');
    console.log(`A backup was created at: ${backupFile}`);
    
  } catch (error) {
    console.error('Error during database repair:', error);
  } finally {
    db.close();
  }
}

// Run the repair
fixDatabase().catch(console.error);
