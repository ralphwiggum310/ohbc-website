import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { stat, readdir } from 'fs/promises';

type AnnouncementFile = {
  name: string;
  path: string;
  type: 'pdf' | 'image';
  size: number;
  modified: Date;
  section: 'general' | 'bulletins';
};

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.gif'];
const SECTIONS = ['general', 'bulletins'] as const;

export async function GET() {
  try {
    // Use current working directory for both dev and production
    const baseDir = process.cwd();
    
    // Process each section
    const sections: Record<typeof SECTIONS[number], AnnouncementFile[]> = {
      general: [],
      bulletins: []
    };

    for (const section of SECTIONS) {
      // Map section to standardized directory structure
      const sectionPath = path.join(baseDir, 'public', 'uploads', section);
      
      // Create directory if it doesn't exist
      try {
        await fs.access(sectionPath);
      } catch {
        await fs.mkdir(sectionPath, { recursive: true });
      }
      
      try {
        const files = await fs.readdir(sectionPath);
        
        const sectionFiles = await Promise.all(
          files.filter(fileName => {
              const ext = path.extname(fileName).toLowerCase();
              return ALLOWED_EXTENSIONS.includes(ext);
            })
            .map(async (fileName) => {
              const filePath = path.join(sectionPath, fileName);
              const fileStat = await stat(filePath);
              const ext = path.extname(fileName).toLowerCase();
              
              return {
                name: fileName,
                path: `/uploads/${section}/${fileName}`,
                type: ext === '.pdf' ? 'pdf' as const : 'image' as const,
                size: fileStat.size,
                modified: fileStat.mtime,
                section
              };
            })
        );

        // Sort by modified date (newest first)
        sectionFiles.sort((a, b) => b.modified.getTime() - a.modified.getTime());
        sections[section] = sectionFiles;
        
      } catch (error: unknown) {
        console.error(`Error reading section ${section}:`, error);
        sections[section] = [];
      }
    }
    
    return NextResponse.json(sections);
    
  } catch (error: unknown) {
    console.error('Error reading announcements directory:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        error: 'Failed to load announcements',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

