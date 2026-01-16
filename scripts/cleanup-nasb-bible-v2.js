import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const INPUT_FILE = path.join(__dirname, 'NASB1995.txt');
const OUTPUT_FILE = path.join(__dirname, 'NASB1995_cleaned_v2.txt');
const BACKUP_FILE = path.join(__dirname, 'NASB1995_backup_v2.txt');

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

// Clean up the Bible text with more permissive parsing
function cleanBibleText(content) {
  console.log('Cleaning Bible text...');
  
  // Split into lines
  const lines = content.split('\n');
  const cleanedLines = [];
  
  // Track current state
  let currentBook = '';
  let currentChapter = 0;
  let currentVerse = 0;
  let inPsalmTitles = false;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Check for book header (e.g., "# GENESIS")
    if (line.startsWith('#')) {
      currentBook = line.substring(2).trim().toUpperCase();
      cleanedLines.push(`# ${currentBook}`);
      inPsalmTitles = (currentBook === 'PSALMS');
      continue;
    }
    
    // Check for chapter line (e.g., "Chapter 1")
    const chapterMatch = line.match(/^(?:Chapter\s+)?(\d+)/i);
    if (chapterMatch) {
      currentChapter = parseInt(chapterMatch[1], 10);
      cleanedLines.push(`Chapter ${currentChapter}`);
      
      // The next line might be the chapter title
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine && !nextLine.match(/^\d/)) {
          cleanedLines.push(nextLine);
          i++; // Skip the title line in the next iteration
        }
      }
      continue;
    }
    
    // Special handling for Psalm titles
    if (inPsalmTitles && line.match(/^[A-Z][A-Z\s]+$/)) {
      cleanedLines.push(`# ${line}`);
      continue;
    }
    
    // Process verse lines - more permissive matching
    // Look for verse numbers that might be preceded by spaces or other characters
    const verseMatch = line.match(/(?:^|\s)(\d+)\s+(.*)/);
    if (verseMatch) {
      const verseNum = parseInt(verseMatch[1], 10);
      const verseText = verseMatch[2].trim();
      
      // Only update verse number if it's a reasonable increment
      // This prevents false positives from numbers in the text
      if (verseNum <= currentVerse + 5 || verseNum === 1) {
        currentVerse = verseNum;
        cleanedLines.push(`${currentVerse} ${verseText}`);
      } else {
        // If it's not a reasonable verse number, treat as continuation
        const lastLine = cleanedLines[cleanedLines.length - 1] || '';
        cleanedLines[cleanedLines.length - 1] = lastLine + ' ' + line.trim();
      }
    } else {
      // If no verse number found, append to the previous line
      if (cleanedLines.length > 0) {
        const lastLine = cleanedLines[cleanedLines.length - 1];
        cleanedLines[cleanedLines.length - 1] = lastLine + ' ' + line.trim();
      } else {
        // If no previous line, add as a comment
        cleanedLines.push(`# ${line}`);
      }
    }
  }
  
  return cleanedLines.join('\n');
}

// Main function
async function main() {
  try {
    console.log('Starting Bible text cleanup (v2)...');
    
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
    
    // Count lines in original and cleaned files
    const originalLineCount = content.split('\n').length;
    const cleanedLineCount = cleanedContent.split('\n').length;
    console.log(`\nLine counts:`);
    console.log(`- Original: ${originalLineCount} lines`);
    console.log(`- Cleaned: ${cleanedLineCount} lines`);
    console.log(`- Difference: ${originalLineCount - cleanedLineCount} lines`);
    
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
