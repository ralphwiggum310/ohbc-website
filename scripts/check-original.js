import Database from 'better-sqlite3';
import path from 'path';

const dirDb = new Database(path.join(process.cwd(), 'data', 'directory', 'ohbc_directory.db'));

try {
  const withMinistries = dirDb.prepare("SELECT COUNT(*) as count FROM directory_entries WHERE ministry_areas IS NOT NULL AND ministry_areas != '[]' AND ministry_areas != ''").get();
  const featured = dirDb.prepare('SELECT COUNT(*) as count FROM directory_entries WHERE is_featured = 1').get();
  
  const sampleMinistries = dirDb.prepare('SELECT id, first_name, ministry_areas, is_featured FROM directory_entries WHERE ministry_areas IS NOT NULL LIMIT 3').all();
  
  console.log('Original directory - Users with ministries:', withMinistries.count);
  console.log('Original directory - Featured users:', featured.count);
  console.log('Sample original ministry data:');
  sampleMinistries.forEach(user => {
    console.log('ID:', user.id, 'Name:', user.first_name, 'Featured:', user.is_featured, 'Ministries:', user.ministry_areas);
  });
  
} catch (error) {
  console.error('Error:', error.message);
} finally {
  dirDb.close();
}
