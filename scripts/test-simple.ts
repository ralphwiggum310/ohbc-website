// Simple test script to verify SQLite connection
import { DataSource } from 'typeorm';
import { User } from '../src/models/User';
import * as path from 'path';
import * as fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'ohbc_lite.sqlite');
console.log(`Using database at: ${dbPath}`);

// Create a simple test entity
@Entity('test_entity')
class TestEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  value!: string;
}

async function runTest() {
  // Create a simple data source
  const AppDataSource = new DataSource({
    type: 'sqlite',
    database: dbPath,
    entities: [TestEntity],
    synchronize: true,
    logging: true,
  });

  try {
    console.log('Initializing database...');
    const dataSource = await AppDataSource.initialize();
    console.log('Database initialized!');

    const repo = dataSource.getRepository(TestEntity);
    
    // Create a test entity
    const test = new TestEntity();
    test.name = 'test';
    test.value = 'Hello, SQLite!';
    
    console.log('Saving test entity...');
    await repo.save(test);
    console.log('Test entity saved!');
    
    // Read it back
    const found = await repo.findOne({ where: { name: 'test' } });
    console.log('Found entity:', found);
    
    return '✅ Test completed successfully!';
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

runTest()
  .then(console.log)
  .catch(console.error)
  .finally(() => process.exit(0));
