// @ts-check
const { DataSource } = require('typeorm');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function checkDatabase() {
  console.log('Checking database connection...');
  
  const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ohbc_lite',
    synchronize: false,
    logging: true,
    entities: [path.join(__dirname, '../src/entities/*.js')],
  });

  try {
    // Initialize the data source
    await AppDataSource.initialize();
    console.log('Database connection established successfully!');

    // Check if users table exists
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    
    const hasUsersTable = await queryRunner.hasTable('user');
    console.log(`Users table exists: ${hasUsersTable}`);
    
    if (hasUsersTable) {
      // List all users (be careful with this in production!)
      const users = await queryRunner.query('SELECT id, email, firstName, lastName, role FROM user LIMIT 10');
      console.log('\nUsers in the database:');
      console.table(users);
    }
    
    await queryRunner.release();
  } catch (error) {
    console.error('Error connecting to the database:');
    console.error(error);
  } finally {
    // Close the connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed.');
    }
    process.exit(0);
  }
}

// Run the check
checkDatabase();
