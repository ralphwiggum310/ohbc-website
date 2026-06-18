const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(process.cwd(), 'data', 'users', 'ohbc_users.db');

// Create database connection
function getDb() {
  return new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    }
  });
}

// Promisify database operations
function runQuery(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

function getQuery(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function allQuery(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// User operations
export async function createUser(userData) {
  const db = getDb();
  try {
    const { email, phone, passwordHash, role = 'Member' } = userData;
    const result = await runQuery(
      db,
      'INSERT INTO users (email, phone, password_hash, role) VALUES (?, ?, ?, ?)',
      [email, phone, passwordHash, role]
    );
    return result.id;
  } finally {
    db.close();
  }
}

export async function getUserByEmail(email) {
  const db = getDb();
  try {
    return await getQuery(db, 'SELECT * FROM users WHERE email = ? AND is_active = 1', [email]);
  } finally {
    db.close();
  }
}

export async function getUserByPhone(phone) {
  const db = getDb();
  try {
    return await getQuery(db, 'SELECT * FROM users WHERE phone = ? AND is_active = 1', [phone]);
  } finally {
    db.close();
  }
}

export async function updateUserLastLogin(userId) {
  const db = getDb();
  try {
    await runQuery(
      db,
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [userId]
    );
  } finally {
    db.close();
  }
}

export async function updateFailedLoginAttempts(email, attempts) {
  const db = getDb();
  try {
    await runQuery(
      db,
      'UPDATE users SET failed_login_attempts = ? WHERE email = ?',
      [attempts, email]
    );
  } finally {
    db.close();
  }
}

export async function lockUserAccount(email, lockUntil) {
  const db = getDb();
  try {
    await runQuery(
      db,
      'UPDATE users SET locked_until = ? WHERE email = ?',
      [lockUntil, email]
    );
  } finally {
    db.close();
  }
}

export async function resetFailedLoginAttempts(email) {
  const db = getDb();
  try {
    await runQuery(
      db,
      'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE email = ?',
      [email]
    );
  } finally {
    db.close();
  }
}

// User profile operations
export async function createUserProfile(profileData) {
  const db = getDb();
  try {
    const { userId, firstName, lastName, bio, photoUrl, phoneVisible = true, emailVisible = true } = profileData;
    const result = await runQuery(
      db,
      'INSERT INTO user_profiles (user_id, first_name, last_name, bio, photo_url, phone_visible, email_visible) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, firstName, lastName, bio, photoUrl, phoneVisible, emailVisible]
    );
    return result.id;
  } finally {
    db.close();
  }
}

export async function getUserProfile(userId) {
  const db = getDb();
  try {
    return await getQuery(
      db,
      'SELECT up.*, u.email, u.role FROM user_profiles up JOIN users u ON up.user_id = u.id WHERE up.user_id = ?',
      [userId]
    );
  } finally {
    db.close();
  }
}

// Role operations
export async function getRolePermissions(roleName) {
  const db = getDb();
  try {
    const role = await getQuery(db, 'SELECT permissions_json FROM roles WHERE role_name = ?', [roleName]);
    return role ? JSON.parse(role.permissions_json) : null;
  } finally {
    db.close();
  }
}

// Session operations
export async function createSession(sessionData) {
  const db = getDb();
  try {
    const { userId, token, refreshToken, expiresAt } = sessionData;
    const result = await runQuery(
      db,
      'INSERT INTO session_tokens (user_id, token, refresh_token, expires_at) VALUES (?, ?, ?, ?)',
      [userId, token, refreshToken, expiresAt]
    );
    return result.id;
  } finally {
    db.close();
  }
}

export async function getSession(token) {
  const db = getDb();
  try {
    return await getQuery(
      db,
      'SELECT st.*, u.email, u.role FROM session_tokens st JOIN users u ON st.user_id = u.id WHERE st.token = ? AND st.is_active = 1 AND st.expires_at > CURRENT_TIMESTAMP',
      [token]
    );
  } finally {
    db.close();
  }
}

export async function refreshSession(refreshToken) {
  const db = getDb();
  try {
    return await getQuery(
      db,
      'SELECT * FROM session_tokens WHERE refresh_token = ? AND is_active = 1 AND expires_at > CURRENT_TIMESTAMP',
      [refreshToken]
    );
  } finally {
    db.close();
  }
}

export async function invalidateSession(token) {
  const db = getDb();
  try {
    await runQuery(
      db,
      'UPDATE session_tokens SET is_active = 0 WHERE token = ?',
      [token]
    );
  } finally {
    db.close();
  }
}

export async function updateSessionLastUsed(token) {
  const db = getDb();
  try {
    await runQuery(
      db,
      'UPDATE session_tokens SET last_used = CURRENT_TIMESTAMP WHERE token = ?',
      [token]
    );
  } finally {
    db.close();
  }
}

// Password reset operations
export async function createPasswordResetToken(resetData) {
  const db = getDb();
  try {
    const { userId, token, expiresAt } = resetData;
    const result = await runQuery(
      db,
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );
    return result.id;
  } finally {
    db.close();
  }
}

export async function getPasswordResetToken(token) {
  const db = getDb();
  try {
    return await getQuery(
      db,
      'SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0 AND expires_at > CURRENT_TIMESTAMP',
      [token]
    );
  } finally {
    db.close();
  }
}

export async function markPasswordResetTokenAsUsed(token) {
  const db = getDb();
  try {
    await runQuery(
      db,
      'UPDATE password_reset_tokens SET used = 1 WHERE token = ?',
      [token]
    );
  } finally {
    db.close();
  }
}

// Serving schedules operations
export async function createServingSchedule(scheduleData) {
  const db = getDb();
  try {
    const { userId, ministryArea, scheduleDate, roleInMinistry, status = 'confirmed', notes } = scheduleData;
    const result = await runQuery(
      db,
      'INSERT INTO serving_schedules (user_id, ministry_area, schedule_date, role_in_ministry, status, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, ministryArea, scheduleDate, roleInMinistry, status, notes]
    );
    return result.id;
  } finally {
    db.close();
  }
}

export async function getUserServingSchedules(userId) {
  const db = getDb();
  try {
    return await allQuery(
      db,
      'SELECT * FROM serving_schedules WHERE user_id = ? ORDER BY schedule_date DESC',
      [userId]
    );
  } finally {
    db.close();
  }
}

export async function getAllServingSchedules() {
  const db = getDb();
  try {
    return await allQuery(
      db,
      'SELECT ss.*, up.first_name, up.last_name FROM serving_schedules ss JOIN user_profiles up ON ss.user_id = up.user_id ORDER BY ss.schedule_date DESC'
    );
  } finally {
    db.close();
  }
}

// Members directory operations
export async function getMembersDirectory(includePrivate = false) {
  const db = getDb();
  try {
    let query = `
      SELECT u.id, u.role, up.first_name, up.last_name, up.bio, up.photo_url,
             CASE WHEN up.phone_visible = 1 OR ? THEN u.phone ELSE NULL END as phone,
             CASE WHEN up.email_visible = 1 OR ? THEN u.email ELSE NULL END as email,
             up.ministry_areas, u.created_at, u.last_login, u.is_active
      FROM users u 
      JOIN user_profiles up ON u.id = up.user_id 
      WHERE u.is_active = 1
      ORDER BY u.last_name, u.first_name
    `;
    
    return await allQuery(db, query, [includePrivate, includePrivate]);
  } finally {
    db.close();
  }
}

// Admin user management operations
export async function getAllUsers() {
  const db = getDb();
  try {
    const query = `
      SELECT u.id, u.email, u.phone, u.role, u.created_at, u.last_login, u.is_active,
             u.failed_login_attempts, u.locked_until,
             up.first_name, up.last_name, up.bio, up.photo_url,
             up.phone_visible, up.email_visible, up.ministry_areas
      FROM users u 
      LEFT JOIN user_profiles up ON u.id = up.user_id 
      ORDER BY u.created_at DESC
    `;
    
    return await allQuery(db, query);
  } finally {
    db.close();
  }
}

export async function getUserById(userId) {
  const db = getDb();
  try {
    const query = `
      SELECT u.id, u.email, u.phone, u.role, u.created_at, u.last_login, u.is_active,
             u.failed_login_attempts, u.locked_until,
             up.first_name, up.last_name, up.bio, up.photo_url,
             up.phone_visible, up.email_visible, up.ministry_areas
      FROM users u 
      LEFT JOIN user_profiles up ON u.id = up.user_id 
      WHERE u.id = ?
    `;
    
    return await getQuery(db, query, [userId]);
  } finally {
    db.close();
  }
}

export async function updateUserRole(userId, newRole) {
  const db = getDb();
  try {
    await runQuery(
      db,
      'UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newRole, userId]
    );
  } finally {
    db.close();
  }
}

export async function updateUserStatus(userId, isActive) {
  const db = getDb();
  try {
    await runQuery(
      db,
      'UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [isActive ? 1 : 0, userId]
    );
  } finally {
    db.close();
  }
}

export async function updateUserProfile(userId, profileData) {
  const db = getDb();
  try {
    const { firstName, lastName, bio, photoUrl, phoneVisible, emailVisible, ministryAreas } = profileData;
    
    // Check if profile exists
    const existingProfile = await getQuery(
      db,
      'SELECT id FROM user_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (existingProfile) {
      // Update existing profile
      await runQuery(
        db,
        `UPDATE user_profiles 
         SET first_name = ?, last_name = ?, bio = ?, photo_url = ?, 
             phone_visible = ?, email_visible = ?, ministry_areas = ?, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [firstName, lastName, bio, photoUrl, phoneVisible, emailVisible, ministryAreas, userId]
      );
    } else {
      // Create new profile
      await runQuery(
        db,
        `INSERT INTO user_profiles 
         (user_id, first_name, last_name, bio, photo_url, phone_visible, email_visible, ministry_areas)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, firstName, lastName, bio, photoUrl, phoneVisible, emailVisible, ministryAreas]
      );
    }
  } finally {
    db.close();
  }
}

export async function deleteUser(userId) {
  const db = getDb();
  try {
    await runQuery(
      db,
      'UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [userId]
    );
  } finally {
    db.close();
  }
}

export async function resetUserPassword(userId, newPasswordHash) {
  const db = getDb();
  try {
    await runQuery(
      db,
      'UPDATE users SET password_hash = ?, failed_login_attempts = 0, locked_until = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newPasswordHash, userId]
    );
  } finally {
    db.close();
  }
}

export async function getUserStats() {
  const db = getDb();
  try {
    const total = await getQuery(db, 'SELECT COUNT(*) as count FROM users WHERE is_active = 1');
    const active = await getQuery(db, 'SELECT COUNT(*) as count FROM users WHERE is_active = 1 AND last_login IS NOT NULL');
    const newUsers = await getQuery(db, 'SELECT COUNT(*) as count FROM users WHERE created_at >= date("now", "-30 days")');
    
    return {
      total: total.count,
      active: active.count,
      newUsers: newUsers.count
    };
  } finally {
    db.close();
  }
}

// Service Roles Functions
export async function getServiceRoles() {
  const db = getDb();
  try {
    const query = 'SELECT * FROM service_roles WHERE is_active = 1 ORDER BY sort_order ASC, display_name ASC';
    return await allQuery(db, query);
  } finally {
    db.close();
  }
}

export async function getUserServiceRoles(userId) {
  const db = getDb();
  try {
    const query = 'SELECT service_roles FROM users WHERE id = ?';
    const result = await getQuery(db, query, [userId]);
    return result ? (result.service_roles ? JSON.parse(result.service_roles) : []) : [];
  } finally {
    db.close();
  }
}

export async function updateUserServiceRoles(userId, serviceRoles) {
  const db = getDb();
  try {
    const query = 'UPDATE users SET service_roles = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await runQuery(db, query, [JSON.stringify(serviceRoles), userId]);
    return true;
  } finally {
    db.close();
  }
}

export async function getUsersByServiceRole(serviceRole) {
  const db = getDb();
  try {
    const query = `
      SELECT u.*, up.first_name, up.last_name, up.photo_url
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.is_active = 1 AND u.service_roles LIKE ?
      ORDER BY up.last_name ASC, up.first_name ASC
    `;
    const users = await allQuery(db, query, [`%"${serviceRole}"%`]);
    
    // Parse service roles for each user
    return users.map(user => ({
      ...user,
      service_roles: user.service_roles ? JSON.parse(user.service_roles) : []
    }));
  } finally {
    db.close();
  }
}

export async function updateUserLoginInfo(userId, loginInfo) {
  const db = getDb();
  try {
    const { email, phone, password, role } = loginInfo;
    
    // Build update query dynamically
    let query = 'UPDATE users SET updated_at = CURRENT_TIMESTAMP';
    const params = [];
    
    if (email) {
      query += ', email = ?';
      params.push(email);
    }
    
    if (phone) {
      query += ', phone = ?';
      params.push(phone);
    }
    
    if (password) {
      const bcrypt = require('bcryptjs');
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(password, saltRounds);
      query += ', password_hash = ?';
      params.push(password_hash);
    }
    
    if (role) {
      query += ', role = ?';
      params.push(role);
    }
    
    query += ' WHERE id = ?';
    params.push(userId);
    
    await runQuery(db, query, params);
    return true;
  } finally {
    db.close();
  }
}
