import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { getCustomAuth, isAdmin } from '../../../../src/lib/custom-auth';
import type { NextRequest } from 'next/server';
import { UPLOAD_CONFIG, getFullUploadPath, getPublicUrl, ensureUploadDirs } from '../../../../src/config/uploads';

// Enable debug logging in development
const DEBUG = process.env.NODE_ENV === 'development';

// Helper function to log debug messages
function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log('[Upload API]', ...args);
  }
}

export async function POST(request: NextRequest) {
  debugLog('Received upload request');
  
  try {
    // Verify authentication
    const session = await getCustomAuth();
    if (!session) {
      debugLog('No session found');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user is admin
    if (!isAdmin(session)) {
      debugLog('User is not admin');
      return new NextResponse('Forbidden', { status: 403 });
    }

    debugLog('User authenticated, processing form data');
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    let section = formData.get('section') as string | null;
    
    // Normalize section name (replace hyphens with underscores for consistency)
    if (section) {
      section = section.replace(/-/g, '_');
    }

    debugLog('Form data received:', { 
      hasFile: !!file, 
      section,
      fileInfo: file ? {
        name: file.name,
        type: file.type,
        size: file.size
      } : null
    });

    if (!file || !section) {
      debugLog('Missing file or section', { file: !!file, section });
      return new NextResponse('Missing file or section', { status: 400 });
    }
    
    // Validate section
    const validSections = ['announcements', 'bulletin'];
    const sectionKey = section.toUpperCase() as keyof typeof UPLOAD_CONFIG.DIRECTORIES;
      
    if (!section || !validSections.includes(section)) {
      debugLog('Invalid section:', section);
      return new NextResponse('Invalid section. Must be one of: ' + validSections.join(', '), { status: 400 });
    }

    // Validate file type
    const allowedTypes = process.env.NEXT_PUBLIC_UPLOAD_ALLOWED_TYPES?.split(',') || 
      UPLOAD_CONFIG.ALLOWED_TYPES;
    
    // Get file extension for additional validation
    const fileExt = path.extname(file.name).toLowerCase().slice(1);
    const allowedExtensions = allowedTypes.map(t => t.split('/').pop());
    
    if (!file.type || (!allowedTypes.includes(file.type as any) && !allowedExtensions.includes(fileExt))) {
      debugLog('Invalid file type or extension:', { type: file.type, ext: fileExt });
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = process.env.NEXT_PUBLIC_UPLOAD_MAX_SIZE ? 
      parseInt(process.env.NEXT_PUBLIC_UPLOAD_MAX_SIZE, 10) : 
      UPLOAD_CONFIG.MAX_FILE_SIZE;
      
    if (file.size > maxSize) {
      debugLog('File too large:', file.size);
      return NextResponse.json(
        { error: `File is too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB.` },
        { status: 400 }
      );
    }

    debugLog('File validation passed, processing upload');
    
    // Ensure upload directories exist
    await ensureUploadDirs();
    
    // Get the upload directory for this section
    const uploadDir = getFullUploadPath(sectionKey);
    debugLog('Using upload directory:', uploadDir);
    
    // Sanitize filename while allowing common special characters
    const sanitizedFilename = file.name
      // Replace any control characters (ASCII 0-31) and these specific problematic characters: \ / : * ? " < > |
      .replace(/[\x00-\x1f\x7f\/\\:*?"<>|]/g, '')
      // Normalize spaces and trim
      .replace(/\s+/g, ' ').trim();
      
    // Get file extension and name
    const ext = path.extname(sanitizedFilename);
    const nameWithoutExt = path.basename(sanitizedFilename, ext)
      // Replace any remaining problematic sequences with underscore
      .replace(/\.{2,}/g, '.')  // Replace multiple dots with single dot
      .replace(/^[\s.]+|[\s.]+$/g, ''); // Trim dots and spaces from start/end
    
    // Create final filename with timestamp to prevent collisions
    const safeName = nameWithoutExt || 'file';
    const fileName = `${safeName}_${Date.now()}${ext}`;

    // Write file to disk
    const filePath = path.join(uploadDir, fileName);
    debugLog('Writing file to:', filePath);
    
    // Convert file to buffer and write
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, fileBuffer);

    debugLog('File written successfully');
    
    // Return success response with file information
    return NextResponse.json({ 
      success: true, 
      fileName,
      filePath: path.relative(process.cwd(), path.join(uploadDir, fileName)),
      publicUrl: getPublicUrl(sectionKey, fileName),
      message: 'File uploaded successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    debugLog('Error details:', error);
    return new NextResponse(
      `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500 }
    );
  }
}

