import { DataSource } from 'typeorm';
import { User } from '../../models/User';
import path from 'path';
import { isServer, assertServerSide } from './server-only';

// Create the data directory if it doesn't exist
const ensureDataDirectory = async () => {
  if (!isServer()) return;
  
  try {
    const fs = await import('fs/promises');
    const dir = path.join(process.cwd(), 'data');
    await fs.mkdir(dir, { recursive: true });
  } catch (error: any) {
    if (error.code !== 'EEXIST') {
      console.error('Error creating data directory:', error);
    }
  }
};

// Initialize the data directory
if (isServer()) {
  ensureDataDirectory().catch(console.error);
}

// Database file path
const databasePath = path.join(process.cwd(), 'data', 'ohbc_lite.sqlite');

// Database configuration for better-sqlite3
let AppDataSource: DataSource | null = null;

// Initialize the database connection
async function initializeDataSource(): Promise<DataSource> {
  assertServerSide();

  const dataSource = new DataSource({
    type: 'better-sqlite3',
    database: databasePath,
    synchronize: true, // Auto-create database schema
    logging: process.env.NODE_ENV !== 'production' ? ['error', 'warn'] : ['error'],
    entities: [User],
    migrations: [],
    subscribers: [],
  });

  return dataSource.initialize();
}

// Global promise to prevent multiple connections
let connection: Promise<DataSource> | null = null;

export async function getDatabase(): Promise<DataSource> {
  assertServerSide();

  if (!connection) {
    connection = (async () => {
      if (!AppDataSource) {
        AppDataSource = await initializeDataSource();
      } else if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      return AppDataSource;
    })();
  }

  return connection;
}

export async function getRepository<T>(entity: new () => T) {
  assertServerSide();
  const dataSource = await getDatabase();
  return dataSource.getRepository(entity);
}

export async function closeDatabase() {
  assertServerSide();

  if (AppDataSource?.isInitialized) {
    await AppDataSource.destroy();
    AppDataSource = null;
    connection = null;
  }
}

// Handle application shutdown
process.on('SIGINT', async () => {
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDatabase();
  process.exit(0);
});
