const { AppDataSource } = require('../src/lib/db/data-source');
const { User } = require('../src/entities/User');

async function checkAuthSetup() {
  try {
    // Initialize the database connection
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    // Check if the users table exists
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    const tableExists = await queryRunner.hasTable('user');
    
    if (!tableExists) {
      console.log('❌ Users table does not exist. Running database synchronization...');
      await AppDataSource.synchronize();
      console.log('✅ Database synchronized');
    } else {
      console.log('✅ Users table exists');
    }

    // Check if admin user exists
    const userRepository = AppDataSource.getRepository(User);
    const adminUser = await userRepository.findOne({ where: { email: 'admin@ohbc.org' } });

    if (!adminUser) {
      console.log('❌ Admin user not found. Creating admin user...');
      const newAdmin = new User();
      newAdmin.name = 'Admin';
      newAdmin.email = 'admin@ohbc.org';
      newAdmin.role = 'admin';
      newAdmin.isActive = true;
      // Default password: admin123 (you should change this in production)
      newAdmin.password = await require('bcrypt').hash('admin123', 10);
      
      await userRepository.save(newAdmin);
      console.log('✅ Admin user created');
      console.log('   Email: admin@ohbc.org');
      console.log('   Password: admin123');
    } else {
      console.log('✅ Admin user exists');
      console.log('   Email:', adminUser.email);
      console.log('   Role:', adminUser.role);
      console.log('   Active:', adminUser.isActive);
    }

    console.log('\nAuthentication setup check completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking authentication setup:', error);
    process.exit(1);
  }
}

checkAuthSetup();
