import { NextResponse } from 'next/server';
import { unlink, access } from 'fs/promises';
import path from 'path';
import { auth } from '@/auth';
import type { NextRequest } from 'next/server';
import { UPLOAD_CONFIG } from '@/config/uploads';

// Enable debug logging in development
const DEBUG = process.env.NODE_ENV === 'development';

// Helper function to log debug messages
function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log('[Delete File API]', ...args);
  }
}

export async function DELETE(request: NextRequest) {
  debugLog('Received delete file request');
  
  try {
    // Verify authentication
    const session = await auth();
    if (!session) {
      debugLog('No session found');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user is admin
    const user = session.user as { role?: string };
    if (user.role !== 'admin') {
      debugLog('User is not admin');
      return new NextResponse('Forbidden', { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    let section = searchParams.get('section');

    debugLog('Delete request received:', { filePath, section });

    if (!filePath || !section) {
      debugLog('Missing file path or section');
      return new NextResponse('Missing file path or section', { status: 400 });
    }

    // Normalize section name (replace hyphens with underscores)
    section = section.replace(/-/g, '_');
    debugLog('Normalized section:', section);
    
    // Get the correct base directory for the section
    let baseDir: string;
    
    switch (section) {
      case 'general':
        baseDir = UPLOAD_CONFIG.DIRECTORIES.GENERAL;
        break;
      case 'quarterly':
        baseDir = UPLOAD_CONFIG.DIRECTORIES.QUARTERLY;
        break;
      case 'sunday_bulletins':
        baseDir = UPLOAD_CONFIG.DIRECTORIES.SUNDAY_BULLETINS;
        break;
      default:
        debugLog('Invalid section:', section);
        return new NextResponse('Invalid section', { status: 400 });
    }
    
    // Construct the full directory path
    const fullDirPath = path.join(UPLOAD_CONFIG.BASE_DIR, baseDir);
    debugLog('Full directory path:', fullDirPath);

    // Prevent directory traversal
    if (filePath.includes('..') || section.includes('..')) {
      debugLog('Invalid path or section');
      return new NextResponse('Invalid path', { status: 400 });
    }

    // Validate section
    const validSections = UPLOAD_CONFIG.DIRECTORIES.ANNOUNCEMENTS ? 
      ['general', 'quarterly', 'sunday_bulletins'] : [];
      
    if (!validSections.includes(section)) {
      debugLog('Invalid section:', section, 'Valid sections:', validSections);
      return new NextResponse(`Invalid section. Must be one of: ${validSections.join(', ')}`, { status: 400 });
    }

    // Construct the full file path
    const fileName = path.basename(filePath);
    const fullPath = path.join(
      process.cwd(),
      'public', // Hardcode 'public' since UPLOAD_CONFIG.BASE_DIR is relative to public
      'uploads',
      'announcements',
      section,
      fileName
    );
    
    debugLog('Full file path for deletion:', fullPath);
    
    // Verify the file exists
    try {
      await access(fullPath);
      debugLog('File exists, proceeding with deletion');
    } catch (error) {
      debugLog('File does not exist or is not accessible:', fullPath);
      return new NextResponse('File not found', { status: 404 });
    }
    
    try {
      await unlink(fullPath);
      debugLog('File deleted successfully');
      
      return NextResponse.json({ 
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        debugLog('File not found:', fullPath);
        return new NextResponse('File not found', { status: 404 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Delete file error:', error);
    debugLog('Error details:', error);
    return new NextResponse(
      `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500 }
    );
  }
}
