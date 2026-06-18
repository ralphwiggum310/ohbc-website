'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearCookiesPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear all cookies
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    });

    // Clear localStorage
    localStorage.clear();
    
    // Redirect to home after clearing
    setTimeout(() => {
      router.push('/');
    }, 1000);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Clearing session...
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          You will be redirected to the home page shortly.
        </p>
      </div>
    </div>
  );
}
