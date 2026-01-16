import { getDatabase, closeDatabase } from '../src/lib/db/database';
import { User } from '../src/models/User';
import * as bcrypt from 'bcryptjs';

async function testDatabaseConnection() {
  try {
    // Initialize the database connection
    const dataSource = await getDatabase();
    console.log('✅ Database connection established successfully');

    // Get user repository
    const userRepository = dataSource.getRepository(User);
    
    // Test user data
    const testUser = {
      firstName: 'Test',
      lastName: 'User',
      email: `test-${Date.now()}@example.com`,
      password: await bcrypt.hash('Test123!', 10),
      role: 'member' as const,
      isActive: true
    };

    // Create a test user
    const user = userRepository.create(testUser);
    await userRepository.save(user);
    console.log('✅ Test user created successfully');

    // Find the test user
    const foundUser = await userRepository.findOne({
      where: { email: testUser.email }
    });
    
    if (foundUser) {
      console.log('✅ Test user found in database');
      console.log('User details:', {
        id: foundUser.id,
        email: foundUser.email,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        role: foundUser.role,
        isActive: foundUser.isActive,
        createdAt: foundUser.createdAt
      });
    } else {
      console.error('❌ Test user not found in database');
    }

  } catch (error) {
    console.error('❌ Error testing database connection:', error);
  } finally {
    // Close the database connection
    await closeDatabase();
  }
}

// Run the test
testDatabaseConnection();
