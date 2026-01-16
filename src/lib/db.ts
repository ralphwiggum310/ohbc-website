import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs/promises';

// Connection pool
const MAX_CONNECTIONS = 5;
const connections: Database[] = [];
const connectionQueue: Array<{
  resolve: (db: Database) => void;
  reject: (error: Error) => void;
}> = [];

// Default query options
interface QueryOptions {
  limit?: number;
  offset?: number;
  timeout?: number;
}

// Default query limit to prevent memory issues
const DEFAULT_QUERY_LIMIT = 1000;

async function getDb(): Promise<Database> {
  // If there's an available connection, return it
  if (connections.length > 0) {
    return connections.pop()!;
  }
  
  // If we haven't reached max connections, create a new one
  if (connections.length + connectionQueue.length < MAX_CONNECTIONS) {
    return createNewConnection();
  }
  
  // Otherwise, wait for a connection to become available
  return new Promise((resolve, reject) => {
    connectionQueue.push({ resolve, reject });
  });
}

async function createNewConnection(): Promise<Database> {
  try {
    // Try multiple possible locations for the database
    const possiblePaths = [
      'C:\\WindSurf\\ohbc_website\\data\\bible\\bibles.db',
      path.join(process.cwd(), 'data', 'bible', 'bibles.db'),
      path.join(process.cwd(), 'Bible api', 'bibles.db'),
      path.join(process.cwd(), 'Bible api', 'Bibles.db'),
      path.join(process.cwd(), 'bibles.db'),
    ];
    
    let dbPath = '';
    
    // Find the first existing database file
    for (const possiblePath of possiblePaths) {
      try {
        await fs.access(possiblePath);
        dbPath = possiblePath;
        console.log(`[Database] Found database at: ${dbPath}`);
        break;
      } catch (error) {
        console.log(`[Database] Database not found at: ${possiblePath}`);
      }
    }
    
    if (!dbPath) {
      const errorMsg = `Database file not found in any of these locations:\n${possiblePaths.join('\n')}`;
      console.error(`[Database] ${errorMsg}`);
      throw new Error(errorMsg);
    }
    
    console.log(`[Database] Creating new connection to: ${dbPath}`);
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
      verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
    });
    
    // Configure the connection
    await db.run('PRAGMA journal_mode = WAL');
    await db.run('PRAGMA busy_timeout = 5000');
    
    return db;
  } catch (error) {
    console.error('[Database] Error creating database connection:', error);
    throw error;
  }
}

async function releaseConnection(db: Database) {
  if (connectionQueue.length > 0) {
    const { resolve } = connectionQueue.shift()!;
    resolve(db);
  } else {
    connections.push(db);
  }
}

export async function query<T = any>(
  sql: string, 
  params: any[] = [], 
  options: QueryOptions = {}
): Promise<{ rows: T[]; hasMore: boolean }> {
  const { 
    limit = DEFAULT_QUERY_LIMIT,
    offset = 0,
    timeout = 30000 // 30 second timeout
  } = options;
  
  // Add limit and offset to the query if not already present
  const hasLimit = /\bLIMIT\s+\?/i.test(sql) || /\bLIMIT\s+\d+/i.test(sql);
  const hasOffset = /\bOFFSET\s+\?/i.test(sql) || /\bOFFSET\s+\d+/i.test(sql);
  
  let finalSql = sql;
  if (!hasLimit && !hasOffset) {
    finalSql += ` LIMIT ? OFFSET ?`;
    params = [...params, limit + 1, offset]; // +1 to check if there are more results
  }
  
  const db = await getDb();
  
  try {
    console.log(`[Database] Executing query: ${finalSql}`, { params });
    const startTime = Date.now();
    
    // Set timeout for the query
    await db.run(`PRAGMA busy_timeout = ${timeout}`);
    
    const rows = await db.all<T>(finalSql, params) as T[];
    const duration = Date.now() - startTime;
    
    // Check if there are more results than the limit
    const hasMore = Array.isArray(rows) && rows.length > limit;
    const resultRows = (Array.isArray(rows) ? (hasMore ? rows.slice(0, -1) : rows) : []) as T[];
    
    console.log(`[Database] Query executed in ${duration}ms, returned ${resultRows.length} rows` + 
                (hasMore ? ' (more available)' : ''));
    
    return {
      rows: resultRows,
      hasMore
    };
  } catch (error) {
    console.error('[Database] Query error:', {
      sql: finalSql,
      params,
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  } finally {
    await releaseConnection(db);
  }
}

// Helper to execute a query and automatically release the connection
export async function withDb<T>(fn: (db: Database) => Promise<T>): Promise<T> {
  const db = await getDb();
  try {
    return await fn(db);
  } finally {
    await releaseConnection(db);
  }
}

export async function getTableInfo(tableName: string) {
  return withDb(async (db) => {
    return db.all(`PRAGMA table_info(${tableName})`);
  });
}

export async function getTables() {
  return withDb(async (db) => {
    return db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
  });
}

// Close all database connections
export async function closeAllConnections() {
  for (const db of connections) {
    try {
      await db.close();
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }
  connections.length = 0; // Clear the array
  
  // Reject any pending connection requests
  while (connectionQueue.length > 0) {
    const { reject } = connectionQueue.shift()!;
    reject(new Error('Database connections closed'));
  }
}
