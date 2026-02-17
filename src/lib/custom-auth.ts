import { cookies } from 'next/headers';

// Custom auth functions that work with the login API
export async function getCustomAuth() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token');
  
  if (!authToken?.value) {
    return null;
  }
  
  try {
    const sessionData = JSON.parse(authToken.value);
    
    // Check if session has expired
    if (sessionData.expires && new Date(sessionData.expires) < new Date()) {
      return null;
    }
    
    return sessionData;
  } catch (error) {
    console.error('Error parsing auth token:', error);
    return null;
  }
}

export function isAdmin(session: any) {
  return session?.user?.role === 'admin';
}
