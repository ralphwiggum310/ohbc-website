import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DB_PATH = path.join(__dirname, '..', 'Bible api', 'bible.eng.db');
const NASB_FILE = path.join(__dirname, 'NASB1995_cleaned_v2.txt');
const DEBUG_LOG = path.join(__dirname, 'import-debug.log');

// Clear previous debug log
if (fs.existsSync(DEBUG_LOG)) {
  fs.unlinkSync(DEBUG_LOG);
}

function logDebug(message, data = null) {
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] ${message}`;
  
  if (data !== null) {
    logMessage += '\n' + JSON.stringify(data, null, 2);
  }
  
  console.log(message);
  fs.appendFileSync(DEBUG_LOG, logMessage + '\n');
}

// Book name to ID mapping (from key_english table)
const BOOK_IDS = {
  'GENESIS': 1, 'EXODUS': 2, 'LEVITICUS': 3, 'NUMBERS': 4, 'DEUTERONOMY': 5,
  'JOSHUA': 6, 'JUDGES': 7, 'RUTH': 8, '1 SAMUEL': 9, '2 SAMUEL': 10,
  '1 KINGS': 11, '2 KINGS': 12, '1 CHRONICLES': 13, '2 CHRONICLES': 14, 'EZRA': 15,
  'NEHEMIAH': 16, 'ESTHER': 17, 'JOB': 18, 'PSALM': 19, 'PSALMS': 19, 'PROVERBS': 20,
  'ECCLESIASTES': 21, 'SONG OF SOLOMON': 22, 'ISAIAH': 23, 'JEREMIAH': 24,
  'LAMENTATIONS': 25, 'EZEKIEL': 26, 'DANIEL': 27, 'HOSEA': 28, 'JOEL': 29,
  'AMOS': 30, 'OBADIAH': 31, 'JONAH': 32, 'MICAH': 33, 'NAHUM': 34,
  'HABAKKUK': 35, 'ZEPHANIAH': 36, 'HAGGAI': 37, 'ZECHARIAH': 38, 'MALACHI': 39,
  'MATTHEW': 40, 'MARK': 41, 'LUKE': 42, 'JOHN': 43, 'ACTS': 44,
  'ROMANS': 45, '1 CORINTHIANS': 46, '2 CORINTHIANS': 47, 'GALATIANS': 48,
  'EPHESIANS': 49, 'PHILIPPIANS': 50, 'COLOSSIANS': 51, '1 THESSALONIANS': 52,
  '2 THESSALONIANS': 53, '1 TIMOTHY': 54, '2 TIMOTHY': 55, 'TITUS': 56,
  'PHILEMON': 57, 'HEBREWS': 58, 'JAMES': 59, '1 PETER': 60, '2 PETER': 61,
  '1 JOHN': 62, '2 JOHN': 63, '3 JOHN': 64, 'JUDE': 65, 'REVELATION': 66
};

async function testDatabaseConnection(db) {
  try {
    logDebug('Testing database connection...');
    const result = await db.get('SELECT name FROM sqlite_master WHERE type="table"');
    logDebug('Database connection successful. Found tables:', result);
    return true;
  } catch (error) {
    logDebug('Database connection failed:', error);
    return false;
  }
}

async function createTable(db) {
  try {
    logDebug('Creating t_nasb1995 table if it does not exist...');
    
    await db.exec(`
      CREATE TABLE IF NOT EXISTS t_nasb1995 (
        id INTEGER PRIMARY KEY,
        book INTEGER,
        chapter INTEGER,
        verse INTEGER,
        text TEXT,
        FOREIGN KEY (book) REFERENCES key_english (id)
      );
    `);
    
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_t_nasb1995_ref 
      ON t_nasb1995 (book, chapter, verse);
    `);
    
    // Clear existing data to avoid duplicates
    await db.run('DELETE FROM t_nasb1995;');
    logDebug('Table t_nasb1995 is ready for import.');
    return true;
  } catch (error) {
    logDebug('Error creating table:', error);
    return false;
  }
}

async function testImportSingleVerse(db) {
  try {
    logDebug('Testing insertion of a single verse...');
    const result = await db.run(
      'INSERT INTO t_nasb1995 (book, chapter, verse, text) VALUES (?, ?, ?, ?)',
      [1, 1, 1, 'In the beginning God created the heavens and the earth.']
    );
    logDebug('Test verse inserted successfully:', result);
    
    const count = await db.get('SELECT COUNT(*) as count FROM t_nasb1995');
    logDebug('Current row count in t_nasb1995:', count);
    
    // Clean up test data
    await db.run('DELETE FROM t_nasb1995');
    return true;
  } catch (error) {
    logDebug('Error testing single verse insertion:', error);
    return false;
  }
}

async function analyzeFile() {
  logDebug('Analyzing input file...');
  
  try {
    const content = fs.readFileSync(NASB_FILE, 'utf8');
    const lines = content.split('\n');
    
    logDebug(`File contains ${lines.length} lines`);
    
    // Sample first 10 non-empty lines
    const sampleLines = [];
    for (let i = 0; i < lines.length && sampleLines.length < 10; i++) {
      if (lines[i].trim()) {
        sampleLines.push(`Line ${i + 1}: ${lines[i].trim()}`);
      }
    }
    
    logDebug('Sample lines from file:', sampleLines);
    
    // Count book headers
    const bookHeaders = lines.filter(line => line.startsWith('# '));
    logDebug(`Found ${bookHeaders.length} book headers:`, bookHeaders);
    
    // Count chapter lines
    const chapterLines = lines.filter(line => /^Chapter\s+\d+/i.test(line));
    logDebug(`Found ${chapterLines.length} chapter headers`);
    
    // Count verse lines
    const verseLines = lines.filter(line => /^\d+\s+/.test(line));
    logDebug(`Found ${verseLines.length} verse lines`);
    
    // Sample some verse lines
    const sampleVerses = [];
    for (let i = 0; i < Math.min(5, verseLines.length); i++) {
      sampleVerses.push(verseLines[i]);
    }
    logDebug('Sample verse lines:', sampleVerses);
    
  } catch (error) {
    logDebug('Error analyzing file:', error);
  }
}

async function main() {
  let db;
  
  try {
    logDebug('Starting NASB1995 import debug session...');
    
    // Check if input file exists
    if (!fs.existsSync(NASB_FILE)) {
      logDebug(`Error: Input file not found: ${NASB_FILE}`);
      return;
    }
    
    // Open the database
    logDebug(`Opening database: ${DB_PATH}`);
    db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });
    
    // Test database connection
    const dbConnected = await testDatabaseConnection(db);
    if (!dbConnected) {
      logDebug('Cannot continue without a valid database connection.');
      return;
    }
    
    // Test table creation and basic operations
    const tableReady = await createTable(db);
    if (!tableReady) {
      logDebug('Failed to prepare database table.');
      return;
    }
    
    // Test inserting a single verse
    const testInsert = await testImportSingleVerse(db);
    if (!testInsert) {
      logDebug('Failed to insert test verse.');
      return;
    }
    
    // Analyze the input file
    await analyzeFile();
    
    logDebug('\nDebug analysis complete. Check the log file for details:');
    logDebug(DEBUG_LOG);
    
  } catch (error) {
    logDebug('An error occurred during debug session:', error);
  } finally {
    if (db) await db.close();
  }
}

// Run the debug script
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
