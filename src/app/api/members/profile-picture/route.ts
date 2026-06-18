import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
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

// Helper function to get database connection
function getUsersDb() {
  return new Database(path.join(process.cwd(), 'data', 'users', 'ohbc_users.db'));
}

// Helper function to validate image file
function validateImageFile(file: File) {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File too large. Maximum size is 5MB.' };
  }
  
  return { valid: true };
}

export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `${userId}_${timestamp}_${randomString}.${fileExtension}`;
    
    // Ensure review directory exists
    const reviewDir = join(process.cwd(), 'data', 'users', 'directory', 'review');
    try {
      await mkdir(reviewDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
    
    // Save file to review directory
    const filePath = join(reviewDir, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Save to database
    const db = getUsersDb();
    try {
      // Insert into profile picture reviews table
      const result = db.prepare(`
        INSERT INTO profile_picture_reviews 
        (user_id, filename, original_filename, file_size, mime_type, status)
        VALUES (?, ?, ?, ?, ?, 'pending')
      `).run(
        userId,
        filename,
        file.name,
        file.size,
        file.type
      );

      // Update user's profile picture status
      db.prepare(`
        UPDATE users 
        SET profile_picture_filename = ?,
            profile_picture_status = 'pending',
            profile_picture_uploaded_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(filename, userId);

      console.log(`Profile picture uploaded: ${filename} for user ${userId}`);

      return NextResponse.json({
        success: true,
        message: 'Profile picture uploaded successfully. It will be reviewed by an administrator.',
        filename: filename,
        reviewId: result.lastInsertRowid
      });

    } finally {
      db.close();
    }

  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return NextResponse.json({ 
      error: 'Failed to upload profile picture',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
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
      // Get user's current profile picture status
      const user = db.prepare(`
        SELECT profile_picture_filename, profile_picture_status, 
               profile_picture_uploaded_at, profile_picture_reviewed_at,
               profile_picture_rejection_reason
        FROM users WHERE id = ?
      `).get(userId);

      // Get review history
      const reviews = db.prepare(`
        SELECT id, filename, original_filename, status, uploaded_at, 
               reviewed_at, rejection_reason, admin_notes
        FROM profile_picture_reviews 
        WHERE user_id = ? 
        ORDER BY uploaded_at DESC
      `).all(userId);

      return NextResponse.json({
        success: true,
        currentPicture: user,
        reviewHistory: reviews
      });

    } finally {
      db.close();
    }

  } catch (error) {
    console.error('Error getting profile picture status:', error);
    return NextResponse.json({ 
      error: 'Failed to get profile picture status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
