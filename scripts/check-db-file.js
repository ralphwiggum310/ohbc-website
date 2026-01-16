import { existsSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(process.cwd(), 'Bible api', 'bible.eng.db');
const optimizedDbPath = path.join(process.cwd(), 'Bible api', 'bible.eng.optimized.db');

console.log('Checking database files...');
console.log('Current working directory:', process.cwd());
console.log('Database path:', dbPath);
console.log('Optimized database path:', optimizedDbPath);

// Check if files exist
console.log('\nFile status:');
console.log(`- bible.eng.db: ${existsSync(dbPath) ? '✅ Found' : '❌ Not found'}`);
console.log(`- bible.eng.optimized.db: ${existsSync(optimizedDbPath) ? '✅ Found' : '❌ Not found'}`);

// Check file sizes if they exist
if (existsSync(dbPath)) {
  const stats = statSync(dbPath);
  const fileSize = stats.size / (1024 * 1024);
  console.log(`- bible.eng.db size: ${fileSize.toFixed(2)} MB`);
  console.log(`- Last modified: ${stats.mtime}`);
}

if (existsSync(optimizedDbPath)) {
  const stats = statSync(optimizedDbPath);
  const fileSize = stats.size / (1024 * 1024);
  console.log(`- bible.eng.optimized.db size: ${fileSize.toFixed(2)} MB`);
  console.log(`- Last modified: ${stats.mtime}`);
}
