const sqlite3 = require('sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

// Database path
const DB_PATH = path.join(__dirname, 'ohbc_users.db');

// Connect to database
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to SQLite users database.');
});

async function addDefaultAdmin() {
    try {
        // Hash the password
        const password = 'Ohbc@1970';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Check if admin user already exists
        const checkQuery = 'SELECT id FROM users WHERE email = ?';
        db.get(checkQuery, ['admin@ohbc.com'], async (err, row) => {
            if (err) {
                console.error('Error checking for existing admin:', err);
                process.exit(1);
            }
            
            if (row) {
                console.log('Admin user already exists. Updating to Super Admin role...');
                
                // Update existing user to Super Admin
                const updateQuery = `
                    UPDATE users 
                    SET role = 'Super Admin', 
                        password_hash = ?, 
                        updated_at = CURRENT_TIMESTAMP 
                    WHERE email = ?
                `;
                
                db.run(updateQuery, [hashedPassword, 'admin@ohbc.com'], function(err) {
                    if (err) {
                        console.error('Error updating admin user:', err);
                        process.exit(1);
                    }
                    
                    console.log('✅ Admin user updated successfully!');
                    console.log('Email: admin@ohbc.com');
                    console.log('Password: Ohbc@1970');
                    console.log('Role: Super Admin');
                    db.close();
                });
                
            } else {
                console.log('Creating new Super Admin user...');
                
                // Insert new admin user
                const insertQuery = `
                    INSERT INTO users (
                        email, password_hash, role, is_active, created_at, updated_at
                    ) VALUES (?, ?, 'Super Admin', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                `;
                
                db.run(insertQuery, ['admin@ohbc.com', hashedPassword], function(err) {
                    if (err) {
                        console.error('Error creating admin user:', err);
                        process.exit(1);
                    }
                    
                    console.log('✅ Super Admin user created successfully!');
                    console.log('Email: admin@ohbc.com');
                    console.log('Password: Ohbc@1970');
                    console.log('Role: Super Admin');
                    console.log('User ID:', this.lastID);
                    db.close();
                });
            }
        });
        
    } catch (error) {
        console.error('Error adding admin user:', error);
        process.exit(1);
    }
}

// Run the script
addDefaultAdmin();
