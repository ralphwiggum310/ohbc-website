// Use CommonJS require for better compatibility with ts-node
const path = require('path');
const { getRepository, closeDatabase } = require('../src/lib/db/database');
const { User } = require('../src/models/User');
const bcrypt = require('bcryptjs');

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
    throw error;
  }
}

// Run the test
(async () => {
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
})();
