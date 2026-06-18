import Database from 'better-sqlite3';
import path from 'path';

const usersDb = new Database(path.join(process.cwd(), 'data', 'users', 'ohbc_users.db'));

// Helper function to convert to proper case
function toProperCase(str) {
  if (!str || str.length === 0) return str;
  
  // Handle special cases
  const lowerStr = str.toLowerCase();
  
  // Handle names starting with Mc, Mac, O', etc.
  if (lowerStr.startsWith('mc') && lowerStr.length > 2) {
    return 'Mc' + lowerStr.charAt(2).toUpperCase() + lowerStr.slice(3);
  }
  if (lowerStr.startsWith('mac') && lowerStr.length > 3) {
    return 'Mac' + lowerStr.charAt(3).toUpperCase() + lowerStr.slice(4);
  }
  if (lowerStr.startsWith("o'") && lowerStr.length > 2) {
    return "O'" + lowerStr.charAt(2).toUpperCase() + lowerStr.slice(3);
  }
  
  // Default: first letter uppercase, rest lowercase
  return lowerStr.charAt(0).toUpperCase() + lowerStr.slice(1);
}

try {
  const users = usersDb.prepare('SELECT id, first_name, last_name FROM users').all();
  
  console.log('Fixing first name casing for', users.length, 'users...');
  
  let updated = 0;
  for (const user of users) {
    let needsUpdate = false;
    let fixedFirstName = user.first_name;
    let fixedLastName = user.last_name;
    
    // Fix first name
    if (user.first_name && user.first_name.length > 1) {
      const properFirstName = toProperCase(user.first_name);
      if (properFirstName !== user.first_name) {
        fixedFirstName = properFirstName;
        needsUpdate = true;
      }
    }
    
    // Fix last name (handle Mcgee, etc.)
    if (user.last_name && user.last_name.length > 1) {
      const properLastName = toProperCase(user.last_name);
      if (properLastName !== user.last_name) {
        fixedLastName = properLastName;
        needsUpdate = true;
      }
    }
    
    if (needsUpdate) {
      usersDb.prepare('UPDATE users SET first_name = ?, last_name = ? WHERE id = ?')
        .run(fixedFirstName, fixedLastName, user.id);
      
      console.log('Updated:', user.first_name, user.last_name, '→', fixedFirstName, fixedLastName);
      updated++;
    }
  }
  
  console.log('Successfully updated', updated, 'names');
  
  // Show sample results
  const sampleUsers = usersDb.prepare('SELECT id, first_name, last_name FROM users ORDER BY last_name LIMIT 8').all();
  console.log('\nSample updated names:');
  sampleUsers.forEach(user => {
    console.log('ID:', user.id, '| First:', user.first_name, '| Last:', user.last_name);
  });
  
} catch (error) {
  console.error('Error:', error.message);
} finally {
  usersDb.close();
}
