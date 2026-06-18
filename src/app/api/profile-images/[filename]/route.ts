import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    if (!filename) {
      return NextResponse.json({ error: 'Filename required' }, { status: 400 });
    }

    // Prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'data', 'users', 'profile_images', filename);

    try {
      await fs.access(filePath);
      const imageBuffer = await fs.readFile(filePath);

      const ext = path.extname(filename).toLowerCase();
      const contentTypeMap: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
      };
      const contentType = contentTypeMap[ext] ?? 'image/jpeg';

      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    } catch {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
