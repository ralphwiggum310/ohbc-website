const { AppDataSource } = require('../src/lib/db/data-source');

async function testConnection() {
  try {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    console.log('Successfully connected to the database!');
    
    // Check if users table exists
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    
    const hasUsersTable = await queryRunner.hasTable('user');
    console.log(`Users table exists: ${hasUsersTable}`);
    
    if (hasUsersTable) {
      const users = await queryRunner.query('SELECT id, email, firstName, lastName, role FROM user LIMIT 5');
      console.log('\nUsers in the database:');
      console.table(users);
    }
    
    await queryRunner.release();
  } catch (error) {
    console.error('Error connecting to the database:');
    console.error(error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed.');
    }
    process.exit(0);
  }
}

testConnection();
