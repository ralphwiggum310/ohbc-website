import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section') || 'announcements';
    
    // Map section to directory
    const sectionToDir = {
      'announcements': 'uploads/announcements',
      'bulletin': 'uploads/bulletin'
    };
    
    const dirName = sectionToDir[section as keyof typeof sectionToDir] || 'uploads/announcements';
    const uploadDir = path.join(process.cwd(), 'public', dirName);
    
    // Check if directory exists
    try {
      await fs.access(uploadDir);
    } catch {
      // Create directory if it doesn't exist
      await fs.mkdir(uploadDir, { recursive: true });
    }
    
    // Read files from directory
    const files = await fs.readdir(uploadDir);
    const fileList = [];
    
    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isFile()) {
        fileList.push({
          name: file,
          path: `/${dirName}/${file}`,
          size: stats.size,
          type: 'application/pdf', // Default to PDF, you can enhance this
          section: section,
          lastModified: stats.mtime.getTime()
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      files: fileList.sort((a, b) => b.lastModified - a.lastModified)
    });
    
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    
    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      );
    }
    
    // Security: Ensure the file is in the uploads directory
    const fullPath = path.join(process.cwd(), 'public', filePath);
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    if (!fullPath.startsWith(uploadDir)) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 403 }
      );
    }
    
    // Delete the file
    await fs.unlink(fullPath);
    
    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
