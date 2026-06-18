import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import path from 'path';
import { auth } from '@/auth';
import { UPLOAD_CONFIG } from '@/config/uploads';

type FileInfo = {
  name: string;
  path: string;
  size: number;
  lastModified: number;
};

export async function GET(request: Request) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user is admin
    const user = session.user as { role?: string };
    if (user.role !== 'admin') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    let section = searchParams.get('section');
    
    // Normalize section name (replace hyphens with underscores for consistency)
    if (section) {
      section = section.replace(/-/g, '_');
    }

    // Validate section
    const validSections = ['general', 'sunday_bulletins'];
      
    if (!section || !validSections.includes(section)) {
      return new NextResponse('Invalid section', { status: 400 });
    }

    // Get the correct directory path from UPLOAD_CONFIG
    let uploadDir: string;
    
    switch (section) {
      case 'general':
        uploadDir = UPLOAD_CONFIG.DIRECTORIES.ANNOUNCEMENTS;
        break;
      case 'sunday_bulletins':
        uploadDir = UPLOAD_CONFIG.DIRECTORIES.BULLETIN;
        break;
      default:
        return new NextResponse('Invalid section', { status: 400 });
    }
    
    // Construct the full directory path
    const dirPath = path.join(
      UPLOAD_CONFIG.BASE_DIR,
      uploadDir
    );
    
    console.log('Listing files in directory:', dirPath);
    
    try {
      // Read the directory
      const files = await readdir(dirPath);
      
      // Get file stats for each file
      const filePromises = files.map(async (file) => {
        if (file === '.gitkeep') return null; // Skip .gitkeep files
        
        const filePath = path.join(dirPath, file);
        const stats = await stat(filePath);
        
        return {
          name: file,
          path: `/${UPLOAD_CONFIG.BASE_DIR}/uploads/${section}/${file}`.replace(/\/+/g, '/'),
          size: stats.size,
          lastModified: stats.mtimeMs,
          section
        } as FileInfo;
      });

      // Filter out null values and sort by last modified (newest first)
      const fileList = (await Promise.all(filePromises))
        .filter(Boolean)
        .sort((a, b) => b!.lastModified - a!.lastModified);

      return NextResponse.json({ files: fileList });
      
    } catch (error: any) {
      // If directory doesn't exist, return empty array
      if (error.code === 'ENOENT') {
        return NextResponse.json({ files: [] });
      }
      throw error;
    }
    
  } catch (error) {
    console.error('Error listing files:', error);
    return new NextResponse(
      `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500 }
    );
  }
}

