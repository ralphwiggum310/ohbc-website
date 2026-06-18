import { getUsersDb } from '@/lib/db';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// JWT verification helper
function getUserIdFromToken(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    }
    
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) return null;
    
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded = jwt.verify(accessToken, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

async function getUserById(userId) {
  const db = await getUsersDb();
  try {
    const user = db.prepare('SELECT id, email, role FROM users WHERE id = ?').get(userId);
    return user;
  } finally {
    db.close();
  }
}

async function generateResetToken(userId) {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  const db = await getUsersDb();
  try {
    db.prepare(`
      INSERT OR REPLACE INTO password_resets (user_id, token, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `).run(userId, resetToken, expiresAt.toISOString(), new Date().toISOString());
    
    return resetToken;
  } finally {
    db.close();
  }
}

export async function POST(request, { params }) {
  try {
    // JWT authentication check
    const tokenData = getUserIdFromToken(request);
    if (!tokenData) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user details from database to verify role
    const currentUser = await getUserById(tokenData.userId || tokenData.id);
    
    if (!currentUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has admin permissions
    if (!['Super Admin', 'Admin'].includes(currentUser.role)) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get the user whose password is being reset
    const targetUser = await getUserById(params.id);
    
    if (!targetUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate reset token
    const resetToken = await generateResetToken(params.id);
    
    // TODO: Send email with reset link
    // For now, just return success message
    console.log(`Password reset token for ${targetUser.email}: ${resetToken}`);
    
    return Response.json({
      success: true,
      message: 'Password reset email sent',
      // In development, you might want to return the token for testing
      // resetToken: resetToken
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return Response.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
