import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string; // 'general' or 'bulletins'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!category || !['general', 'bulletins'].includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be "general" or "bulletins"' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', category);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Create a unique filename
    const timestamp = Date.now();
    const originalName = file.name;
    const fileExtension = path.extname(originalName);
    const baseName = path.basename(originalName, fileExtension);
    const uniqueFileName = `${baseName}_${timestamp}${fileExtension}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return file information
    return NextResponse.json({
      success: true,
      file: {
        name: uniqueFileName,
        originalName: originalName,
        size: file.size,
        type: file.type,
        category: category,
        uploadPath: `/uploads/${category}/${uniqueFileName}`,
        uploadDate: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const filename = searchParams.get('filename');

    if (!category || !filename) {
      return NextResponse.json(
        { error: 'Category and filename are required' },
        { status: 400 }
      );
    }

    if (!['general', 'bulletins'].includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), 'public', 'uploads', category, filename);

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Delete the file
    await unlink(filePath);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('File deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
