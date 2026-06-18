import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database paths
const DIRECTORY_DB_PATH = path.join(process.cwd(), 'data', 'directory', 'ohbc_directory.db');
const USERS_DB_PATH = path.join(process.cwd(), 'data', 'users', 'ohbc_users.db');

// Helper function to get database connection
function getDirectoryDb() {
  return new Database(DIRECTORY_DB_PATH, { readonly: true });
}

function getUsersDb() {
  return new Database(USERS_DB_PATH);
}

// Function to add missing columns to users table
async function ensureUsersTableStructure() {
  const usersDb = getUsersDb();
  
  try {
    // Get current table structure
    const tableInfo = usersDb.prepare('PRAGMA table_info(users)').all();
    const existingColumns = tableInfo.map(col => col.name);
    
    console.log('Existing columns:', existingColumns);
    
    // Columns to add
    const columnsToAdd = [
      { name: 'status', type: 'TEXT', notnull: 0, default: "'Pending'" },
      { name: 'first_name', type: 'TEXT', notnull: 1 },
      { name: 'last_name', type: 'TEXT', notnull: 1 },
      { name: 'middle_name', type: 'TEXT', notnull: 0 },
      { name: 'suffix', type: 'TEXT', notnull: 0 },
      { name: 'nickname', type: 'TEXT', notnull: 0 },
      { name: 'photo_url', type: 'TEXT', notnull: 0 },
      { name: 'primary_email', type: 'TEXT', notnull: 0 },
      { name: 'secondary_email', type: 'TEXT', notnull: 0 },
      { name: 'home_phone', type: 'TEXT', notnull: 0 },
      { name: 'mobile_phone', type: 'TEXT', notnull: 0 },
      { name: 'work_phone', type: 'TEXT', notnull: 0 },
      { name: 'address_street', type: 'TEXT', notnull: 0 },
      { name: 'address_city', type: 'TEXT', notnull: 0 },
      { name: 'address_state', type: 'TEXT', notnull: 0 },
      { name: 'address_zip', type: 'TEXT', notnull: 0 },
      { name: 'address_country', type: 'TEXT', notnull: 0 },
      { name: 'spouse_name', type: 'TEXT', notnull: 0 },
      { name: 'children_names', type: 'TEXT', notnull: 0 },
      { name: 'anniversary_date', type: 'TEXT', notnull: 0 },
      { name: 'occupation', type: 'TEXT', notnull: 0 },
      { name: 'company', type: 'TEXT', notnull: 0 },
      { name: 'ministries', type: 'TEXT', notnull: 0 },
      { name: 'categories', type: 'TEXT', notnull: 0 },
      { name: 'is_featured', type: 'INTEGER', notnull: 0, default: 0 },
      { name: 'reset_token', type: 'VARCHAR(255)', notnull: 0 },
      { name: 'reset_token_expiry', type: 'TIMESTAMP', notnull: 0 }
    ];
    
    // Add missing columns
    for (const column of columnsToAdd) {
      if (!existingColumns.includes(column.name)) {
        console.log(`Adding column: ${column.name}`);
        let alterSQL = `ALTER TABLE users ADD COLUMN ${column.name} ${column.type}`;
        
        if (column.notnull && column.default !== undefined) {
          alterSQL += ` NOT NULL DEFAULT ${column.default}`;
        } else if (column.notnull) {
          alterSQL += ` NOT NULL DEFAULT ''`;
        } else {
          alterSQL += ` DEFAULT NULL`;
        }
        
        usersDb.exec(alterSQL);
      }
    }
    
    // Add missing indexes
    const indexesToAdd = [
      'CREATE INDEX IF NOT EXISTS idx_users_name ON users(last_name, first_name)',
      'CREATE INDEX IF NOT EXISTS idx_users_featured ON users(is_featured)',
      'CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token)'
    ];
    
    for (const indexSQL of indexesToAdd) {
      try {
        usersDb.exec(indexSQL);
        console.log(`Created index: ${indexSQL}`);
      } catch (error) {
        console.log(`Index already exists or failed: ${error.message}`);
      }
    }
    
    console.log('Users table structure updated successfully!');
    
  } catch (error) {
    console.error('Error updating users table structure:', error);
    throw error;
  } finally {
    usersDb.close();
  }
}

