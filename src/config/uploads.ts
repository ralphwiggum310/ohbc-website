import path from 'path';

// In production, set UPLOAD_BASE_DIR env var to the absolute path of the public folder
// e.g. UPLOAD_BASE_DIR=/var/www/ohbc/app/public
const BASE_DIR = process.env.UPLOAD_BASE_DIR
  ? path.resolve(process.env.UPLOAD_BASE_DIR)
  : path.join(process.cwd(), 'public');

export const UPLOAD_CONFIG = {
  BASE_DIR,

  DIRECTORIES: {
    ANNOUNCEMENTS: 'uploads/announcements',
    BULLETIN:      'uploads/bulletins',
  },

  ALLOWED_EXTENSIONS: ['.pdf', '.jpg', '.jpeg', '.png', '.gif'],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
};

export function getFullUploadPath(category: string, filename: string): string {
  const subdir = UPLOAD_CONFIG.DIRECTORIES[category as keyof typeof UPLOAD_CONFIG.DIRECTORIES]
    ?? `uploads/${category}`;
  return path.join(BASE_DIR, subdir, filename);
}

export function getPublicUrl(category: string, filename: string): string {
  const subdir = UPLOAD_CONFIG.DIRECTORIES[category as keyof typeof UPLOAD_CONFIG.DIRECTORIES]
    ?? `uploads/${category}`;
  return `/${subdir}/${filename}`;
}

export async function ensureUploadDirs(): Promise<void> {
  const { mkdir } = await import('fs/promises');
  for (const subdir of Object.values(UPLOAD_CONFIG.DIRECTORIES)) {
    await mkdir(path.join(BASE_DIR, subdir), { recursive: true });
  }
}
