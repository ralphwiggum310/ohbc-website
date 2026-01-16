import 'reflect-metadata';
import { AppDataSource } from '../src/lib/db/data-source';
import { User } from '../src/models/User';
import * as bcrypt from 'bcryptjs';

async function createTestUser() {
  try {
    // Initialize the database connection
    await AppDataSource.initialize();
    console.log('Database connection established');

    const userRepository = AppDataSource.getRepository(User);
    
    // Check if test user already exists
    const existingUser = await userRepository.findOne({ 
      where: { email: 'test@example.com' } 
    });

    if (existingUser) {
      console.log('Test user already exists');
      console.log('Email: test@example.com');
      console.log('Password: Test@1234');
      process.exit(0);
    }

    // Create test user
    const testUser = new User();
    testUser.email = 'test@example.com';
    testUser.password = 'Test@1234'; // Will be hashed in beforeInsert
    testUser.firstName = 'Test';
    testUser.lastName = 'User';
    testUser.role = 'member';
    testUser.isActive = true;
    testUser.emailVerified = true;

    // Save the test user
    await userRepository.save(testUser);
    
    console.log('Test user created successfully');
    console.log('Email: test@example.com');
    console.log('Password: Test@1234');
    console.log('IMPORTANT: This is a test account. Please use strong credentials in production!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

// Run the script
createTestUser();
