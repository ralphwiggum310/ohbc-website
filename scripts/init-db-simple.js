// Simple database initialization script using CommonJS
const { DataSource, EntitySchema } = require('typeorm');
const path = require('path');
const bcrypt = require('bcryptjs');

// Database configuration
const dbPath = path.join(process.cwd(), 'data', 'ohbc-dev.db');

// Create data directory if it doesn't exist
const fs = require('fs');
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('Created data directory');
}

// Define a simple User entity using EntitySchema
function createUserEntitySchema() {
  return {
    name: 'User',
    tableName: 'users',
    columns: {
      id: {
        primary: true,
        type: 'varchar',
        generated: 'uuid',
      },
      email: {
        type: 'varchar',
        unique: true,
      },
      password: {
        type: 'varchar',
      },
      firstName: {
        type: 'varchar',
        name: 'first_name',
      },
      lastName: {
        type: 'varchar',
        name: 'last_name',
      },
      role: {
        type: 'varchar',
        default: 'guest',
      },
      isActive: {
        type: 'boolean',
        name: 'is_active',
        default: true,
      },
      lastLogin: {
        type: 'datetime',
        name: 'last_login',
        nullable: true,
      },
      createdAt: {
        type: 'datetime',
        name: 'created_at',
        createDate: true,
      },
      updatedAt: {
        type: 'datetime',
        name: 'updated_at',
        updateDate: true,
      },
    },
  };
}

// User class for type safety
class User {
  constructor() {
    this.id = undefined;
    this.email = '';
    this.password = '';
    this.firstName = '';
    this.lastName = '';
    this.role = 'guest';
    this.isActive = true;
    this.lastLogin = null;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

// Initialize the database
async function initializeDatabase() {
  console.log('Initializing database...');
  console.log(`Database path: ${dbPath}`);
  
  // Create the data source with our entity
  const userSchema = createUserEntitySchema();
  const UserEntity = new EntitySchema(userSchema);
  
  const AppDataSource = new DataSource({
    type: 'better-sqlite3',
    database: dbPath,
    entities: [UserEntity],
    synchronize: true, // Let TypeORM handle the schema sync
    logging: ['error', 'schema'],
  });
  
  try {
    // Initialize the connection and sync schema
    console.log('Initializing database connection and syncing schema...');
    const dataSource = await AppDataSource.initialize();
    console.log('Database connection established and schema synchronized');
    
    // Get the repository after initialization
    const userRepository = dataSource.getRepository(userSchema.name);

    // Check if admin user exists
    const adminUser = await userRepository.findOne({ where: { email: 'admin@ohbc.org' } });

    if (!adminUser) {
      // Create default admin user
      const admin = {
        email: 'admin@ohbc.org',
        password: await bcrypt.hash('admin123', 10),
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Save the admin user
      await userRepository.insert(admin);
      
      console.log('\nDefault admin user created:');
      console.log('Email: admin@ohbc.org');
      console.log('Password: admin123');
      console.log('IMPORTANT: Change this password after first login!\n');
    } else {
      console.log('Admin user already exists');
    }

    console.log('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('\n=== ERROR INITIALIZING DATABASE ===');
    console.error('Error:', error.message);
    if (error.sql) {
      console.error('SQL:', error.sql);
    }
    console.error('\nStack trace:');
    console.error(error.stack);
    console.error('\nPlease check the database file and try again.');
    console.log('\nIf the issue persists, you may need to:');
    console.log('1. Delete the database file at:', dbPath);
    console.log('2. Check file permissions');
    console.log('3. Ensure no other process is using the database');
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase();
