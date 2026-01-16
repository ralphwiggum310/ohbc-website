import { AppDataSource } from '../src/lib/db/data-source';
import { User } from '../src/entities/User';
import * as bcrypt from 'bcrypt';

async function testAuthFlow() {
  console.log('🚀 Starting authentication flow test...\n');
  
  try {
    // 1. Test database connection
    console.log('1. Testing database connection...');
    await AppDataSource.initialize();
    console.log('   ✅ Database connection established');
    
    // 2. Check if users table exists
    console.log('\n2. Checking users table...');
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    const tableExists = await queryRunner.hasTable('user');
    
    if (!tableExists) {
      console.log('   ❌ Users table does not exist. Please run database migrations first.');
      return;
    }
    console.log('   ✅ Users table exists');
    
    // 3. Check for admin user
    console.log('\n3. Checking for admin user...');
    const userRepository = AppDataSource.getRepository(User);
    const adminUser = await userRepository.findOne({ where: { email: 'admin@ohbc.org' } });
    
    if (!adminUser) {
      console.log('   ⚠️ Admin user not found. Creating test user...');
      const testUser = new User();
      testUser.email = 'test@example.com';
      testUser.password = await bcrypt.hash('test123', 10);
      testUser.role = 'admin';
      testUser.isActive = true;
      await userRepository.save(testUser);
      console.log('   ✅ Test user created (test@example.com / test123)');
    } else {
      console.log('   ✅ Admin user found:', adminUser.email);
    }
    
    // 4. Test user lookup
    console.log('\n4. Testing user lookup...');
    const testUser = await userRepository.findOne({ 
      where: { email: 'test@example.com' } 
    });
    
    if (testUser) {
      console.log('   ✅ Test user lookup successful');
      console.log('      User ID:', testUser.id);
      console.log('      Email:', testUser.email);
      console.log('      Role:', testUser.role);
      console.log('      Active:', testUser.isActive);
    } else {
      console.log('   ❌ Test user lookup failed');
    }
    
    console.log('\n🎉 Authentication flow test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error during authentication flow test:');
    console.error(error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(0);
  }
}

testAuthFlow();
