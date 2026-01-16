import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { stat } from 'fs/promises';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    
    if (!filePath) {
      return new NextResponse('File path is required', { status: 400 });
    }

    // Prevent directory traversal attacks
    if (filePath.includes('..') || filePath.startsWith('/') || filePath.startsWith('\\')) {
      return new NextResponse('Invalid file path', { status: 400 });
    }

    // Construct the full file path
    const fullPath = path.join(process.cwd(), 'public', filePath);
    
    try {
      // Check if file exists and is accessible
      await stat(fullPath);
    } catch (error) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Read the file
    const fileContent = await readFile(fullPath);
    
    // Determine content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (['.jpg', '.jpeg'].includes(ext)) {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.gif') {
      contentType = 'image/gif';
    }

    // Return the file with appropriate headers
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${path.basename(filePath)}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
