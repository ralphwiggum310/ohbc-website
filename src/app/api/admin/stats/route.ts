import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import path from 'path';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';
import { promises as fs } from 'fs';

// Enable debug logging in development
const DEBUG = process.env.NODE_ENV === 'development';

// JWT verification helper
function getUserIdFromToken(request: Request) {
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

// Helper function to get directory size
async function getDirectorySize(directory: string): Promise<number> {
  const files = await readdir(directory, { withFileTypes: true });
  let totalSize = 0;
  
  for (const file of files) {
    if (file.name === '.gitkeep') continue;
    
    const filePath = path.join(directory, file.name);
    const stats = await stat(filePath);
    
    if (stats.isDirectory()) {
      totalSize += await getDirectorySize(filePath);
    } else {
      totalSize += stats.size;
    }
  }
  
  return totalSize;
}

// Count actual announcements from file system
async function countAnnouncements(): Promise<number> {
  try {
    const baseDir = process.cwd();
    const sections = ['general', 'bulletins']; // Updated to use standardized folders
    let totalCount = 0;

    for (const section of sections) {
      const sectionPath = path.join(baseDir, 'public', 'uploads', section);
      console.log(`Checking directory: ${sectionPath}`);
      
      try {
        await fs.access(sectionPath);
        const files = await fs.readdir(sectionPath);
        console.log(`Files in ${section}:`, files);
        
        const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.gif'];
        
        const validFiles = files.filter(fileName => {
          const ext = path.extname(fileName).toLowerCase();
          return ALLOWED_EXTENSIONS.includes(ext);
        });
        
        console.log(`Valid files in ${section}:`, validFiles.length);
        totalCount += validFiles.length;
      } catch (error) {
        console.log(`Directory ${sectionPath} does not exist or is not accessible:`, error);
        // Directory doesn't exist, count 0 for this section
      }
    }
    
    console.log(`Total announcements count: ${totalCount}`);
    return totalCount;
  } catch (error) {
    console.error('Error counting announcements:', error);
    return 0;
  }
}

// Count actual events from database
async function countEvents(): Promise<number> {
  try {
    const db = getUsersDb();
    try {
      const result = db.prepare('SELECT COUNT(*) as count FROM events').get() as { count: number };
      return result?.count || 0;
    } finally {
      db.close();
    }
  } catch (error) {
    console.error('Error counting events:', error);
    return 0;
  }
}

// Count actual prayer requests from database
async function countPrayerRequests(): Promise<number> {
  try {
    const db = getUsersDb();
    try {
      const result = db.prepare('SELECT COUNT(*) as count FROM prayer_requests').get() as { count: number };
      return result?.count || 0;
    } finally {
      db.close();
    }
  } catch (error) {
    console.error('Error counting prayer requests:', error);
    return 0;
  }
}

export async function GET(request: Request) {
  try {
    // JWT authentication check
    const tokenData = getUserIdFromToken(request);
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Get user details from database to verify role
    const db = getUsersDb();
    let user;
    try {
      user = db.prepare('SELECT id, email, role FROM users WHERE id = ?').get(tokenData.userId || tokenData.id);
    } finally {
      db.close();
    }
    
    if (DEBUG) {
      console.log('Session in stats API:', {
        hasSession: !!tokenData,
        user: user,
        role: user?.role
      });
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin (allow both Admin and Super Admin)
    if (!['Admin', 'Super Admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get real stats from database and file system
    const statsDb = getUsersDb();
    let stats;
    try {
      // Count real data
      const [totalUsers, activeUsers, adminUsers, totalAnnouncements, totalSchedules, totalPrayerRequests] = await Promise.all([
        Promise.resolve(statsDb.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }),
        Promise.resolve(statsDb.prepare('SELECT COUNT(*) as count FROM users WHERE status = \'Active\'').get() as { count: number }),
        Promise.resolve(statsDb.prepare('SELECT COUNT(*) as count FROM users WHERE role IN (\'Admin\', \'Super Admin\')').get() as { count: number }),
        countAnnouncements(),
        countEvents(),
        countPrayerRequests()
      ]);
      
      // Get pending user reviews (new signups needing approval)
      const pendingNewUsers = statsDb.prepare('SELECT COUNT(*) as count FROM users WHERE status = \'Pending\'').get() as { count: number };
      const pendingUserReviews = pendingNewUsers?.count || 0;
      
      stats = {
        totalAnnouncements: totalAnnouncements,
        totalSchedules: totalSchedules,
        totalPrayerRequests: totalPrayerRequests,
        totalUsers: totalUsers.count,
        activeUsers: activeUsers.count,
        adminUsers: adminUsers.count,
        pendingUserReviews: pendingUserReviews,
        recentActivity: [
          {
            id: '1',
            type: 'announcement',
            title: 'Sunday Service Update',
            timestamp: '2 hours ago',
            status: 'published'
          },
          {
            id: '2',
            type: 'schedule',
            title: 'Bible Study Wednesday',
            timestamp: '5 hours ago',
            status: 'published'
          },
          {
            id: '3',
            type: 'prayer_request',
            title: 'Prayer for healing',
            timestamp: '1 day ago',
            status: 'pending'
          }
        ]
      };
    } finally {
      statsDb.close();
    }

    return NextResponse.json(stats);
    
  } catch (error) {
    console.error('Error getting admin stats:', error);
    return new NextResponse(
      `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500 }
    );
  }
}
