import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs/promises';

type SqliteDb = Database.Database;

// Database instance and initialization promise
let dbInstance: SqliteDb | null = null;
let dbInitialization: Promise<SqliteDb> | null = null;

// Default query options
interface QueryOptions {
  limit?: number;
  offset?: number;
  timeout?: number;
}

// Default query limit to prevent memory issues
const DEFAULT_QUERY_LIMIT = 1000;

// Get database instance
async function initializeDb(): Promise<SqliteDb> {
  if (dbInstance) return dbInstance;
  
  // Try multiple possible locations for the database
  const possiblePaths = [
    // Relative path for production
    path.join(process.cwd(), 'data', 'bible', 'bibles.db'),
    // Development paths
    path.join(process.cwd(), '..', 'data', 'bible', 'bibles.db'),
    path.join(process.cwd(), '..', '..', 'data', 'bible', 'bibles.db'),
    // Legacy paths (kept for backward compatibility)
    path.join(process.cwd(), 'Bible api', 'bibles.db'),
    path.join(process.cwd(), 'Bible api', 'Bibles.db'),
    // Fallback to current directory
    path.join(process.cwd(), 'bibles.db'),
  ];
  
  // Try each path until we find one that exists
  let dbPath: string | null = null;
  for (const possiblePath of possiblePaths) {
    try {
      // Normalize the path for the current OS
      const normalizedPath = path.normalize(possiblePath);
      await fs.access(normalizedPath);
      dbPath = normalizedPath;
      console.log(`Using database at: ${dbPath}`);
      break;
    } catch (err) {
      // Path doesn't exist, try the next one
      continue;
    }
  }

  // If no database found, try to create the directory structure
  if (!dbPath) {
    const defaultPath = path.join(process.cwd(), 'data', 'bible');
    try {
      await fs.mkdir(defaultPath, { recursive: true });
      dbPath = path.join(defaultPath, 'bibles.db');
      console.log(`Created database directory at: ${defaultPath}`);
    } catch (err) {
      console.error('Failed to create database directory:', err);
      throw new Error('Could not find or create database file');
    }
  }
  
  if (!dbPath) {
    throw new Error(`Could not find bibles.db in any of the following locations:\n${possiblePaths.join('\n')}`);
  }

  // Initialize the database with better-sqlite3 options
  dbInstance = new Database(dbPath, {
    // Enable WAL mode for better concurrency
    readonly: false,
    // File must exist or be created
    fileMustExist: false,
    // Timeout for database operations (ms)
    timeout: 5000,
    // Verbose logging in development
    verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
  });
  
  // Enable WAL mode for better concurrency
  dbInstance.pragma('journal_mode = WAL');
  // Set busy timeout to handle database locks gracefully
  dbInstance.pragma('busy_timeout = 5000');
  // Enable foreign key constraints
  dbInstance.pragma('foreign_keys = ON');
  
  // Close the database connection when the Node process ends
  const cleanup = async () => {
    if (dbInstance) {
      try {
        await dbInstance.close();
      } catch (err) {
        console.error('Error closing database:', err);
      } finally {
        dbInstance = null;
        dbInitialization = null;
      }
    }
  };
  
  // Handle different types of process termination
  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    cleanup().finally(() => process.exit(1));
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    cleanup().finally(() => process.exit(1));
  });
  
  return dbInstance;
}

// Get database instance with proper async handling
async function getDb(): Promise<SqliteDb> {
  if (!dbInitialization) {
    dbInitialization = initializeDb();
  }
  return dbInitialization;
}

export async function query<T = any>(
  sql: string, 
  params: any[] = [], 
  options: QueryOptions = {}
): Promise<{ rows: T[]; hasMore: boolean }> {
  const db = await getDb();
  const timeout = options.timeout || 30000;
  
  try {
    // Apply query options
    let finalSql = sql;
    const finalParams = [...params];
    
    // Add LIMIT and OFFSET if not already present and options are provided
    const hasLimit = /\bLIMIT\s+\?/i.test(sql) || /\bLIMIT\s+\d+/i.test(sql);
    const hasOffset = /\bOFFSET\s+\?/i.test(sql) || /\bOFFSET\s+\d+/i.test(sql);
    
    if (!hasLimit && options.limit !== undefined) {
      finalSql += ` LIMIT ?`;
      finalParams.push(options.limit);
    }
    
    if (!hasOffset && options.offset !== undefined) {
      finalSql += ` OFFSET ?`;
      finalParams.push(options.offset);
    }
    
    // Set a timeout for the query
    if (options.timeout) {
      db.pragma(`busy_timeout = ${options.timeout}`);
    }
    
    // Prepare the statement
    console.log(`[DB] Executing SQL: ${finalSql}`);
    console.log(`[DB] With parameters:`, finalParams);
    
    let stmt;
    try {
      stmt = db.prepare(finalSql);
    } catch (error) {
      console.error('[DB] Error preparing statement:', error);
      console.error('[DB] SQL:', finalSql);
      throw error;
    }
    
    // Execute the query with parameters
    let rows;
    try {
      rows = stmt.all(...finalParams) as T[];
      console.log(`[DB] Query executed successfully, returned ${rows.length} rows`);
    } catch (error) {
      console.error('[DB] Error executing query:', error);
      throw error;
    }
    
    // Check if there are more results
    let hasMore = false;
    if (options.limit !== undefined && rows.length === options.limit) {
      // If we got exactly the limit, there might be more
      const countSql = `SELECT COUNT(*) as count FROM (${sql.replace(/;?$/, '')} LIMIT ?) AS subquery`;
      const countStmt = db.prepare(countSql);
      const count = countStmt.get(...[...params, options.limit + 1]) as { count: number };
      hasMore = count.count > options.limit;
    }
    
    return { rows, hasMore };
  } catch (error) {
    console.error('Database query error:', error);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
}

// Helper to execute a transaction
export async function transaction<T>(fn: (db: SqliteDb) => T): Promise<T> {
  const db = await getDb();
  
  // Begin transaction
  const result = db.transaction((...args) => {
    return fn(db);
  })();
  
  return result;
}

export async function getTableInfo(tableName: string) {
  const db = await getDb();
  return db.prepare(`PRAGMA table_info(${tableName})`).all();
}

// Get all tables
export async function getTables() {
  const db = await getDb();
  return db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '\\_\\_%' ESCAPE '\\\\'").all();
}

// Close the database connection
export async function closeDatabase() {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
    dbInitialization = null;
  }
}
