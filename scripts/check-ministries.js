import Database from 'better-sqlite3';
import path from 'path';

const usersDb = new Database(path.join(process.cwd(), 'data', 'users', 'ohbc_users.db'));

try {
  // Check for ministry_areas data
  const withMinistries = usersDb.prepare("SELECT COUNT(*) as count FROM users WHERE ministry_areas IS NOT NULL AND ministry_areas != '[]' AND ministry_areas != ''").get();
  const featured = usersDb.prepare('SELECT COUNT(*) as count FROM users WHERE is_featured = 1').get();
  
  // Sample ministry_areas data
  const sampleMinistries = usersDb.prepare('SELECT id, first_name, ministry_areas FROM users WHERE ministry_areas IS NOT NULL LIMIT 3').all();
  
  console.log('Users with ministries:', withMinistries.count);
  console.log('Featured users:', featured.count);
  console.log('Sample ministry data:');
  sampleMinistries.forEach(user => {
    console.log('ID:', user.id, 'Name:', user.first_name, 'Ministries:', user.ministry_areas);
  });
  
} catch (error) {
  console.error('Error:', error.message);
} finally {
  usersDb.close();
}
