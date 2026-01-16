// Use require for CommonJS modules in this script
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use dynamic import for ESM modules
const { getRepository, closeDatabase } = await import('../src/lib/db/database.js');
const { User } = await import('../src/models/User.js');
import * as bcrypt from 'bcryptjs';

// Add error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

async function testDatabase() {
  try {
    console.log('Starting database test...');
    
    // Get the user repository
    const userRepository = await getRepository(User);
    
    // Test creating a user
    const testUser = new User();
    testUser.email = 'test@example.com';
    testUser.password = 'testpassword123';
    testUser.firstName = 'Test';
    testUser.lastName = 'User';
    testUser.role = 'admin';
    
    console.log('Creating test user...');
    const savedUser = await userRepository.save(testUser);
    console.log('User created:', { 
      id: savedUser.id, 
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      role: savedUser.role,
      isActive: savedUser.isActive,
      createdAt: savedUser.createdAt
    });
    
    // Test finding a user
    console.log('\nFinding user by email...');
    const foundUser = await userRepository.findOne({ where: { email: 'test@example.com' } });
    if (foundUser) {
      console.log('Found user:', foundUser.email);
      
      // Test password comparison
      const isMatch = await foundUser.comparePassword('testpassword123');
      console.log('Password match test:', isMatch ? '✅ Passwords match' : '❌ Passwords do not match');
      
      // Test updating a user
      foundUser.lastLogin = new Date();
      await userRepository.save(foundUser);
      console.log('Updated last login:', foundUser.lastLogin);
      
      // Test deleting the user
      await userRepository.remove(foundUser);
      console.log('Test user deleted');
    } else {
      console.log('User not found');
    }
    
    console.log('\n✅ Database test completed successfully!');
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    // Close the database connection
    const { closeDatabase } = await import('../src/lib/db/database');
    await closeDatabase();
    process.exit(0);
  }
}

try {
  await testDatabase();
} catch (error) {
  console.error('Test failed with error:', error);
  process.exit(1);
} finally {
  // Ensure database connection is closed
  await closeDatabase();
  process.exit(0);
}
