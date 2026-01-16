const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to the SQLite database
const dbPath = path.join(__dirname, '..', 'data', 'bible', 'bibles.db');

// Connect to the database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    return;
  }
  
  console.log('Connected to the SQLite database.');
  
  // Start a transaction
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Get all NASB1995 verses that need cleaning
    db.all(
      `SELECT rowid, text FROM bible_verses 
       WHERE version = 'nasb1995' AND (text LIKE '%[%' OR text LIKE '%]%' OR text LIKE '%  %')`,
      [],
      (err, rows) => {
        if (err) {
          console.error('Error fetching verses to clean:', err);
          db.run('ROLLBACK');
          db.close();
          return;
        }
        
        console.log(`Found ${rows.length} verses to clean up`);
        let processed = 0;
        
        // Process each verse
        rows.forEach((row) => {
          let cleanText = row.text;
          
          // 1. Remove footnotes (text in square brackets)
          cleanText = cleanText.replace(/\s*\[.*?\]\s*/g, ' ');
          
          // 2. Remove extra spaces
          cleanText = cleanText.replace(/\s+/g, ' ').trim();
          
          // 3. Fix common formatting issues
          cleanText = cleanText
            .replace(/\(/g, ' (')  // Ensure space before (
            .replace(/\)/g, ') ')  // Ensure space after )
            .replace(/\s+/g, ' ')  // Collapse multiple spaces
            .trim();
            
          // 4. Fix any remaining formatting issues
          cleanText = cleanText
            .replace(/\s*:\s*/g, ': ')  // Fix spaces around colons
            .replace(/\s*;\s*/g, '; ')   // Fix spaces around semicolons
            .replace(/\s*,\s*/g, ', ')   // Fix spaces around commas
            .replace(/\s+\./g, '.')     // Fix spaces before periods
            .replace(/\.(\S)/g, '. $1')  // Ensure space after periods
            .replace(/\s+/g, ' ')        // Final space cleanup
            .trim();
          
          // Update the database with the cleaned text
          db.run(
            'UPDATE bible_verses SET text = ? WHERE rowid = ?',
            [cleanText, row.rowid],
            (err) => {
              if (err) {
                console.error('Error updating verse:', err);
                return;
              }
              
              processed++;
              if (processed % 100 === 0) {
                console.log(`Processed ${processed} of ${rows.length} verses`);
              }
              
              // If we've processed all verses, commit the transaction
              if (processed === rows.length) {
                console.log('All verses processed. Committing changes...');
                db.run('COMMIT', (err) => {
                  if (err) {
                    console.error('Error committing transaction:', err);
                    db.run('ROLLBACK');
                  } else {
                    console.log('Successfully cleaned up NASB1995 text');
                  }
                  db.close();
                });
              }
            }
          );
        });
        
        // If no verses needed cleaning, close the connection
        if (rows.length === 0) {
          console.log('No verses needed cleaning');
          db.run('COMMIT', () => {
            db.close();
          });
        }
      }
    );
  });
});
