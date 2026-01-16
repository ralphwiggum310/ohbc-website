import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const INPUT_FILE = path.join(__dirname, 'NASB1995.txt');
const OUTPUT_FILE = path.join(__dirname, 'NASB1995_cleaned.txt');
const BACKUP_FILE = path.join(__dirname, 'NASB1995_backup.txt');

// Create a backup of the original file
function createBackup() {
  try {
    console.log('Creating backup of the original file...');
    fs.copyFileSync(INPUT_FILE, BACKUP_FILE);
    console.log(`Backup created at: ${BACKUP_FILE}`);
  } catch (error) {
    console.error('Error creating backup:', error.message);
    process.exit(1);
  }
}

// Clean up the Bible text
function cleanBibleText(content) {
  console.log('Cleaning Bible text...');
  
  // Split into lines
  const lines = content.split('\n');
  const cleanedLines = [];
  
  // Track current state
  let inVerse = false;
  let currentChapter = 0;
  let currentVerse = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Check for book header (e.g., "# GENESIS")
    if (line.startsWith('#')) {
      cleanedLines.push(line);
      continue;
    }
    
    // Check for chapter line (e.g., "Chapter 1")
    const chapterMatch = line.match(/^Chapter\s+(\d+)/i);
    if (chapterMatch) {
      currentChapter = parseInt(chapterMatch[1], 10);
      cleanedLines.push(`Chapter ${currentChapter}`);
      
      // The next line should be the chapter title
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine && !nextLine.match(/^\d/)) {
          cleanedLines.push(nextLine);
          i++; // Skip the title line in the next iteration
        }
      }
      continue;
    }
    
    // Process verse lines
    const verseMatch = line.match(/^(\d+)\s+(.*)/);
    if (verseMatch) {
      currentVerse = parseInt(verseMatch[1], 10);
      const verseText = verseMatch[2].trim();
      cleanedLines.push(`${currentVerse} ${verseText}`);
    } else if (currentVerse > 0) {
      // Handle wrapped verse text (continuation of previous verse)
      const lastLine = cleanedLines[cleanedLines.length - 1];
      cleanedLines[cleanedLines.length - 1] = lastLine + ' ' + line.trim();
    } else {
      // If we have text that doesn't match any pattern, preserve it with a comment
      cleanedLines.push(`# ${line}`);
    }
  }
  
  return cleanedLines.join('\n');
}

// Main function
async function main() {
  try {
    console.log('Starting Bible text cleanup...');
    
    // Create a backup first
    createBackup();
    
    // Read the input file
    console.log(`Reading input file: ${INPUT_FILE}`);
    const content = fs.readFileSync(INPUT_FILE, 'utf8');
    
    // Clean the content
    const cleanedContent = cleanBibleText(content);
    
    // Write the cleaned content to the output file
    console.log(`Writing cleaned content to: ${OUTPUT_FILE}`);
    fs.writeFileSync(OUTPUT_FILE, cleanedContent, 'utf8');
    
    console.log('Cleanup completed successfully!');
    console.log(`Original file backed up to: ${BACKUP_FILE}`);
    console.log(`Cleaned file saved as: ${OUTPUT_FILE}`);
    
  } catch (error) {
    console.error('An error occurred:', error.message);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
