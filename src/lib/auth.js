import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Database path — env var takes priority so production can use an absolute path
// regardless of what process.cwd() returns inside the Next.js runtime
const USERS_DB_PATH = process.env.USERS_DB_PATH
  || path.join(process.cwd(), 'data', 'users', 'ohbc_users.db');

// Helper function to get database connection
function getUsersDb() {
  return new Database(USERS_DB_PATH);
}

// Helper function to verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Helper function to get token from request
function getTokenFromRequest(request) {
  // Check Authorization header first (frontend sends it here)
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Fallback to cookies
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    
    // Prioritize access token, fallback to refresh token
    return cookies.accessToken || cookies.refreshToken || cookies.auth_token;
  }
  
  return null;
}

// Login function
export async function loginUser(identifier, password) {
  const db = getUsersDb();
  
  try {
    // Find user by email or phone
    const query = 'SELECT * FROM users WHERE (email = ? OR phone = ?) AND is_active = 1';
    const user = db.prepare(query).get(identifier, identifier);
    
    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }
    
    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return { success: false, error: 'Account temporarily locked' };
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      // Increment failed login attempts
      const failedAttempts = user.failed_login_attempts + 1;
      const lockThreshold = 5;
      
      if (failedAttempts >= lockThreshold) {
        // Lock account for 30 minutes
        const lockUntil = new Date(Date.now() + 30 * 60 * 1000);
        db.prepare('UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?')
          .run(failedAttempts, lockUntil.toISOString(), user.id);
        
        return { success: false, error: 'Account locked due to too many failed attempts' };
      } else {
        // Increment failed attempts
        db.prepare('UPDATE users SET failed_login_attempts = ? WHERE id = ?')
          .run(failedAttempts, user.id);
      }
      
      return { success: false, error: 'Invalid credentials' };
    }
    
    // Reset failed login attempts on successful login
    db.prepare('UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login = CURRENT_TIMESTAMP WHERE id = ?')
      .run(user.id);
    
    // Generate JWT tokens
    const accessToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        phone: user.phone
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 3600 // 1 hour in seconds
      }
    };
    
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Internal server error' };
  } finally {
    db.close();
  }
}

// Authentication middleware
export function requireAuth(handler) {
  return async (request, ...args) => {
    const token = getTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    // Add user info to request for downstream handlers
    request.user = decoded;
    
    return handler(request, ...args);
  };
}

// Role-based access control
export function requireRole(requiredRole) {
  return (handler) => {
    return requireAuth(async (request, ...args) => {
      const userRole = request.user?.role;
      
      if (!userRole) {
        return NextResponse.json(
          { error: 'User role not found' },
          { status: 403 }
        );
      }
      
      // Define role hierarchy
      const roleHierarchy = {
        'Super Admin': 5,
        'Admin': 4,
        'Ministry Leader': 3,
        'Member': 2,
        'Guest': 1
      };
      
      const userRoleLevel = roleHierarchy[userRole] || 0;
      const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
      
      if (userRoleLevel < requiredRoleLevel) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
      
      return handler(request, ...args);
    });
  };
}

// Check if user has specific role
export function hasRole(user, requiredRole) {
  if (!user || !user.role) return false;
  
  const roleHierarchy = {
    'Super Admin': 5,
    'Admin': 4,
    'Ministry Leader': 3,
    'Member': 2,
    'Guest': 1
  };
  
  const userRoleLevel = roleHierarchy[user.role] || 0;
  const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
  
  return userRoleLevel >= requiredRoleLevel;
}

// Check if user is admin or higher
export function isAdmin(user) {
  return hasRole(user, 'Admin');
}

// Check if user is super admin
export function isSuperAdmin(user) {
  return user?.role === 'Super Admin';
}

// Get current user from request
export function getCurrentUser(request) {
  return request.user;
}

// Logout function
export async function logoutUser(token) {
  // In a real application, you might want to:
  // 1. Add the token to a blacklist
  // 2. Remove the token from user's active sessions
  // 3. Log the logout event
  
  // For now, we'll just verify the token was valid
  const decoded = verifyToken(token);
  return decoded ? { success: true } : { success: false };
}

// Authenticate user from request (for verify endpoint)
export async function authenticateUser(request) {
  const token = getTokenFromRequest(request);
  
  if (!token) {
    return { user: null, error: 'No token provided' };
  }
  
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return { user: null, error: 'Invalid or expired token' };
  }
  
  // Get fresh user data from database
  const db = getUsersDb();
  
  try {
    const user = db.prepare('SELECT id, email, role, phone FROM users WHERE id = ? AND is_active = 1')
      .get(decoded.userId || decoded.id);
    
    if (!user) {
      return { user: null, error: 'User not found' };
    }
    
    return { user, error: null };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { user: null, error: 'Database error' };
  } finally {
    db.close();
  }
}

// Helper function to hash password
export function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

// Helper function to compare password
export function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}
