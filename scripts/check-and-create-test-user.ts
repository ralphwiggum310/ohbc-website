import { getRepository } from '../src/lib/db/database';
import { User } from '../src/models/User';
import * as bcrypt from 'bcryptjs';

async function createTestUser() {
  try {
    const userRepository = await getRepository(User);
    
    // Check if test user already exists
    const testEmail = 'test@example.com';
    let user = await userRepository.findOne({ where: { email: testEmail } });
    
    if (!user) {
      console.log('Creating test user...');
      user = new User();
      user.email = testEmail;
      user.firstName = 'Test';
      user.lastName = 'User';
      user.role = 'admin';
      user.isActive = true;
      
      // Set password using the same hashing mechanism as in the User model
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash('Test@1234', salt);
      
      await userRepository.save(user);
      console.log('Test user created successfully!');
      console.log('Email: test@example.com');
      console.log('Password: Test@1234');
    } else {
      console.log('Test user already exists:');
      console.log('Email: test@example.com');
      console.log('Password: Test@1234');
    }
    
    // List all users
    const users = await userRepository.find();
    console.log('\nAll users in the database:');
    users.forEach(u => {
      console.log(`- ${u.email} (${u.role}) ${u.isActive ? 'Active' : 'Inactive'}`);
    });
    
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    process.exit(0);
  }
}

// Run the function
createTestUser();
