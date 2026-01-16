import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import path from 'path';
import { auth } from '@/auth';

// Enable debug logging in development
const DEBUG = process.env.NODE_ENV === 'development';

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

export async function GET() {
  try {
    // Verify authentication
    const session = await auth();
    
    if (DEBUG) {
      console.log('Session in stats API:', {
        hasSession: !!session,
        user: session?.user,
        role: (session?.user as any)?.role
      });
    }
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const user = session.user as { role?: string };
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const sections = ['general', 'weekly', 'quarterly'];
    const stats = {
      totalAnnouncements: 0,
      totalSize: 0,
      sections: {} as Record<string, { count: number; size: number }>,
      lastUpdated: new Date().toISOString()
    };

    // Process each section
    for (const section of sections) {
      const sectionPath = path.join(process.cwd(), 'public', 'uploads', 'announcements', section);
      
      try {
        const files = await readdir(sectionPath);
        const validFiles = files.filter(file => file !== '.gitkeep');
        const sectionSize = await getDirectorySize(sectionPath);
        
        stats.sections[section] = {
          count: validFiles.length,
          size: sectionSize
        };
        
        stats.totalAnnouncements += validFiles.length;
        stats.totalSize += sectionSize;
      } catch (error: any) {
        if (error.code !== 'ENOENT') {
          console.error(`Error reading ${section} directory:`, error);
        }
        stats.sections[section] = { count: 0, size: 0 };
      }
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
