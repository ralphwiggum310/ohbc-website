import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const NEW_DB_PATH = 'C:\\WindSurf\\ohbc_website\\data\\bible\\bibles.db';
const RELATIVE_DB_PATH = path.normalize('data/bible/bibles.db');

const filesToUpdate = [
  'scripts/checkDb.cjs',
  'scripts/checkDbIntegrity.js',
  'scripts/checkKeyEnglish.js',
  'scripts/checkTranslations.js',
  'scripts/checkVerse.cjs',
  'scripts/checkSchema.js',
  'scripts/createBiblesDb.js',
  'scripts/createBiblesDb.mjs',
  'scripts/createBiblesDb.new.ts',
  'scripts/createBiblesDb.ts',
  'scripts/dbDiagnostic.js',
  'scripts/fixBibleDb.js',
  'scripts/fixKeyEnglishSchema.js',
  'scripts/importBibleData.js',
  'scripts/importBibleData.mjs',
  'scripts/importFromExcel.js',
  'scripts/importFromExcel.mjs',
  'scripts/inspectBibleDbs.js',
  'scripts/inspectDb.js',
  'scripts/listTables.js',
  'scripts/populateKeyEnglish.js',
  'scripts/simpleDbCheck.js',
  'scripts/testBibleDb.js',
  'scripts/testConnection.js',
  'scripts/testDbQuery.js',
  'scripts/verifyBibleDb.js',
  'scripts/verifyBibleVerses.js',
  'scripts/verifyKeyEnglish.js'
];

async function updateFile(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    let content = await fs.readFile(fullPath, 'utf8');
    
    // Replace common path patterns
    content = content.replace(
      /path\.join\([^)]*['"]Bible api['"][^)]*['"]bibles\.db['"][^)]*\)/g,
      `'${NEW_DB_PATH}'`
    );
    
    content = content.replace(
      /path\.join\([^)]*['"]Bible api['"][^)]*['"]Bibles\.db['"][^)]*\)/g,
      `'${NEW_DB_PATH}'`
    );
    
    content = content.replace(
      /['"]Bible api[\\/]bibles\.db['"]/g,
      `'${NEW_DB_PATH.replace(/\\/g, '\\\\')}'`
    );
    
    content = content.replace(
      /['"]Bible api[\\/]Bibles\.db['"]/g,
      `'${NEW_DB_PATH.replace(/\\/g, '\\\\')}'`
    );
    
    // For relative paths in scripts that might be run from different directories
    content = content.replace(
      /path\.join\([^)]*['"]bibles\.db['"][^)]*\)/g,
      `'${NEW_DB_PATH}'`
    );
    
    // For relative paths without path.join
    content = content.replace(
      /['"][^'"\n]*bibles\.db['"]/g,
      (match) => {
        // Don't replace if it's already the new path
        if (match.includes('ohbc_website')) return match;
        return `'${NEW_DB_PATH}'`;
      }
    );
    
    await fs.writeFile(fullPath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
}

async function updateAllFiles() {
  console.log('Updating database paths in script files...');
  for (const file of filesToUpdate) {
    await updateFile(file);
  }
  console.log('All files have been updated.');
}

updateAllFiles().catch(console.error);
