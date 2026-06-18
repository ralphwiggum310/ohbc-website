import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database path
const DB_PATH = path.join(process.cwd(), 'data', 'users', 'ohbc_users.db');

// Helper function to get database connection
function getDb() {
  return new Database(DB_PATH);
}

// Initialize database and create users table if it doesn't exist
async function initializeUsersDatabase() {
  const db = getDb();
  
  try {
    // Check if users table exists
    const tableInfo = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='users'
    `).get();
    
    if (!tableInfo) {
      console.log('Creating users table...');
      
      // Create users table with all necessary columns
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          middle_name TEXT,
          suffix TEXT,
          nickname TEXT,
          photo_url TEXT,
          primary_email TEXT,
          secondary_email TEXT,
          home_phone TEXT,
          mobile_phone TEXT,
          work_phone TEXT,
          address_street TEXT,
          address_city TEXT,
          address_state TEXT,
          address_zip TEXT,
          address_country TEXT,
          spouse_name TEXT,
          children_names TEXT, -- JSON array
          anniversary_date TEXT,
          occupation TEXT,
          company TEXT,
          status TEXT DEFAULT 'Pending',
          ministries TEXT, -- JSON array
          categories TEXT, -- JSON array
          is_active INTEGER DEFAULT 1,
          is_featured INTEGER DEFAULT 0,
          failed_login_attempts INTEGER DEFAULT 0,
          locked_until TEXT,
          reset_token VARCHAR(255),
          reset_token_expiry TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      db.exec(createTableSQL);
      console.log('Users table created successfully');
      
      // Create indexes for better performance
      const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
        'CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)',
        'CREATE INDEX IF NOT EXISTS idx_users_name ON users(last_name, first_name)',
        'CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active)',
        'CREATE INDEX IF NOT EXISTS idx_users_featured ON users(is_featured)',
        'CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token)'
      ];
      
      indexes.forEach(indexSQL => {
        db.exec(indexSQL);
      });
      
      console.log('Database indexes created successfully');
    } else {
      console.log('Users table already exists');
    }
    
  } catch (error) {
    console.error('Error initializing users database:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Run initialization
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1] === __filename) {
  initializeUsersDatabase()
    .then(() => {
      console.log('Users database initialization complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}
