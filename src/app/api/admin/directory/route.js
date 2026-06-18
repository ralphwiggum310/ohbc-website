import { searchDirectoryAdmin } from '@/lib/directory-unified';
import { hashPassword } from '@/lib/auth';
import Database from 'better-sqlite3';
import path from 'path';
import jwt from 'jsonwebtoken';

// JWT verification helper
function getUserIdFromToken(request) {
  try {
    // Try to get token from Authorization header first
    const authHeader = request.headers.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    }
    
    // Fallback to cookies if header not available
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});
      
      const accessToken = cookies.accessToken || cookies.refreshToken || cookies.auth_token;
      if (!accessToken) {
        console.log('Directory API - No token found in cookies');
        return null;
      }
      
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      try {
        const decoded = jwt.verify(accessToken, JWT_SECRET);
        return decoded;
      } catch (jwtError) {
        console.error('Directory API - JWT verification failed:', jwtError.message);
        return null;
      }
    }
    
    console.log('Directory API - No auth header or cookies found');
    return null;
  } catch (error) {
    console.error('Directory API - Token verification error:', error.message);
    return null;
  }
}

// Database helper functions
function getUsersDb() {
  const dbPath = path.join(process.cwd(), 'data', 'users', 'ohbc_users.db');
  return new Database(dbPath);
}

// Directory functions
async function getMembersDirectory(includePrivate = false) {
  try {
    // For admin directory, we want to show ALL members regardless of status
    // Use the admin-specific searchDirectory function
    const filters = {
      // No filters by default - show all records
    };
    
    const members = await searchDirectoryAdmin('', filters);
    return members;
  } catch (error) {
    console.error('Error fetching directory:', error);
    return [];
  }
}

async function updateUserProfile(userId, updateData) {
  const db = getUsersDb();
  try {
    const fields = [];
    const values = [];
    
    // Map frontend field names to database field names
    const fieldMapping = {
      firstName: 'first_name',
      lastName: 'last_name',
      bio: 'bio',
      photoUrl: 'photo_url',
      phoneVisible: 'phone_visible',
      emailVisible: 'email_visible',
      ministryAreas: 'ministry_areas'
    };
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && fieldMapping[key]) {
        fields.push(`${fieldMapping[key]} = ?`);
        values.push(updateData[key]);
      }
    });
    
    if (fields.length === 0) return false;
    
    values.push(userId);
    const result = db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return result.changes > 0;
  } finally {
    db.close();
  }
}

export async function GET(request) {
  try {
    // JWT authentication check
    const tokenData = getUserIdFromToken(request);
    if (!tokenData) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user details from database to verify role
    const db = getUsersDb();
    let user;
    try {
      user = db.prepare('SELECT id, email, role FROM users WHERE id = ?').get(tokenData.userId || tokenData.id);
    } finally {
      db.close();
    }
    
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const includePrivate = searchParams.get('includePrivate') === 'true';
    
    // Admins and leaders can see private info
    const canSeePrivate = ['Super Admin', 'Admin', 'Ministry Leader'].includes(user.role);
    const finalIncludePrivate = includePrivate && canSeePrivate;
    
    const members = await getMembersDirectory(finalIncludePrivate);
    
    return Response.json({
      success: true,
      members,
      includePrivate: finalIncludePrivate,
      totalMembers: members.length
    });
  } catch (error) {
    console.error('Directory error:', error);
    return Response.json(
      { error: 'Failed to fetch directory' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    // JWT authentication check
    const tokenData = getUserIdFromToken(request);
    if (!tokenData) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user details from database to verify role
    const db = getUsersDb();
    let user;
    try {
      user = db.prepare('SELECT id, email, role FROM users WHERE id = ?').get(tokenData.userId || tokenData.id);
    } finally {
      db.close();
    }
    
    if (!user || !['Super Admin', 'Admin'].includes(user.role)) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    const updateData = await request.json();

    if (!userId) {
      return Response.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Update user profile privacy settings
    const success = await updateUserProfile(parseInt(userId), updateData);

    if (success) {
      return Response.json({
        success: true,
        message: 'Member profile updated successfully'
      });
    } else {
      return Response.json(
        { error: 'Failed to update member profile' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Directory update error:', error);
    return Response.json(
      { error: 'Failed to update member profile' },
      { status: 500 }
    );
  }
}