// Migration function
async function migrateDirectoryToUsers() {
  console.log('Starting migration from directory to users database...');
  
  const dirDb = getDirectoryDb();
  const usersDb = getUsersDb();
  
  try {
    // Check if directory entries exist
    const dirEntries = dirDb.prepare(`
      SELECT * FROM directory_entries WHERE is_active = 1
    `).all();
    
    console.log(`Found ${dirEntries.length} directory entries to migrate`);
    
    if (dirEntries.length === 0) {
      console.log('No directory entries found to migrate');
      return;
    }
    
    // Start transaction for migration
    const migrateTransaction = usersDb.transaction((entries) => {
      const insertUser = usersDb.prepare(`
        INSERT OR REPLACE INTO users (
          id, email, phone, created_at, updated_at, last_login,
          is_active, failed_login_attempts, locked_until, first_name, last_name, middle_name, 
          suffix, nickname, photo_url, primary_email, secondary_email, home_phone, mobile_phone, 
          work_phone, address_street, address_city, address_state, address_zip, 
          address_country, spouse_name, children_names, anniversary_date, 
          occupation, company, status, ministries, categories, is_featured, 
          reset_token, reset_token_expiry
        ) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      for (const entry of entries) {
        // Parse JSON fields from directory
        const ministries = entry.ministry_areas ? JSON.parse(entry.ministry_areas) : [];
        const categories = entry.categories ? JSON.parse(entry.categories) : [];
        const childrenNames = entry.children_names ? JSON.parse(entry.children_names) : [];
        
        // Generate email if missing (use name + @ohbc.local)
        const email = entry.primary_email || `${entry.first_name.toLowerCase()}.${entry.last_name.toLowerCase()}@ohbc.local`;
        
        // Map directory entry to user table structure
        const userRecord = {
          id: entry.id,
          email: email,
          phone: entry.home_phone || entry.mobile_phone || null,
          first_name: entry.first_name || '',
          last_name: entry.last_name || '',
          middle_name: entry.middle_name || null,
          suffix: entry.suffix || null,
          nickname: entry.nickname || null,
          photo_url: entry.photo_url || null,
          primary_email: entry.primary_email || null,
          secondary_email: entry.secondary_email || null,
          home_phone: entry.home_phone || null,
          mobile_phone: entry.mobile_phone || null,
          work_phone: entry.work_phone || null,
          address_street: entry.address_street || null,
          address_city: entry.address_city || null,
          address_state: entry.address_state || null,
          address_zip: entry.address_zip || null,
          address_country: entry.address_country || null,
          spouse_name: entry.spouse_name || null,
          children_names: JSON.stringify(childrenNames),
          anniversary_date: entry.anniversary_date || null,
          occupation: entry.occupation || null,
          company: entry.company || null,
          status: entry.membership_status === 'Active' ? 'Active' : 'Inactive',
          ministries: JSON.stringify(ministries),
          categories: JSON.stringify(categories),
          is_active: entry.is_active ? 1 : 0,
          is_featured: entry.is_featured ? 1 : 0,
          reset_token: null,
          reset_token_expiry: null
        };
        
        insertUser.run(
          userRecord.id,
          userRecord.email,
          userRecord.phone || null,
          userRecord.is_active,
          0, // failed_login_attempts
          null, // locked_until
          userRecord.first_name,
          userRecord.last_name,
          userRecord.middle_name,
          userRecord.suffix,
          userRecord.nickname,
          userRecord.photo_url,
          userRecord.primary_email,
          userRecord.secondary_email,
          userRecord.home_phone,
          userRecord.mobile_phone,
          userRecord.work_phone,
          userRecord.address_street,
          userRecord.address_city,
          userRecord.address_state,
          userRecord.address_zip,
          userRecord.address_country,
          userRecord.spouse_name,
          userRecord.children_names,
          userRecord.anniversary_date,
          userRecord.occupation,
          userRecord.company,
          userRecord.status,
          userRecord.ministries,
          userRecord.categories,
          userRecord.is_featured,
          userRecord.reset_token,
          userRecord.reset_token_expiry
        );
        
        console.log(`Migrated user: ${userRecord.first_name} ${userRecord.last_name} (ID: ${userRecord.id})`);
      }
    });
    
    // Execute migration transaction
    migrateTransaction(dirEntries);
    
    console.log('Migration completed successfully!');
    
    // Get statistics
    const totalUsers = usersDb.prepare('SELECT COUNT(*) as count FROM users').get();
    const activeUsers = usersDb.prepare('SELECT COUNT(*) as count FROM users WHERE is_active = 1').get();
    const featuredUsers = usersDb.prepare('SELECT COUNT(*) as count FROM users WHERE is_featured = 1').get();
    
    console.log('\n=== Migration Statistics ===');
    console.log(`Total users migrated: ${totalUsers.count}`);
    console.log(`Active users: ${activeUsers.count}`);
    console.log(`Featured users: ${featuredUsers.count}`);
    
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    dirDb.close();
    usersDb.close();
  }
}

// Function to create basic admin user if none exists
async function createAdminUser() {
  console.log('Checking for admin user...');
  
  const usersDb = getUsersDb();
  
  try {
    const existingAdmin = usersDb.prepare(`
      SELECT id FROM users WHERE email = 'admin@ohbc.local'
    `).get();
    
    if (!existingAdmin) {
      console.log('Creating default admin user...');
      
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const insertAdmin = usersDb.prepare(`
        INSERT INTO users (
          email, password_hash, first_name, last_name, role, status, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'Super Admin', 'Active', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      
      insertAdmin.run('admin@ohbc.local', hashedPassword, 'Admin', 'User');
      console.log('Default admin user created: admin@ohbc.local / admin123');
      console.log('IMPORTANT: Change this password immediately after first login!');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  } finally {
    usersDb.close();
  }
}

// Run migration and create admin user
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1] === __filename) {
  ensureUsersTableStructure()
    .then(() => {
      console.log('Table structure ensured, starting migration...');
      return migrateDirectoryToUsers();
    })
    .then(() => {
      console.log('\nDirectory migration complete!');
      return createAdminUser();
    })
    .then(() => {
      console.log('\nMigration and setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
