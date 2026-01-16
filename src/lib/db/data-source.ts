import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../../entities/User';
import { Member } from '../../entities/Member';
import { PrayerRequest } from '../../entities/PrayerRequest';
import { Schedule } from '../../entities/Schedule';
import { ScheduleAttendance } from '../../entities/ScheduleAttendance';
import path from 'path';

// Determine the database file path
const isProduction = process.env.NODE_ENV === 'production';
const dbPath = isProduction
  ? path.join(process.cwd(), 'data', 'ohbc.db')
  : path.join(process.cwd(), 'data', 'ohbc-dev.db');

// SQLite database configuration
export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: dbPath,
  synchronize: !isProduction, // Auto-create tables in development
  logging: !isProduction,
  // Enable WAL mode for better concurrency
  extra: {
    enableWAL: true,
    timeout: 30000, // 30 seconds
  },
  entities: [User, Member, PrayerRequest, Schedule, ScheduleAttendance],
  migrations: [path.join(__dirname, '../../migrations/*.ts')],
  subscribers: [],
});

// Initialize the database connection
export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};
