import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs/promises';

type SqliteDb = Database.Database;

// Database paths
const USERS_DB_PATH = path.join(process.cwd(), 'data', 'users', 'ohbc_users.db');
const BIBLE_DB_PATH = path.join(process.cwd(), 'data', 'bible', 'bibles.db');

// Database instances
let usersDbInstance: SqliteDb | null = null;
let bibleDbInstance: SqliteDb | null = null;
let usersDbInitialization: Promise<SqliteDb> | null = null;
let bibleDbInitialization: Promise<SqliteDb> | null = null;

// Default query options
interface QueryOptions {
  limit?: number;
  offset?: number;
  timeout?: number;
}

// Get users database instance
async function getUsersDb(): Promise<SqliteDb> {
  if (usersDbInstance) return usersDbInstance;
  
  if (!usersDbInitialization) {
    usersDbInitialization = initializeUsersDatabase().then(() => {
      usersDbInstance = new Database(USERS_DB_PATH, {
        readonly: false,
        // Enable WAL mode for better concurrency
        fileMustExist: false,
        // Timeout for database operations (ms)
        timeout: 5000,
        // Verbose logging in development
        verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
      });
      return usersDbInstance;
    });
  }
  
  return usersDbInitialization;
}

// Get Bible database instance (existing functionality)
async function getBibleDb(): Promise<SqliteDb> {
  if (bibleDbInstance) return bibleDbInstance;
  
  // Use existing Bible database initialization logic
  if (!bibleDbInitialization) {
    bibleDbInitialization = initializeDb().then(() => {
      bibleDbInstance = new Database(BIBLE_DB_PATH, {
        readonly: false,
        fileMustExist: false,
        timeout: 5000,
        verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
      });
      return bibleDbInstance;
    });
  }
  
  return bibleDbInitialization;
}

// Get database instance with proper async handling
export async function getDb(dbType: 'users' | 'bible' = 'users'): Promise<SqliteDb> {
  if (dbType === 'users') {
    return getUsersDb();
  } else if (dbType === 'bible') {
    return getBibleDb();
  } else {
    throw new Error(`Unsupported database type: ${dbType}`);
  }
}

// Helper function to run queries
export async function query<T = any>(
  sql: string, 
  params: any[] = [], 
  options: QueryOptions = {},
  dbType: 'users' | 'bible' = 'users'
): Promise<{ rows: T[]; hasMore: boolean }> {
  const db = await getDb(dbType);
  
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
    
    if (options.timeout) {
      db.pragma(`busy_timeout = ${options.timeout}`);
    }
    
    // Prepare the statement
    console.log(`[${dbType.toUpperCase()}] Executing SQL: ${finalSql}`);
    console.log(`[${dbType.toUpperCase()}] With parameters:`, finalParams);
    
    const stmt = db.prepare(finalSql);
    const rows = stmt.all(...finalParams) as T[];
    
    // Check if there are more results
    let hasMore = false;
    if (options.limit !== undefined && rows.length === options.limit) {
      // If we got exactly the limit, there might be more
      const countSql = sql.replace(/SELECT.*?(?:LIMIT\s+\d+)?/i, 'SELECT COUNT(*) as count FROM (${})');
      const countStmt = db.prepare(countSql);
      const count = countStmt.get(...params, options.limit + 1) as { count: number };
      hasMore = count.count > options.limit;
    }
    
    return { rows, hasMore };
  } catch (error) {
    console.error(`[${dbType.toUpperCase()}] Database query error:`, error);
    throw error;
  }
}

// Helper to run a transaction
export async function transaction<T>(
  dbType: 'users' | 'bible' = 'users',
  fn: (db: SqliteDb) => T
): Promise<T> {
  const db = await getDb(dbType);
  
  return db.transaction((...args) => {
    return fn(db);
  })();
}

// Helper function to run queries (legacy compatibility)
export async function runQuery(
  dbType: 'users' | 'bible' = 'users',
  query: string, 
  params: any[] = []
): Promise<any> {
  const db = await getDb(dbType);
  const stmt = db.prepare(query);
  return stmt.run(params);
}

// Helper function to get single row (legacy compatibility)
export async function getQuery(
  dbType: 'users' | 'bible' = 'users',
  query: string, 
  params: any[] = []
): Promise<any> {
  const db = await getDb(dbType);
  const stmt = db.prepare(query);
  return stmt.get(params);
}

