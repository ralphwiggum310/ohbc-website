import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { stat, readdir } from 'fs/promises';
import { UPLOAD_CONFIG } from '../../../config/uploads';

type AnnouncementFile = {
  name: string;
  path: string;
  type: 'pdf' | 'image';
  size: number;
  modified: Date;
  section: 'quarterly' | 'general' | 'sunday_bulletins';
};

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.gif'];
const SECTIONS = ['quarterly', 'general', 'sunday_bulletins'] as const;

export async function GET() {
  try {
    // Use UPLOAD_CONFIG for consistent paths
    const baseDir = UPLOAD_CONFIG.BASE_DIR;
    
    // Ensure base directory exists
    try {
      await fs.access(baseDir);
    } catch (error) {
      console.error(`Base directory does not exist: ${baseDir}`, error);
      // Return empty sections if base directory doesn't exist
      return NextResponse.json({ 
        quarterly: [], 
        general: [], 
        sunday_bulletins: [] 
      });
    }

    // Process each section
    const sections: Record<typeof SECTIONS[number], AnnouncementFile[]> = {
      quarterly: [],
      general: [],
      sunday_bulletins: []
    };

    for (const section of SECTIONS) {
      // Map section to the correct directory name in UPLOAD_CONFIG
      const sectionDir = section === 'sunday_bulletins' 
        ? UPLOAD_CONFIG.DIRECTORIES.SUNDAY_BULLETINS 
        : UPLOAD_CONFIG.DIRECTORIES[section.toUpperCase() as 'QUARTERLY' | 'GENERAL'];
      
      const sectionPath = path.join(baseDir, sectionDir);
      
      // Skip if section directory doesn't exist
      try {
        await fs.access(sectionPath);
      } catch (error) {
        console.warn(`Section directory does not exist: ${sectionPath}`);
        continue;
      }
      
      try {
        const files = await fs.readdir(sectionPath);
        
        const sectionFiles = await Promise.all(
          files
            .filter(fileName => {
              const ext = path.extname(fileName).toLowerCase();
              return ALLOWED_EXTENSIONS.includes(ext);
            })
            .map(async (fileName) => {
              const filePath = path.join(sectionPath, fileName);
              const fileStat = await stat(filePath);
              const ext = path.extname(fileName).toLowerCase();
              
              return {
                name: fileName,
                path: `/uploads/announcements/${section}/${fileName}`,
                type: ext === '.pdf' ? 'pdf' as const : 'image' as const,
                size: fileStat.size,
                modified: fileStat.mtime,
                section
              };
            })
        );

        // Sort weekly section by date in filename (newest first)
        if (section === 'weekly') {
          sectionFiles.sort((a, b) => {
            // Extract dates from filenames (assuming format like "YYYY-MM-DD - Title.pdf")
            const dateA = a.name.match(/^(\d{4}-\d{1,2}-\d{1,2})/);
            const dateB = b.name.match(/^(\d{4}-\d{1,2}-\d{1,2})/);
            
            if (dateA && dateB) {
              return new Date(dateB[0]).getTime() - new Date(dateA[0]).getTime();
            }
            // Fallback to modified date if no date in filename
            return b.modified.getTime() - a.modified.getTime();
          });
        } else {
          // Sort other sections by modified date (newest first)
          sectionFiles.sort((a, b) => b.modified.getTime() - a.modified.getTime());
        }

        sections[section] = sectionFiles;
      } catch (error: unknown) {
        // Section directory doesn't exist yet, create it
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
          await fs.mkdir(sectionPath, { recursive: true });
          sections[section] = [];
        } else {
          console.error(`Error reading section ${section}:`, error);
        }
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
