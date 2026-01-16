// File upload configuration
export const UPLOAD_CONFIG = {
  // Base directory for all uploads
  // In production, this will be /var/www/ohbc_website/public on the host server
  // In development, it will be public relative to project root
  BASE_DIR: process.env.NODE_ENV === 'production' 
    ? '/var/www/ohbc_website/public' 
    : 'public',
  
  // Subdirectories for different types of uploads
  DIRECTORIES: {
    // These are relative to BASE_DIR/uploads
    GENERAL: 'uploads/general',
    QUARTERLY: 'uploads/quarterly',
    SUNDAY_BULLETINS: 'uploads/sunday_bulletins',
  },
  
  // Allowed file types for uploads
  ALLOWED_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
  ],
  
  // Maximum file size in bytes (10MB)
  MAX_FILE_SIZE: 10 * 1024 * 1024,
} as const;

// Helper function to get full upload path
export function getUploadPath(type: keyof typeof UPLOAD_CONFIG.DIRECTORIES, section: string): string {
  return `${UPLOAD_CONFIG.BASE_DIR}/${UPLOAD_CONFIG.DIRECTORIES[type]}/${section}`;
}

// Helper function to get public URL for uploaded files
export function getPublicUrl(type: keyof typeof UPLOAD_CONFIG.DIRECTORIES, filename: string): string {
  return `/uploads/${UPLOAD_CONFIG.DIRECTORIES[type]}/${filename}`;
}

// Get full filesystem path for uploads
export function getFullUploadPath(type: keyof typeof UPLOAD_CONFIG.DIRECTORIES): string {
  return `${UPLOAD_CONFIG.BASE_DIR}/${UPLOAD_CONFIG.DIRECTORIES[type]}`;
}

// Ensure upload directories exist
export async function ensureUploadDirs() {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  try {
    for (const dir of Object.values(UPLOAD_CONFIG.DIRECTORIES)) {
      // In production, UPLOAD_CONFIG.BASE_DIR is already the full path
      const fullPath = process.env.NODE_ENV === 'production' 
        ? path.join(UPLOAD_CONFIG.BASE_DIR, dir)
        : path.join(process.cwd(), UPLOAD_CONFIG.BASE_DIR, dir);
      
      console.log(`Creating directory: ${fullPath}`);
      await fs.mkdir(fullPath, { recursive: true });
    }
  } catch (error) {
    console.error('Error creating upload directories:', error);
    throw error;
  }
}
