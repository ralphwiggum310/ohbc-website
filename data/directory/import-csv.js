const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Database path
const DB_PATH = path.join(__dirname, 'ohbc_directory.db');
const TXT_PATH = path.join(__dirname, '..', 'names_addresses.txt');
const IMAGES_PATH = path.join(__dirname, '..', 'directory_imgs');

// Create directory if it doesn't exist
if (!fs.existsSync(IMAGES_PATH)) {
    fs.mkdirSync(IMAGES_PATH, { recursive: true });
}

// Connect to database
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to SQLite directory database.');
});

// Function to parse the names_addresses.txt format
function parseNamesFormat(lines) {
    const entries = [];
    let currentEntry = {};
    let entryCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines and separators
        if (!line || line === '*****') {
            // Save current entry if we have data
            if (Object.keys(currentEntry).length > 0) {
                entries.push({...currentEntry});
                currentEntry = {};
                entryCount++;
            }
            continue;
        }
        
        // Check if this is a names line (contains comma and &)
        if (line.includes(',') && line.includes('&')) {
            const names = line.split(',');
            const lastName = names[0]?.trim() || '';
            const firstNames = names[1]?.trim() || '';
            
            if (firstNames.includes('&')) {
                const nameParts = firstNames.split('&');
                currentEntry.first_name = nameParts[0]?.trim() || '';
                currentEntry.spouse_name = nameParts[1]?.trim() || '';
            } else {
                currentEntry.first_name = firstNames;
            }
            currentEntry.last_name = lastName;
            continue;
        }
        
        // Check if this is an address line (street address)
        if (line.match(/\d+\s+.+/) && !line.includes(',') && !line.includes(':')) {
            currentEntry.address_street = line;
            continue;
        }
        
        // Check if this is a city/state/zip line
        if (line.match(/^[^,]+,\s*[A-Z]{2}\s*\d{5}$/)) {
            const parts = line.split(',');
            const city = parts[0]?.trim() || '';
            const stateZip = parts[1]?.trim() || '';
            const stateZipParts = stateZip.split(/\s+/);
            
            currentEntry.address_city = city;
            if (stateZipParts.length >= 2) {
                currentEntry.address_state = stateZipParts[0];
                currentEntry.address_zip = stateZipParts[1];
            }
            continue;
        }
        
        // Check if this is a contact info line (contains colons and labels)
        if (line.includes(':')) {
            const contactParts = line.split(' - ');
            contactParts.forEach(part => {
                if (part.includes(':')) {
                    const [label, value] = part.split(':').map(s => s.trim());
                    
                    if (label.toLowerCase().includes('phone') || label.toLowerCase().includes('mobile')) {
                        if (!currentEntry.mobile_phone) {
                            currentEntry.mobile_phone = value;
                        } else {
                            currentEntry.home_phone = value;
                        }
                    } else if (label.toLowerCase().includes('email')) {
                        currentEntry.primary_email = value;
                    }
                }
            });
            continue;
        }
        
        // Handle single names (like Dax Bacon)
        if (!line.includes(',') && !line.includes(':') && !line.includes('&') && 
            !line.match(/\d+\s+.+/) && !line.match(/^[^,]+,\s*[A-Z]{2}\s*\d{5}$/)) {
            
            // Check if this is a continuation of previous entry (like apartment number)
            if (currentEntry.address_street && !currentEntry.address_street.includes(line)) {
                currentEntry.address_street += ' ' + line;
            }
            // Otherwise, treat as a single name entry
            else if (!currentEntry.first_name && !currentEntry.last_name) {
                const nameParts = line.split(/\s+/);
                if (nameParts.length >= 2) {
                    currentEntry.last_name = nameParts[0];
                    currentEntry.first_name = nameParts.slice(1).join(' ');
                } else {
                    currentEntry.first_name = line;
                }
            }
        }
    }
    
    // Don't forget the last entry
    if (Object.keys(currentEntry).length > 0) {
        entries.push(currentEntry);
    }
    
    return entries;
}

// Function to analyze and parse the names format
function analyzeNamesFormat(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            
            const lines = data.split('\n').map(line => line.trim()).filter(line => line);
            const entries = parseNamesFormat(lines);
            
            console.log(`Found ${entries.length} entries in names format`);
            
            resolve({
                format: 'names',
                entries,
                sampleData: entries.slice(0, 3)
            });
        });
    });
}

// Function to import data into database
function handleNamesImport(data) {
    return new Promise((resolve, reject) => {
        const { results } = data;
        
        // Begin transaction
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            
            const stmt = db.prepare(`
                INSERT OR REPLACE INTO directory_entries (
                    first_name, last_name, spouse_name, primary_email, mobile_phone, home_phone,
                    address_street, address_city, address_state, address_zip,
                    photo_url, photo_filename, is_active, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
            `);
            
            let importedCount = 0;
            let skippedCount = 0;
            
            for (const row of results) {
                // Skip rows without required fields
                const firstName = row.first_name || '';
                const lastName = row.last_name || '';
                
                if (!firstName.trim() || !lastName.trim()) {
                    skippedCount++;
                    continue;
                }
                
                // Generate photo filename based on name
                const baseName = `${lastName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${firstName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
                const photoFilename = `${baseName}.jpg`;
                const photoUrl = `/directory_imgs/${photoFilename}`;
                
                stmt.run([
                    firstName.trim(),
                    lastName.trim(),
                    row.spouse_name || null,
                    row.primary_email || null,
                    row.mobile_phone || null,
                    row.home_phone || null,
                    row.address_street || null,
                    row.address_city || null,
                    row.address_state || null,
                    row.address_zip || null,
                    photoUrl,
                    photoFilename
                ], function(err) {
                    if (err) {
                        console.error('Error inserting row:', err);
                    } else {
                        importedCount++;
                    }
                });
            }
            
            stmt.finalize(() => {
                db.run('COMMIT', (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            imported: importedCount,
                            skipped: skippedCount,
                            total: results.length
                        });
                    }
                });
            });
        });
    });
}

// Main import function
async function importNamesFormat() {
    try {
        console.log('Starting names format import...');
        
        // Check if file exists
        if (!fs.existsSync(TXT_PATH)) {
            console.error(`File not found: ${TXT_PATH}`);
            process.exit(1);
        }
        
        // Parse the names format
        console.log('Parsing names format...');
        const data = await analyzeNamesFormat(TXT_PATH);
        
        console.log('\nSample data:');
        data.sampleData.forEach((entry, index) => {
            console.log(`Entry ${index + 1}:`, entry);
        });
        
        // Import to database
        console.log('\nImporting to database...');
        const result = await handleNamesImport({ results: data.entries });
        
        console.log('\nImport completed!');
        console.log(`Total entries processed: ${result.total}`);
        console.log(`Entries imported: ${result.imported}`);
        console.log(`Entries skipped: ${result.skipped}`);
        
        console.log('\nImage file setup:');
        console.log(`Images directory: ${IMAGES_PATH}`);
        console.log('Place member photos in this directory with filenames matching the pattern:');
        console.log('lastname_firstname.jpg (e.g., allen_donovan.jpg)');
        
    } catch (error) {
        console.error('Import failed:', error);
        process.exit(1);
    } finally {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    }
}

// Run the import
if (require.main === module) {
    importNamesFormat();
}

module.exports = { importNamesFormat, analyzeNamesFormat, parseNamesFormat };
