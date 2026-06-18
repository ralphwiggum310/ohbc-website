import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getUserByEmail, getUserByPhone, updateUserLastLogin, updateFailedLoginAttempts, lockUserAccount, resetFailedLoginAttempts, createSession, getSession, refreshSession, invalidateSession, updateSessionLastUsed, getRolePermissions } from './database.js';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production';
const JWT_EXPIRES_IN = '15m';
const JWT_REFRESH_EXPIRES_IN = '7d';

// Rate limiting configuration
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MINUTES = 30;

// Password validation
export function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];
  if (password.length < minLength) errors.push(`Password must be at least ${minLength} characters long`);
  if (!hasUpperCase) errors.push('Password must contain at least one uppercase letter');
  if (!hasLowerCase) errors.push('Password must contain at least one lowercase letter');
  if (!hasNumbers) errors.push('Password must contain at least one number');
  if (!hasSpecialChar) errors.push('Password must contain at least one special character');

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Email validation
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone validation (US format)
export function validatePhone(phone) {
  const phoneRegex = /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
  return phoneRegex.test(phone);
}

// Hash password
export async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Verify password
export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Generate tokens
export function generateTokens(userId, role) {
  const accessToken = jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: JWT_EXPIRES_IN
  };
}

// Verify access token
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Verify refresh token
export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
}

// Generate secure token
export function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Authentication middleware
export async function authenticateUser(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null, error: 'No token provided' };
    }

    const token = authHeader.substring(7);
    
    // Verify token
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return { user: null, error: 'Invalid token' };
    }

    // Check session in database
    const session = await getSession(token);
    if (!session) {
      return { user: null, error: 'Session not found or expired' };
    }

    // Update last used time
    await updateSessionLastUsed(token);

    // Get user permissions
    const permissions = await getRolePermissions(session.role);

    return {
      user: {
        id: session.user_id,
        email: session.email,
        role: session.role,
        permissions
      },
      error: null
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { user: null, error: 'Authentication failed' };
  }
}

// Role-based access control
export function hasPermission(userPermissions, resource, action) {
  if (!userPermissions) return false;
  
  // Super admin has all permissions
  if (userPermissions.all === true) return true;
  
  // Check specific resource permissions
  const resourcePermissions = userPermissions[resource];
  if (!resourcePermissions) return false;
  
  return resourcePermissions.includes(action);
}

// Authorization middleware factory
export function requireAuth(handler) {
  return async (req) => {
    const { user, error } = await authenticateUser(req);
    
    if (error || !user) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Add user to request object
    req.user = user;
    return handler(req);
  };
}

// Role-based authorization middleware factory
export function requireRole(allowedRoles) {
  return (handler) => {
    return requireAuth(async (req) => {
      if (!allowedRoles.includes(req.user.role)) {
        return Response.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
      
      return handler(req);
    });
  };
}

// Permission-based authorization middleware factory
export function requirePermission(resource, action) {
  return (handler) => {
    return requireAuth(async (req) => {
      if (!hasPermission(req.user.permissions, resource, action)) {
        return Response.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
      
      return handler(req);
    });
  };
}

// Login function
export async function loginUser(identifier, password) {
  try {
    // Check if identifier is email or phone
    const isEmail = validateEmail(identifier);
    const user = isEmail 
      ? await getUserByEmail(identifier)
      : await getUserByPhone(identifier);

    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return { 
        success: false, 
        error: 'Account locked. Please try again later.' 
      };
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      // Increment failed attempts
      const newAttempts = (user.failed_login_attempts || 0) + 1;
      await updateFailedLoginAttempts(user.email, newAttempts);

      // Lock account if too many attempts
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockUntil = new Date(Date.now() + LOCK_TIME_MINUTES * 60 * 1000);
        await lockUserAccount(user.email, lockUntil.toISOString());
        
        return { 
          success: false, 
          error: 'Account locked due to too many failed attempts. Please try again later.' 
        };
      }

      return { success: false, error: 'Invalid credentials' };
    }

    // Reset failed attempts on successful login
    await resetFailedLoginAttempts(user.email);

    // Update last login
    await updateUserLastLogin(user.id);

    // Get user permissions
    const permissions = await getRolePermissions(user.role);

    // Generate tokens
    const { accessToken, refreshToken, expiresIn } = generateTokens(user.id, user.role);

    // Store session in database
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await createSession({
      userId: user.id,
      token: accessToken,
      refreshToken,
      expiresAt: expiresAt.toISOString()
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed' };
  }
}

// Refresh token function
export async function refreshUserToken(refreshToken) {
  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return { success: false, error: 'Invalid refresh token' };
    }

    // Check session in database
    const session = await refreshSession(refreshToken);
    if (!session) {
      return { success: false, error: 'Session not found or expired' };
    }

    // Get user info
    const user = await getUserByEmail(session.user_id ? 
      (await getUserByEmail(session.user_id))?.email : null);
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken, expiresIn } = generateTokens(user.id, user.role);

    // Update session
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await invalidateSession(session.token);
    await createSession({
      userId: user.id,
      token: accessToken,
      refreshToken: newRefreshToken,
      expiresAt: expiresAt.toISOString()
    });

    return {
      success: true,
      tokens: {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn
      }
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    return { success: false, error: 'Token refresh failed' };
  }
}

// Logout function
export async function logoutUser(token) {
  try {
    await invalidateSession(token);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Logout failed' };
  }
}
