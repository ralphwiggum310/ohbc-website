import { query } from '@/lib/db';
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
    if (!cookieHeader) return null;
    
    // Extract accessToken from cookies
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) acc[key] = value;
      return acc;
    }, {});
    
    const accessToken = cookies.accessToken;
    if (!accessToken) return null;
    
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded = jwt.verify(accessToken, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

// Database helper functions
function getUsersDb() {
  const dbPath = path.join(process.cwd(), 'data', 'users', 'ohbc_users.db');
  return new Database(dbPath);
}

// User management functions
async function getAllUsers() {
  const db = getUsersDb();
  try {
    const users = db.prepare(`
      SELECT id, email, first_name, last_name, role, status as is_active, created_at, last_login,
             mobile_phone as phone, photo_url, bio
      FROM users 
      ORDER BY created_at DESC
    `).all();
    
    // Transform data to match frontend expectations
    return users.map(user => ({
      ...user,
      is_active: user.is_active === 'Active',
      service_roles: [], // Empty for now
      failed_login_attempts: 0,
      locked_until: null,
      phone_visible: true,
      email_visible: true,
      ministry_areas: null,
      tags: null,
      notes: null
    }));
  } finally {
    db.close();
  }
}

async function getUserById(userId) {
  const db = getUsersDb();
  try {
    const user = db.prepare(`
      SELECT id, email, first_name, last_name, middle_name, suffix, nickname,
             photo_url, bio, primary_email, secondary_email, home_phone, mobile_phone,
             work_phone, address_street, address_city, address_state, address_zip,
             address_country, spouse_name, children_names, anniversary_date, occupation,
             company, membership_status, ministry_areas, categories, facebook_url,
             instagram_url, twitter_url, linkedin_url, work_address, member_since,
             baptism_date, spiritual_gifts, life_groups, role, status, created_at, last_login
      FROM users WHERE id = ?
    `).get(userId);
    return user;
  } finally {
    db.close();
  }
}

async function updateUserRole(userId, newRole) {
  const db = getUsersDb();
  try {
    const result = db.prepare('UPDATE users SET role = ? WHERE id = ?').run(newRole, userId);
    return result.changes > 0;
  } finally {
    db.close();
  }
}

async function updateUserStatus(userId, isActive) {
  const db = getUsersDb();
  try {
    const result = db.prepare('UPDATE users SET status = ? WHERE id = ?').run(isActive ? 'Active' : 'Inactive', userId);
    return result.changes > 0;
  } finally {
    db.close();
  }
}

async function updateUserProfile(userId, updateData) {
  const db = getUsersDb();
  try {
    const fields = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
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

async function deleteUser(userId) {
  const db = getUsersDb();
  try {
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    return result.changes > 0;
  } finally {
    db.close();
  }
}

async function resetUserPassword(userId, newPasswordHash) {
  const db = getUsersDb();
  try {
    const result = db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newPasswordHash, userId);
    return result.changes > 0;
  } finally {
    db.close();
  }
}

async function getUserStats() {
  const db = getUsersDb();
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const activeUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE status = \'Active\'').get().count;
    const adminUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE role IN (\'Admin\', \'Super Admin\')').get().count;
    
    return {
      totalUsers,
      activeUsers,
      adminUsers,
      inactiveUsers: totalUsers - activeUsers
    };
  } finally {
    db.close();
  }
}

async function getServiceRoles() {
  // Return predefined service roles
  return [
    { id: 'pastor', name: 'Pastor', description: 'Church pastor' },
    { id: 'elder', name: 'Elder', description: 'Church elder' },
    { id: 'deacon', name: 'Deacon', description: 'Church deacon' },
    { id: 'teacher', name: 'Teacher', description: 'Sunday school teacher' },
    { id: 'worship_leader', name: 'Worship Leader', description: 'Worship team leader' },
    { id: 'youth_leader', name: 'Youth Leader', description: 'Youth ministry leader' },
    { id: 'volunteer', name: 'Volunteer', description: 'General volunteer' }
  ];
}

async function getUserServiceRoles(userId) {
  // For now, return empty array - this would need a separate table in the database
  return [];
}

async function updateUserServiceRoles(userId, serviceRoles) {
  // For now, just return true - this would need a separate table in the database
  return true;
}

async function updateUserLoginInfo(userId, loginInfo) {
  const db = getUsersDb();
  try {
    const result = db.prepare('UPDATE users SET last_login = ? WHERE id = ?').run(loginInfo.lastLogin, userId);
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
    
    if (!user || !['Admin', 'Super Admin'].includes(user.role)) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (userId) {
      // Get specific user
      const user = await getUserById(parseInt(userId));
      if (!user) {
        return Response.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      return Response.json({
        success: true,
        user
      });
    } else {
      // Get all users with stats
      const [users, stats] = await Promise.all([
        getAllUsers(),
        getUserStats()
      ]);
      
      return Response.json({
        success: true,
        users,
        stats: {
          total: stats.totalUsers,
          active: stats.activeUsers,
          new: stats.totalUsers - stats.activeUsers // Simplified
        }
      });
    }
  } catch (error) {
    console.error('Get users error:', error);
    return Response.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function GET_SERVICE_ROLES(request) {
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

    const serviceRoles = await getServiceRoles();
    return Response.json({
      success: true,
      serviceRoles
    });
  } catch (error) {
    console.error('Service roles error:', error);
    return Response.json(
      { error: 'Failed to fetch service roles' },
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
    
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    const { action, ...updateData } = await request.json();

    if (!userId) {
      return Response.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'role':
        // Update user role (admin only)
        if (!['Super Admin', 'Admin'].includes(user.role)) {
          return Response.json(
            { error: 'Insufficient permissions to change roles' },
            { status: 403 }
          );
        }
        
        if (!updateData.newRole) {
          return Response.json(
            { error: 'New role is required' },
            { status: 400 }
          );
        }
        
        await updateUserRole(parseInt(userId), updateData.newRole);
        return Response.json({
          success: true,
          message: 'User role updated successfully'
        });

      case 'status':
        // Update user status (activate/deactivate)
        if (updateData.isActive === undefined) {
          return Response.json(
            { error: 'Status is required' },
            { status: 400 }
          );
        }
        
        await updateUserStatus(parseInt(userId), updateData.isActive);
        return Response.json({
          success: true,
          message: `User ${updateData.isActive ? 'activated' : 'deactivated'} successfully`
        });

      case 'profile':
        // Update user profile
        await updateUserProfile(parseInt(userId), updateData);
        return Response.json({
          success: true,
          message: 'User profile updated successfully'
        });

      default:
        return Response.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Update user error:', error);
    return Response.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
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

    if (!userId) {
      return Response.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Prevent self-deletion
    if (parseInt(userId) === (tokenData.userId || tokenData.id)) {
      return Response.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    await deleteUser(parseInt(userId));
    return Response.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return Response.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
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
    const userId = searchParams.get('id');
    const { action, ...data } = await request.json();

    if (!userId) {
      return Response.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'reset-password':
        // Reset user password (admin only)
        if (!['Super Admin', 'Admin'].includes(user.role)) {
          return Response.json(
            { error: 'Insufficient permissions to reset passwords' },
            { status: 403 }
          );
        }

        if (!data.newPassword) {
          return Response.json(
            { error: 'New password is required' },
            { status: 400 }
          );
        }

        const newPasswordHash = await hashPassword(data.newPassword);
        await resetUserPassword(parseInt(userId), newPasswordHash);
        
        return Response.json({
          success: true,
          message: 'Password reset successfully'
        });

      default:
        return Response.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('User management error:', error);
    return Response.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
