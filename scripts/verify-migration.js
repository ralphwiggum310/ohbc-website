import Database from 'better-sqlite3';
import path from 'path';

const usersDb = new Database(path.join(process.cwd(), 'data', 'users', 'ohbc_users.db'));

try {
  const totalUsers = usersDb.prepare('SELECT COUNT(*) as count FROM users').get();
  const migratedUsers = usersDb.prepare("SELECT COUNT(*) as count FROM users WHERE password_hash = 'migrated_user_temp_hash'").get();
  const sampleUsers = usersDb.prepare('SELECT id, first_name, last_name, email, primary_email, membership_status FROM users LIMIT 5').all();
  
  console.log('=== MIGRATION RESULTS ===');
  console.log('Total users in database:', totalUsers.count);
  console.log('Migrated directory users:', migratedUsers.count);
  console.log('');
  console.log('Sample migrated users:');
  sampleUsers.forEach(user => {
    console.log('- ID:', user.id, '| Name:', user.first_name, user.last_name, '| Email:', user.email, '| Primary:', user.primary_email, '| Status:', user.membership_status);
  });
  
} catch (error) {
  console.error('Error:', error.message);
} finally {
  usersDb.close();
}
