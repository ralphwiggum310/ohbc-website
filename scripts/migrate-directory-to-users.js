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
          id, first_name, last_name, middle_name, suffix, nickname, 
          photo_url, primary_email, secondary_email, home_phone, mobile_phone, 
          work_phone, address_street, address_city, address_state, address_zip, 
          address_country, spouse_name, children_names, anniversary_date, 
          occupation, company, status, ministries, categories, is_active, 
          is_featured, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      
      for (const entry of entries) {
        // Parse JSON fields from directory
        const ministries = entry.ministry_areas ? JSON.parse(entry.ministry_areas) : [];
        const categories = entry.categories ? JSON.parse(entry.categories) : [];
        const childrenNames = entry.children_names ? JSON.parse(entry.children_names) : [];
        
        // Map directory entry to user table structure
        const userRecord = {
          id: entry.id,
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
          is_featured: entry.is_featured ? 1 : 0
        };
        
        insertUser.run(
          userRecord.id,
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
          userRecord.is_active,
          userRecord.is_featured
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
          email, password, first_name, last_name, status, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'Active', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
  migrateDirectoryToUsers()
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
