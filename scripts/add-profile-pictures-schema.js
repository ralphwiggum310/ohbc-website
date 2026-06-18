import Database from 'better-sqlite3';
import path from 'path';

const usersDb = new Database(path.join(process.cwd(), 'data', 'users', 'ohbc_users.db'));

try {
  console.log('Adding profile picture management schema...');
  
  // Add profile picture columns to users table if they don't exist
  const columns = [
    {
      name: 'profile_picture_filename',
      sql: 'TEXT DEFAULT NULL'
    },
    {
      name: 'profile_picture_status', 
      sql: "TEXT DEFAULT 'none' CHECK (profile_picture_status IN ('none', 'pending', 'approved', 'rejected'))"
    },
    {
      name: 'profile_picture_uploaded_at',
      sql: 'DATETIME DEFAULT NULL'
    },
    {
      name: 'profile_picture_reviewed_at',
      sql: 'DATETIME DEFAULT NULL'
    },
    {
      name: 'profile_picture_reviewed_by',
      sql: 'INTEGER DEFAULT NULL'
    },
    {
      name: 'profile_picture_rejection_reason',
      sql: 'TEXT DEFAULT NULL'
    }
  ];
  
  for (const column of columns) {
    try {
      usersDb.prepare(`ALTER TABLE users ADD COLUMN ${column.name} ${column.sql}`).run();
      console.log(`✅ Added column: ${column.name}`);
    } catch (error) {
      if (error.message.includes('duplicate column name')) {
        console.log(`⚠️  Column ${column.name} already exists`);
      } else {
        console.error(`❌ Error adding column ${column.name}:`, error.message);
      }
    }
  }
  
  // Create profile picture review table for admin tracking
  const createReviewTable = `
    CREATE TABLE IF NOT EXISTS profile_picture_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reviewed_at DATETIME DEFAULT NULL,
      reviewed_by INTEGER DEFAULT NULL,
      rejection_reason TEXT DEFAULT NULL,
      admin_notes TEXT DEFAULT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (reviewed_by) REFERENCES users(id)
    )
  `;
  
  usersDb.exec(createReviewTable);
  console.log('✅ Created profile_picture_reviews table');
  
  // Create index for faster queries
  try {
    usersDb.exec('CREATE INDEX IF NOT EXISTS idx_profile_reviews_status ON profile_picture_reviews(status)');
    usersDb.exec('CREATE INDEX IF NOT EXISTS idx_profile_reviews_user ON profile_picture_reviews(user_id)');
    console.log('✅ Created indexes for profile picture reviews');
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
  }
  
  console.log('\n🎉 Profile picture management schema added successfully!');
  
} catch (error) {
  console.error('❌ Error updating database schema:', error.message);
} finally {
  usersDb.close();
}
