import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

interface FileInfo {
  name: string;
  size: number;
  type: string;
  uploadPath: string;
  uploadDate: string;
  category: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    if (!category || !['general', 'bulletins'].includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be "general" or "bulletins"' },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', category);

    // Check if directory exists
    if (!existsSync(uploadDir)) {
      return NextResponse.json({
        files: []
      });
    }

    // Read directory contents
    const fileNames = await readdir(uploadDir);
    const files: FileInfo[] = [];

    for (const fileName of fileNames) {
      if (fileName === '.gitkeep') continue;

      const filePath = path.join(uploadDir, fileName);
      const stats = await stat(filePath);

      if (stats.isFile()) {
        // Determine file type based on extension
        const ext = path.extname(fileName).toLowerCase();
        let type = 'unknown';
        
        switch (ext) {
          case '.pdf':
            type = 'application/pdf';
            break;
          case '.doc':
            type = 'application/msword';
            break;
          case '.docx':
            type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            break;
          case '.jpg':
          case '.jpeg':
            type = 'image/jpeg';
            break;
          case '.png':
            type = 'image/png';
            break;
        }

        files.push({
          name: fileName,
          size: stats.size,
          type: type,
          uploadPath: `/uploads/${category}/${fileName}`,
          uploadDate: stats.mtime.toISOString(),
          category: category
        });
      }
    }

    // Sort by upload date (newest first)
    files.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

    return NextResponse.json({
      files: files
    });

  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
}
