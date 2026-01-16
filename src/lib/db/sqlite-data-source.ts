import { DataSource } from 'typeorm';
import { User } from '../../models/User';
import path from 'path';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: path.join(process.cwd(), 'ohbc_lite.sqlite'),
  synchronize: true, // Automatically create database schema on app start (disable in production)
  logging: process.env.NODE_ENV !== 'production',
  entities: [User],
  migrations: [],
  subscribers: [],
});

export default AppDataSource;
