// Simple test script in JavaScript to verify SQLite connection
const { DataSource } = require('typeorm');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'ohbc_lite_test.db');
console.log(`Using database at: ${dbPath}`);

// Simple test entity
const TestEntity = new DataSource({
  type: 'better-sqlite3', // Using better-sqlite3 for better compatibility
  database: dbPath,
  entities: [
    {
      name: 'TestEntity',
      columns: {
        id: {
          primary: true,
          type: 'integer',
          generated: 'increment',
        },
        name: {
          type: 'varchar',
        },
        value: {
          type: 'text',
        },
      },
    },
  ],
  synchronize: true,
  logging: true,
});

async function runTest() {
  try {
    console.log('Initializing database...');
    const dataSource = await TestEntity.initialize();
    console.log('Database initialized!');

    const repo = dataSource.getRepository('TestEntity');
    
    // Create a test entity
    const test = {
      name: 'test',
      value: 'Hello, SQLite!',
    };
    
    console.log('Saving test entity...');
    const saved = await repo.save(test);
    console.log('Test entity saved with ID:', saved.id);
    
    // Read it back
    const found = await repo.findOne({ where: { name: 'test' } });
    console.log('Found entity:', found);
    
    return '✅ Test completed successfully!';
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  } finally {
    if (TestEntity.isInitialized) {
      await TestEntity.destroy();
    }
  }
}

// Run the test
runTest()
  .then(console.log)
  .catch(console.error)
  .finally(() => process.exit(0));
