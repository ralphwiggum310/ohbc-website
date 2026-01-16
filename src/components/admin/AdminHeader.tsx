'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminHeader() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({
      redirect: false,
      callbackUrl: '/api/auth/signin'
    });
    router.push('/api/auth/signin');
    router.refresh();
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <button
          onClick={handleSignOut}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
