import Database from 'better-sqlite3';
import path from 'path';

const usersDb = new Database(path.join(process.cwd(), 'data', 'users', 'ohbc_users.db'));

try {
  const users = usersDb.prepare('SELECT id, first_name, last_name FROM users').all();
  
  console.log('Fixing last name casing for', users.length, 'users...');
  
  let updated = 0;
  for (const user of users) {
    if (user.last_name && user.last_name.length > 1) {
      // Convert to proper case: First letter uppercase, rest lowercase
      const fixedLastName = user.last_name.charAt(0).toUpperCase() + user.last_name.slice(1).toLowerCase();
      
      if (fixedLastName !== user.last_name) {
        usersDb.prepare('UPDATE users SET last_name = ? WHERE id = ?')
          .run(fixedLastName, user.id);
        
        console.log('Updated:', user.last_name, '→', fixedLastName);
        updated++;
      }
    }
  }
  
  console.log('Successfully updated', updated, 'last names');
  
  // Show sample results
  const sampleUsers = usersDb.prepare('SELECT id, first_name, last_name FROM users ORDER BY last_name LIMIT 5').all();
  console.log('\nSample updated names:');
  sampleUsers.forEach(user => {
    console.log('ID:', user.id, '| First:', user.first_name, '| Last:', user.last_name);
  });
  
} catch (error) {
  console.error('Error:', error.message);
} finally {
  usersDb.close();
}
