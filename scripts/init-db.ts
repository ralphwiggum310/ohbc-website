import 'reflect-metadata';
import { AppDataSource } from '../src/lib/db/data-source';
import { User } from '../src/entities/User';
import { UserRole } from '../src/entities/User';
import bcrypt from 'bcryptjs';

async function initializeDatabase() {
  try {
    // Initialize the database connection
    await AppDataSource.initialize();
    console.log('Database connection established');

    // Check if admin user exists
    const userRepository = AppDataSource.getRepository(User);
    const adminUser = await userRepository.findOne({ where: { email: 'admin@ohbc.org' } });

    if (!adminUser) {
      // Create default admin user
      const admin = new User();
      admin.email = 'admin@ohbc.org';
      admin.password = 'admin123'; // Default password, should be changed after first login
      admin.firstName = 'Admin';
      admin.lastName = 'User';
      admin.role = 'admin';
      admin.isActive = true;
      
      // Hash the password
      await admin.hashPassword();
      
      // Save the admin user
      await userRepository.save(admin);
      
      console.log('Default admin user created:');
      console.log('Email: admin@ohbc.org');
      console.log('Password: admin123');
      console.log('IMPORTANT: Change this password after first login!');
    }

    console.log('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:');
    if (error instanceof Error) {
      console.error(error.message);
      console.error(error.stack);
    } else {
      console.error('Unknown error:', error);
    }
    process.exit(1);
  }
}

// Self-executing async function to handle top-level await
(async () => {
  try {
    await initializeDatabase();
    process.exit(0);
  } catch (error) {
    console.error('Unhandled error in initialization:', error);
    process.exit(1);
  }
})();
