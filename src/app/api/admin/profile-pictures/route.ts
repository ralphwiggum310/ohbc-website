import { NextRequest, NextResponse } from 'next/server';
import { readFile, unlink, rename } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';
import path from 'path';

// Helper function to parse JWT and get user ID
function getUserIdFromToken(token: string): number | null {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.userId || decoded.id || null;
  } catch (error) {
    return null;
  }
}

// Helper function to check if user is admin
function isAdmin(user: any): boolean {
  return user && (user.role === 'Admin' || user.role === 'Super Admin');
}

// Helper function to get database connection
function getUsersDb() {
  return new Database(path.join(process.cwd(), 'data', 'users', 'ohbc_users.db'));
}

// Helper function to move file from review to approved
async function approveFile(filename: string): Promise<boolean> {
  try {
    const reviewPath = join(process.cwd(), 'data', 'users', 'directory', 'review', filename);
    const approvedPath = join(process.cwd(), 'data', 'users', 'directory', 'approved', filename);
    
    if (!existsSync(reviewPath)) {
      console.error('Review file not found:', reviewPath);
      return false;
    }
    
    await rename(reviewPath, approvedPath);
    return true;
  } catch (error) {
    console.error('Error moving file:', error);
    return false;
  }
}

// Helper function to delete file from review
async function deleteFile(filename: string): Promise<boolean> {
  try {
    const reviewPath = join(process.cwd(), 'data', 'users', 'directory', 'review', filename);
    
    if (existsSync(reviewPath)) {
      await unlink(reviewPath);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user from session cookie
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse JWT token to get user ID
    const userId = getUserIdFromToken(accessToken);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const db = getUsersDb();
    try {
      // Get user info to check admin role
      const user = db.prepare('SELECT id, email, role FROM users WHERE id = ?').get(userId);
      if (!isAdmin(user)) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }

      // Get pending reviews
      const pendingReviews = db.prepare(`
        SELECT r.*, u.first_name, u.last_name, u.email
        FROM profile_picture_reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.status = 'pending'
        ORDER BY r.uploaded_at DESC
      `).all();

      // Get all reviews with pagination
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const offset = (page - 1) * limit;

      const allReviews = db.prepare(`
        SELECT r.*, u.first_name, u.last_name, u.email
        FROM profile_picture_reviews r
        JOIN users u ON r.user_id = u.id
        ORDER BY r.uploaded_at DESC
        LIMIT ? OFFSET ?
      `).all(limit, offset);

      const totalCount = db.prepare('SELECT COUNT(*) as count FROM profile_picture_reviews').get() as { count: number };

      return NextResponse.json({
        success: true,
        pendingReviews,
        allReviews,
        pagination: {
          page,
          limit,
          total: totalCount.count,
          totalPages: Math.ceil(totalCount.count / limit)
        }
      });

    } finally {
      db.close();
    }

  } catch (error) {
    console.error('Error getting profile picture reviews:', error);
    return NextResponse.json({ 
      error: 'Failed to get profile picture reviews',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from session cookie
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse JWT token to get user ID
    const adminUserId = getUserIdFromToken(accessToken);
    if (!adminUserId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { action, reviewId, rejectionReason, adminNotes } = body;

    if (!['approve', 'reject'].includes(action) || !reviewId) {
      return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
    }

    const db = getUsersDb();
    try {
      // Get admin user info to check role
      const adminUser = db.prepare('SELECT id, email, role FROM users WHERE id = ?').get(adminUserId);
      if (!isAdmin(adminUser)) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }

      // Get review details
      const review = db.prepare(`
        SELECT r.*, u.email as user_email
        FROM profile_picture_reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.id = ?
      `).get(reviewId) as any;

      if (!review) {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 });
      }

      if (review.status !== 'pending') {
        return NextResponse.json({ error: 'Review already processed' }, { status: 400 });
      }

      let success = false;
      let message = '';

      if (action === 'approve') {
        // Move file from review to approved
        success = await approveFile(review.filename);
        
        if (success) {
          // Update review record
          db.prepare(`
            UPDATE profile_picture_reviews 
            SET status = 'approved', reviewed_at = CURRENT_TIMESTAMP, 
                reviewed_by = ?, admin_notes = ?
            WHERE id = ?
          `).run(adminUserId, adminNotes || null, reviewId);

          // Update user's profile picture status
          db.prepare(`
            UPDATE users 
            SET profile_picture_status = 'approved',
                profile_picture_reviewed_at = CURRENT_TIMESTAMP,
                profile_picture_reviewed_by = ?,
                profile_picture_rejection_reason = NULL
            WHERE id = ?
          `).run(adminUserId, review.user_id);

          message = 'Profile picture approved successfully';
        } else {
          message = 'Failed to move file to approved directory';
        }
      } else if (action === 'reject') {
        // Delete file from review directory
        success = await deleteFile(review.filename);
        
        if (success) {
          // Update review record
          db.prepare(`
            UPDATE profile_picture_reviews 
            SET status = 'rejected', reviewed_at = CURRENT_TIMESTAMP, 
                reviewed_by = ?, rejection_reason = ?, admin_notes = ?
            WHERE id = ?
          `).run(adminUserId, rejectionReason || null, adminNotes || null, reviewId);

          // Update user's profile picture status
          db.prepare(`
            UPDATE users 
            SET profile_picture_status = 'rejected',
                profile_picture_reviewed_at = CURRENT_TIMESTAMP,
                profile_picture_reviewed_by = ?,
                profile_picture_rejection_reason = ?
            WHERE id = ?
          `).run(adminUserId, rejectionReason || null, review.user_id);

          message = 'Profile picture rejected';
        } else {
          message = 'Failed to delete file from review directory';
        }
      }

      console.log(`Admin ${(adminUser as any).email} ${action}d profile picture ${review.filename} for user ${review.user_email}`);

      return NextResponse.json({
        success,
        message,
        action,
        reviewId
      });

    } finally {
      db.close();
    }

  } catch (error) {
    console.error('Error processing profile picture review:', error);
    return NextResponse.json({ 
      error: 'Failed to process review',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get user from session cookie
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse JWT token to get user ID
    const adminUserId = getUserIdFromToken(accessToken);
    if (!adminUserId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const filename = searchParams.get('filename');

    if (!userId || !filename) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const db = getUsersDb();
    try {
      // Check admin role
      const adminUser = db.prepare('SELECT id, email, role FROM users WHERE id = ?').get(adminUserId) as any;
      if (!isAdmin(adminUser)) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }

      // Delete from both review and approved directories
      const reviewPath = join(process.cwd(), 'data', 'users', 'directory', 'review', filename);
      const approvedPath = join(process.cwd(), 'data', 'users', 'directory', 'approved', filename);

      try {
        if (existsSync(reviewPath)) {
          await unlink(reviewPath);
        }
        if (existsSync(approvedPath)) {
          await unlink(approvedPath);
        }
      } catch (error) {
        console.error('Error deleting image files:', error);
      }

      // Update user record
      db.prepare(`
        UPDATE users 
        SET profile_picture_filename = NULL,
            profile_picture_status = 'none',
            profile_picture_uploaded_at = NULL,
            profile_picture_reviewed_at = NULL,
            profile_picture_reviewed_by = NULL,
            profile_picture_rejection_reason = NULL
        WHERE id = ?
      `).run(parseInt(userId));

      // Update review records
      db.prepare(`
        UPDATE profile_picture_reviews 
        SET status = 'deleted', reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ?
        WHERE user_id = ? AND filename = ?
      `).run(adminUserId, parseInt(userId), filename);

      console.log(`Admin ${adminUser.email} deleted profile picture ${filename} for user ${userId}`);

      return NextResponse.json({
        success: true,
        message: 'Profile picture deleted successfully'
      });

    } finally {
      db.close();
    }

  } catch (error) {
    console.error('Error deleting profile picture:', error);
    return NextResponse.json({ 
      error: 'Failed to delete profile picture',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