// Helper function to get multiple rows (legacy compatibility)
export async function allQuery(
  dbType: 'users' | 'bible' = 'users',
  query: string, 
  params: any[] = []
): Promise<any[]> {
  const db = await getDb(dbType);
  const stmt = db.prepare(query);
  return stmt.all(params);
}

// Get table information
export async function getTableInfo(tableName: string, dbType: 'users' | 'bible' = 'users') {
  const db = await getDb(dbType);
  return db.prepare(`PRAGMA table_info(${tableName})`).all();
}

// Get all tables
export async function getTables(dbType: 'users' | 'bible' = 'users') {
  const db = await getDb(dbType);
  return db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '\\_\\_%' ESCAPE '\\\\'").all();
}

// Close database connection
export async function closeDatabase(dbType: 'users' | 'bible' = 'users') {
  if (dbType === 'users' && usersDbInstance) {
    usersDbInstance.close();
    usersDbInstance = null;
    usersDbInitialization = null;
  } else if (dbType === 'bible' && bibleDbInstance) {
    bibleDbInstance.close();
    bibleDbInstance = null;
    bibleDbInitialization = null;
  }
}

// Initialize users database
async function initializeUsersDatabase() {
  const db = new Database(USERS_DB_PATH, {
    readonly: false,
    fileMustExist: false,
    timeout: 5000,
    verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
  });
  
  // Enable WAL mode for better concurrency
  db.pragma('journal_mode = WAL');
  db.pragma('busy_timeout = 5000');
  db.pragma('foreign_keys = ON');
  
  // Check if users table exists
  const tableInfo = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='users'
  `).get();
  
  if (!tableInfo) {
    console.log('Creating users table...');
    
    // Create users table with all necessary columns
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        middle_name TEXT,
        suffix TEXT,
        nickname TEXT,
        photo_url TEXT,
        primary_email TEXT,
        secondary_email TEXT,
        home_phone TEXT,
        mobile_phone TEXT,
        work_phone TEXT,
        address_street TEXT,
        address_city TEXT,
        address_state TEXT,
        address_zip TEXT,
        address_country TEXT,
        spouse_name TEXT,
        children_names TEXT,
        anniversary_date TEXT,
        occupation TEXT,
        company TEXT,
        role TEXT NOT NULL DEFAULT 'Member',
        phone TEXT,
        status TEXT DEFAULT 'Pending',
        ministries TEXT,
        categories TEXT,
        is_active INTEGER DEFAULT 1,
        is_featured INTEGER DEFAULT 0,
        failed_login_attempts INTEGER DEFAULT 0,
        locked_until TEXT,
        reset_token VARCHAR(255),
        reset_token_expiry TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    db.exec(createTableSQL);
    console.log('Users table created successfully');
    
    // Create indexes for better performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)',
      'CREATE INDEX IF NOT EXISTS idx_users_name ON users(last_name, first_name)',
      'CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active)',
      'CREATE INDEX IF NOT EXISTS idx_users_featured ON users(is_featured)',
      'CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token)'
    ];
    
    indexes.forEach(indexSQL => {
      db.exec(indexSQL);
    });
    
    console.log('Database indexes created successfully');
  } else {
    console.log('Users table already exists');
  }

  // Always ensure notifications tables exist (idempotent)
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'direct',
      target_role TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notification_recipients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      notification_id INTEGER NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL,
      read_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(notification_id, user_id)
    );

    CREATE INDEX IF NOT EXISTS idx_notif_recipients_user ON notification_recipients(user_id);
    CREATE INDEX IF NOT EXISTS idx_notif_recipients_notif ON notification_recipients(notification_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_sender ON notifications(sender_id);
  `);

  db.close();
}

// Initialize Bible database
async function initializeDb(): Promise<SqliteDb> {
  if (bibleDbInstance) return bibleDbInstance;
  
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
  bibleDbInstance = new Database(dbPath, {
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
  bibleDbInstance.pragma('journal_mode = WAL');
  // Set busy timeout to handle database locks gracefully
  bibleDbInstance.pragma('busy_timeout = 5000');
  // Enable foreign key constraints
  bibleDbInstance.pragma('foreign_keys = ON');
  
  // Close the database connection when the Node process ends
  const cleanup = async () => {
    if (bibleDbInstance) {
      try {
        await bibleDbInstance.close();
      } catch (err) {
        console.error('Error closing database:', err);
      } finally {
        bibleDbInstance = null;
        bibleDbInitialization = null;
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
  
  return bibleDbInstance;
}

export { getUsersDb, getBibleDb };
