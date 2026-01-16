// Use CommonJS require syntax for better compatibility
const { getRepository } = require('../src/lib/db/database');
const { User } = require('../src/models/User');

async function checkUsers() {
  try {
    console.log('🔍 Connecting to database...');
    const userRepository = await getRepository(User);
    
    // List all users
    console.log('\n👥 Listing all users in the database:');
    const users = await userRepository.find();
    
    if (users.length === 0) {
      console.log('No users found in the database.');
      console.log('\nTo create a test user, please use the registration form at:');
      console.log('http://localhost:3000/register');
    } else {
      users.forEach(user => {
        console.log(`- ${user.email} (${user.role || 'no role'}) ${user.isActive ? '✅ Active' : '❌ Inactive'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error accessing database:', error.message);
    console.error('\nThis might be due to:');
    console.error('1. Database not running');
    console.error('2. Incorrect database configuration in .env.local');
    console.error('3. Database tables not initialized');
    console.error('\nPlease check your database connection and try again.');
  } finally {
    process.exit(0);
  }
}

// Run the function
checkUsers();
