'use server';

import { auth } from '@/auth';
import { StatsData } from './types';

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function fetchStats(): Promise<{ data: StatsData | null; error: string | null }> {
  try {
    // Get the session on the server
    const session = await auth();
    
    if (!session) {
      return { data: null, error: 'Not authenticated. Please log in again.' };
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return { data: null, error: 'Insufficient permissions' };
    }

    // Get the base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const apiUrl = new URL('/api/admin/stats', baseUrl).toString();
    
    const response = await fetch(apiUrl, {
      next: { revalidate: 60 }, // Revalidate every minute
      headers: {
        'Content-Type': 'application/json',
        // Forward the session cookie
        Cookie: `next-auth.session-token=${session.sessionToken}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching stats:', response.status, errorText);
      return { 
        data: null, 
        error: `Error: ${response.status} ${response.statusText}` 
      };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Error in fetchStats:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch statistics' 
    };
  }
}
