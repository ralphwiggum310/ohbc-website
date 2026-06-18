'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Wait a moment for cookies to be available
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const response = await fetch('/api/auth/verify');
        const data = await response.json();
        
        if (data.authenticated) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.replace('/auth/signin');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        router.replace('/auth/signin');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
